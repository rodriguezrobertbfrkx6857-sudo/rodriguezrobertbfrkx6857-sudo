import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { checkCode, type WorkState } from "../../shared/cooperation";
import { readSlot } from "./scoped-files";

export function verifyTask(root: string, t: WorkState, inputs: Map<string, string>): { ok: boolean; reason?: string } {
	const a = t.artifacts[0];
	if (!a || !existsSync(a.path)) return { ok: false, reason: "ARTIFACT_MISSING" };
	if (!t.runId || a.taskId !== t.taskId || a.runId !== t.runId || a.format !== t.format)
		return { ok: false, reason: "ARTIFACT_IDENTITY_MISMATCH" };
	let text: string;
	try {
		text = readSlot(root, a.path).toString("utf8");
	} catch {
		return { ok: false, reason: "UNSAFE_ARTIFACT" };
	}
	if (
		createHash("sha256").update(text).digest("hex") !== a.sha256 ||
		!t.toolReceipts.some((r) => r.name === "artifact_save" && r.success && matchesHashReceipt(r.result, a.sha256))
	)
		return { ok: false, reason: "RECEIPT_HASH_MISMATCH" };
	if (
		![...inputs.keys()].every((reference) =>
			t.toolReceipts.some(
				(r) => r.name === "workspace_read" && r.success && (r.args as { reference?: string }).reference === reference,
			),
		)
	)
		return { ok: false, reason: "MISSING_ACTUAL_INPUT_READ" };
	for (const [reference, file] of inputs) {
		try {
			const actual = readSlot(root, file);
			const receipt = t.toolReceipts.find(
				(r) => r.name === "workspace_read" && r.success && (r.args as { reference?: string }).reference === reference,
			);
			if (
				!receipt ||
				createHash("sha256").update(actual).digest("hex") !== createHash("sha256").update(receipt.result).digest("hex")
			)
				return { ok: false, reason: "STALE_INPUT_RECEIPT" };
		} catch {
			return { ok: false, reason: "UNSAFE_INPUT" };
		}
	}
	if (!t.verificationCriteria.every((needle) => text.includes(needle)))
		return { ok: false, reason: "MISSING_REQUIRED_CONTENT" };
	if (
		t.requiredTools.includes("check_code") &&
		!t.toolReceipts.some((r) => r.name === "check_code" && r.success && r.result.includes('"ok":true'))
	)
		return { ok: false, reason: "ACTUAL_CODE_CHECK_REQUIRED" };
	if (t.format === "code" && !checkCode(text).ok) return { ok: false, reason: "RESTRICTED_CODE_TEST_FAILED" };
	if (t.format === "csv") {
		const lines = text.trim().split(/\r?\n/);
		if (
			text.includes('"') ||
			lines.length < 2 ||
			lines.some((line) => line.split(",").length !== lines[0]!.split(",").length)
		)
			return { ok: false, reason: "INVALID_CSV" };
	}
	return { ok: true };
}

function matchesHashReceipt(value: string, hash: string) {
	try {
		const r = JSON.parse(value);
		return r !== null && typeof r === "object" && Object.keys(r).length === 1 && r.sha256 === hash;
	} catch {
		return false;
	}
}
