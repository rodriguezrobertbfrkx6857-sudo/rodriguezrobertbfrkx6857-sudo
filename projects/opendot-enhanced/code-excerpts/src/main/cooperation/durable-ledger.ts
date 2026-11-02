import type { DatabaseSync } from "node:sqlite";
import type { CoopProject } from "../../shared/cooperation";

export interface Lease { owner: string; token: number }

const goalStates: Record<string, string> = { DRAFT: "DRAFT", AWAITING_PLAN_APPROVAL: "APPROVAL_REQUIRED", RUNNING: "RUNNING", PAUSING: "RUNNING", PAUSED: "WAITING_USER", WAITING_USER: "WAITING_USER", WAITING_EVENT: "WAITING_EVENT", WAITING_RETRY: "WAITING_RETRY", VERIFIED: "VERIFIED", FAILED: "FAILED", CANCELLED: "CANCELLED", RECONCILIATION: "NEEDS_RECONCILIATION" };

/** Project snapshot remains authoritative; ledger indexes, journal and checkpoint commit atomically with it. */
export class DurableLedger {
	constructor(private db: DatabaseSync, private now = Date.now) {
		db.exec(`PRAGMA busy_timeout=2000;
		CREATE TABLE IF NOT EXISTS goal_ledger(project_id TEXT PRIMARY KEY,state TEXT NOT NULL,checkpoint_seq INTEGER NOT NULL,updated_at INTEGER NOT NULL);
		CREATE TABLE IF NOT EXISTS run_journal(project_id TEXT NOT NULL,seq INTEGER NOT NULL,event TEXT NOT NULL,PRIMARY KEY(project_id,seq));
		CREATE TABLE IF NOT EXISTS wake_queue(project_id TEXT PRIMARY KEY,due_at INTEGER NOT NULL,reason TEXT NOT NULL);
		CREATE TABLE IF NOT EXISTS run_leases(project_id TEXT PRIMARY KEY,owner TEXT NOT NULL,pid INTEGER NOT NULL,token INTEGER NOT NULL,expires_at INTEGER NOT NULL);`);
	}
	activeLease(id: string): boolean {
		const row = this.db.prepare("SELECT pid,expires_at FROM run_leases WHERE project_id=?").get(id) as { pid: number; expires_at: number } | undefined;
		if (!row || row.expires_at <= this.now()) return false;
		try { process.kill(row.pid, 0); return true; }
		catch (error) { return (error as NodeJS.ErrnoException).code !== "ESRCH"; }
	}
	claim(id: string, owner: string): number {
		this.db.exec("BEGIN IMMEDIATE");
		try {
			if (this.activeLease(id)) throw Error("RUN_LEASE_BUSY");
			const row = this.db.prepare("SELECT token FROM run_leases WHERE project_id=?").get(id) as { token: number } | undefined;
			const token = (row?.token ?? 0) + 1;
			this.db.prepare("INSERT INTO run_leases VALUES(?,?,?,?,?) ON CONFLICT(project_id) DO UPDATE SET owner=excluded.owner,pid=excluded.pid,token=excluded.token,expires_at=excluded.expires_at").run(id, owner, process.pid, token, this.now() + 30_000);
			this.db.exec("COMMIT"); return token;
		} catch (error) { this.db.exec("ROLLBACK"); throw error; }
	}
	fence(id: string, owner: string, token: number): void {
		const result = this.db.prepare("UPDATE run_leases SET expires_at=? WHERE project_id=? AND owner=? AND token=? AND expires_at>?").run(this.now() + 30_000, id, owner, token, this.now());
		if (result.changes !== 1) throw Error("STALE_FENCING_TOKEN");
	}
	release(id: string, owner: string, token: number) { this.db.prepare("UPDATE run_leases SET expires_at=0 WHERE project_id=? AND owner=? AND token=?").run(id, owner, token); }
	/** Hold the SQLite writer lock through a synchronous local effect: a rival cannot
	 * claim between fencing and the write. Never pass an async callback here. */
	guarded<T>(id: string, lease: Lease, effect: () => T): T {
		this.db.exec("BEGIN IMMEDIATE");
		try {
			this.fence(id, lease.owner, lease.token);
			const result = effect();
			this.db.exec("COMMIT");
			return result;
		} catch (error) { this.db.exec("ROLLBACK"); throw error; }
	}
	checkpoint(p: CoopProject, lease?: Lease, expectedSnapshot?: string | null) {
		this.db.exec("BEGIN IMMEDIATE");
		try {
			// Both ownership and optimistic snapshot checks are inside the write lock.
			if (lease) this.fence(p.id, lease.owner, lease.token);
			else if (this.activeLease(p.id)) throw Error("RUN_LEASE_BUSY");
			if (expectedSnapshot !== undefined) {
				const current = this.db.prepare("SELECT data FROM projects WHERE id=?").get(p.id) as { data: string } | undefined;
				if ((current?.data ?? null) !== expectedSnapshot) throw Error("STALE_PROJECT_SNAPSHOT");
			}
			this.db.prepare("INSERT INTO projects(id,data) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data").run(p.id, JSON.stringify(p));
			this.db.prepare("INSERT INTO goal_ledger VALUES(?,?,?,?) ON CONFLICT(project_id) DO UPDATE SET state=excluded.state,checkpoint_seq=excluded.checkpoint_seq,updated_at=excluded.updated_at").run(p.id, goalStates[p.status] ?? "NEEDS_RECONCILIATION", p.events.length, this.now());
			const insert = this.db.prepare("INSERT OR IGNORE INTO run_journal VALUES(?,?,?)");
			for (const event of p.events) insert.run(p.id, event.seq, JSON.stringify(event));
			if (p.nextWakeAt && ["WAITING_EVENT", "WAITING_RETRY"].includes(p.status)) this.db.prepare("INSERT INTO wake_queue VALUES(?,?,?) ON CONFLICT(project_id) DO UPDATE SET due_at=excluded.due_at,reason=excluded.reason").run(p.id, p.nextWakeAt, p.status === "WAITING_RETRY" ? "resource-retry" : "user-scheduled-resume");
			else this.db.prepare("DELETE FROM wake_queue WHERE project_id=?").run(p.id);
			this.db.exec("COMMIT");
		} catch (error) { this.db.exec("ROLLBACK"); throw error; }
	}
	due(): string[] { return (this.db.prepare("SELECT project_id FROM wake_queue WHERE due_at<=? ORDER BY due_at LIMIT 8").all(this.now()) as unknown as { project_id: string }[]).map(row => row.project_id); }
}
