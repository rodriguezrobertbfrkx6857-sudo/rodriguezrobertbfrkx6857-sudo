import { DatabaseSync } from "node:sqlite";
import { afterEach, expect, it } from "vitest";
import { DurableLedger } from "./durable-ledger";
import type { CoopProject } from "../../shared/cooperation";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
const databases: DatabaseSync[] = [];
afterEach(() => { for (const db of databases.splice(0)) db.close(); });
function fixture() {
	const db = new DatabaseSync(":memory:"); databases.push(db);
	db.exec("CREATE TABLE projects(id TEXT PRIMARY KEY,data TEXT NOT NULL)");
	let now = 0; const ledger = new DurableLedger(db, () => now);
	const p = { id: "p", status: "PAUSED", events: [{ seq: 1, type: "created", time: "now", data: {} }], effects: [] } as unknown as CoopProject;
	return { db, ledger, p, advance: () => { now += 30_001; } };
}
it("commits project, goal state and deduplicated journal in one checkpoint", () => {
	const { db, ledger, p } = fixture(); ledger.checkpoint(p); ledger.checkpoint(p);
	expect(db.prepare("SELECT COUNT(*) AS n FROM run_journal").get()).toMatchObject({ n: 1 });
	expect(db.prepare("SELECT state FROM goal_ledger").get()).toMatchObject({ state: "WAITING_USER" });
});
it("indexes a reviewer waiting for a user decision as WAITING_USER rather than reconciliation", () => {
	const { db, ledger, p } = fixture(); ledger.checkpoint({ ...p, status: "WAITING_USER" });
	expect(db.prepare("SELECT state FROM goal_ledger").get()).toMatchObject({ state: "WAITING_USER" });
});
it("rolls back partial project and journal writes after a SQLite failure", () => {
	const { db, ledger, p } = fixture(); ledger.checkpoint(p);
	db.exec("CREATE TRIGGER fail_insert BEFORE INSERT ON run_journal BEGIN SELECT RAISE(ABORT,'injected_disk_failure'); END");
	expect(() => ledger.checkpoint({ ...p, status: "VERIFIED" })).toThrow("injected_disk_failure");
	expect(JSON.parse((db.prepare("SELECT data FROM projects").get() as {data:string}).data).status).toBe("PAUSED");
});
it("only one recovery owner can hold a lease; stale fencing token cannot renew or release new owner", () => {
	const { ledger, advance } = fixture(); const first = ledger.claim("p", "a");
	expect(() => ledger.claim("p", "b")).toThrow("LEASE_BUSY");
	advance(); const second = ledger.claim("p", "b"); expect(second).toBe(first + 1);
	expect(() => ledger.fence("p", "a", first)).toThrow("FENCING");
	ledger.release("p", "a", first); expect(ledger.activeLease("p")).toBe(true);
	ledger.release("p", "b", second); expect(ledger.activeLease("p")).toBe(false);
});
it("persists a due wake and removes it when a goal is cancelled", () => {
	const { ledger, p, advance } = fixture();
	ledger.checkpoint({ ...p, status: "WAITING_EVENT", nextWakeAt: 10 }); expect(ledger.due()).toEqual([]);
	advance(); expect(ledger.due()).toEqual(["p"]);
	ledger.checkpoint({ ...p, status: "CANCELLED" }); expect(ledger.due()).toEqual([]);
});
it("rejects stale owner checkpoint atomically after takeover, including journal and wakes", () => {
	const { db, ledger, p, advance } = fixture();
	ledger.checkpoint(p);
	const a = { owner: "a", token: ledger.claim(p.id, "a") };
	advance(); const b = { owner: "b", token: ledger.claim(p.id, "b") };
	ledger.checkpoint({ ...p, status: "VERIFIED" }, b);
	expect(() => ledger.checkpoint({ ...p, status: "WAITING_EVENT", nextWakeAt: 1 }, a)).toThrow("FENCING");
	expect(JSON.parse((db.prepare("SELECT data FROM projects").get() as { data: string }).data).status).toBe("VERIFIED");
	expect(ledger.due()).toEqual([]);
});
it("blocks unleased writers and stale idle snapshots without overwriting a newer checkpoint", () => {
	const { db, ledger, p } = fixture(); ledger.checkpoint(p);
	const before = JSON.stringify(p), lease = { owner: "a", token: ledger.claim(p.id, "a") };
	expect(() => ledger.checkpoint(p)).toThrow("LEASE_BUSY");
	ledger.checkpoint({ ...p, status: "VERIFIED" }, lease, before);
	ledger.release(p.id, lease.owner, lease.token);
	expect(() => ledger.checkpoint(p, undefined, before)).toThrow("STALE_PROJECT");
	expect(db.prepare("SELECT state FROM goal_ledger").get()).toMatchObject({ state: "VERIFIED" });
});
it("never invokes a local effect with an expired or superseded token", () => {
	const { ledger, p, advance } = fixture(); const lease = { owner: "a", token: ledger.claim(p.id, "a") };
	let writes = 0;
	ledger.guarded(p.id, lease, () => { writes++; });
	advance();
	expect(() => ledger.guarded(p.id, lease, () => { writes++; })).toThrow("FENCING");
	ledger.claim(p.id, "b");
	expect(() => ledger.guarded(p.id, lease, () => { writes++; })).toThrow("FENCING");
	expect(writes).toBe(1);
});
it("holds the writer lock across the local effect against a real competing process", () => {
	const root = mkdtempSync(join(tmpdir(), "lease-lock-")), file = join(root, "test.db");
	const db = new DatabaseSync(file); db.exec("CREATE TABLE projects(id TEXT PRIMARY KEY,data TEXT NOT NULL)");
	try {
		const ledger = new DurableLedger(db), lease = { owner: "a", token: ledger.claim("p", "a") };
		ledger.guarded("p", lease, () => {
			const rival = spawnSync(process.execPath, ["-e", `const {DatabaseSync}=require('node:sqlite'); const db=new DatabaseSync(process.argv[1]); db.exec('PRAGMA busy_timeout=20; BEGIN IMMEDIATE');`, file], { encoding: "utf8" });
			expect(rival.status).not.toBe(0);
			expect(rival.stderr).toContain("database is locked");
		});
		expect(ledger.activeLease("p")).toBe(true);
	} finally { db.close(); rmSync(root, { recursive: true }); }
});
