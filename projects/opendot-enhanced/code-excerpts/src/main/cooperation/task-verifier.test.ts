import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { it, expect } from "vitest";
import { verifyTask } from "./task-verifier";
import type { WorkState } from "../../shared/cooperation";
it.each([
	"valid",
	"failed-read",
	"changed-input",
	"changed-artifact",
	"missing-content",
	"old-run",
	"wrong-task",
	"wrong-format",
	"fake-receipt",
	"quoted-csv",
])("verifies actual evidence: %s", (kind) => {
	const root = mkdtempSync(join(tmpdir(), "phase3-verify-"));
	try {
		const artifact = join(root, "artifact.md"),
			input = join(root, "input.txt"),
			content = "[ref:1] exact fact";
		writeFileSync(artifact, content);
		writeFileSync(input, content);
		const hash = createHash("sha256").update(content).digest("hex");
		const task = {
			taskId: "work",
			runId: "run-current",
			artifacts: [{ path: artifact, sha256: hash, taskId: "work", runId: "run-current", format: "markdown" }],
			verificationCriteria: ["exact fact"],
			format: "markdown",
			requiredTools: [],
			toolReceipts: [
				{ name: "artifact_save", success: true, result: JSON.stringify({ sha256: hash }) },
				{
					name: "workspace_read",
					success: kind !== "failed-read",
					args: { reference: "input:source" },
					result: content,
				},
			],
		} as unknown as WorkState;
		if (kind === "old-run") task.artifacts[0]!.runId = "old";
		if (kind === "wrong-task") task.artifacts[0]!.taskId = "other";
		if (kind === "wrong-format") task.artifacts[0]!.format = "code";
		if (kind === "fake-receipt") task.toolReceipts[0]!.result = "claimed " + hash;
		if (kind === "quoted-csv") {
			task.format = "csv";
			task.artifacts[0]!.format = "csv";
			const csv = 'name,value\n"a,b",2';
			writeFileSync(artifact, csv);
			const h = createHash("sha256").update(csv).digest("hex");
			task.artifacts[0]!.sha256 = h;
			task.toolReceipts[0]!.result = JSON.stringify({ sha256: h });
			task.verificationCriteria = ["name"];
		}
		if (kind === "changed-input") writeFileSync(input, "new fact");
		if (kind === "changed-artifact") writeFileSync(artifact, "new artifact");
		if (kind === "missing-content") task.verificationCriteria = ["not present"];
		expect(verifyTask(root, task, new Map([["input:source", input]])).ok).toBe(kind === "valid");
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});
