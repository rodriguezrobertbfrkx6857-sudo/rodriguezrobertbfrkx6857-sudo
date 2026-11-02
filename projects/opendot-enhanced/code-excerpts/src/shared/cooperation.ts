import { z } from "zod";

export const safeId = z
	.string()
	.regex(/^[a-z][a-z0-9_-]{0,39}$/)
	.refine(
		(id) => !/^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i.test(id),
		"Windows reserved name",
	);
export const WorkSchema = z
	.object({
		taskId: safeId,
		goal: z.string().min(4).max(1500),
		requirements: z.array(z.string().max(200)).max(12).default([]),
		assignedDotId: z.string().regex(/^dot_[A-Za-z0-9_-]+$/),
		runtimeId: z.literal("pi").default("pi"),
		dependencies: z.array(safeId).max(8).default([]),
		inputs: z
			.array(z.string().regex(/^(input|task):[a-z][a-z0-9_-]{0,39}$/))
			.max(12),
		format: z.enum(["markdown", "csv", "code"]),
		verificationCriteria: z.array(z.string().min(1).max(100)).min(1).max(12),
		requiredTools: z
			.array(z.enum(["workspace_read", "artifact_save", "check_code"]))
			.max(3),
		skillIds: z.array(z.string().max(64)).max(4).default([]),
		retryPolicy: z
			.object({ maxCorrections: z.number().int().min(0).max(1) })
			.default({ maxCorrections: 1 }),
	})
	.strict();
export const PlanSchema = z
	.object({
		tasks: z.array(WorkSchema).min(1).max(8),
		concurrency: z.number().int().min(1).max(2).default(1),
	})
	.strict();
export const CreateCoopSchema = z
	.object({
		acceptanceCriteria: z.array(z.string().min(1).max(200)).max(12).optional(),
		goal: z.string().min(5).max(3000),
		team: z.array(z.string()).min(2).max(6),
		materials: z
			.array(
				z
					.object({ id: safeId, content: z.string().min(1).max(12000) })
					.strict(),
			)
			.min(1)
			.max(8),
	})
	.strict();
export type Work = z.infer<typeof WorkSchema>;
export type Plan = z.infer<typeof PlanSchema>;
export type CreateCoop = z.infer<typeof CreateCoopSchema>;
export interface Receipt {
	toolCallId: string;
	name: string;
	args: unknown;
	success: boolean;
	result: string;
	time: string;
}
export interface Artifact {
	path: string;
	sha256: string;
	taskId: string;
	format: Work["format"];
	runId: string;
}
export interface WorkState extends Work {
	revisionFeedback?: string;
	resourceRetries?: number;
	parentTaskId: string;
	status: string;
	runId?: string;
	sessionId?: string;
	backendSessionId?: string;
	artifacts: Artifact[];
	toolReceipts: Receipt[];
	approvalState: string;
	failureReason?: string;
	revision: number;
}
export interface SkillTestBinding { skillId: string; skillHash: string; suite: "citations-v1" | "csv-columns-v1"; caseIndex: number; groupId: string; contractHash: string }
export interface CoopProject {
	acceptanceCriteria?: string[];
	skillTest?: SkillTestBinding;
	reviewRequests?: Array<{ reviewerTaskId: string; targetTaskId: string; targetHash: string; reason: string; status: "PENDING" | "APPROVED" | "REJECTED" }>;
	plannerReview?: { plannerId: string; extraction: unknown; rawCandidate: unknown; aliases: unknown; hostChanges: string[]; expanded: Plan };
	nextWakeAt?: number;
	tickCount?: number;
	id: string;
	goal: string;
	team: string[];
	materials: CreateCoop["materials"];
	status: string;
	planSource: string;
	concurrency: number;
	tasks: WorkState[];
	events: Array<{ seq: number; time: string; type: string; data: unknown }>;
	effects: Array<{
		id: string;
		taskId: string;
		status: string;
		path: string;
		sha256?: string;
		argsHash?: string;
		capabilityId?: string;
	}>;
	failureReason?: string;
	userAcceptance: string;
	createdAt: string;
}
export interface CooperationApi {
	enabled(): Promise<boolean>;
	list(): Promise<CoopProject[]>;
	create(input: CreateCoop): Promise<CoopProject>;
	propose(id: string): Promise<CoopProject>;
	savePlan(id: string, plan: Plan): Promise<CoopProject>;
	approve(id: string): Promise<void>;
	wake(id: string, at: number): Promise<void>;
	control(
		id: string,
		action: "pause" | "cancel" | "resume" | "accept" | "changes" | "approve_revision" | "reject_revision",
		taskId?: string,
	): Promise<void>;
	artifact(projectId: string, taskId: string): Promise<string>;
}

export function validatePlan(
	plan: Plan,
	team: string[],
	materials: string[],
): void {
	const ids = new Set(plan.tasks.map((t) => t.taskId));
	if (ids.size !== plan.tasks.length) throw Error("DUPLICATE_TASK");
	const seen = new Set<string>();
	const visiting = new Set<string>();
	const visit = (id: string) => {
		if (visiting.has(id)) throw Error("CYCLIC_DEPENDENCY");
		if (seen.has(id)) return;
		const t = plan.tasks.find((x) => x.taskId === id);
		if (!t) throw Error("UNKNOWN_DEPENDENCY");
		if (!team.includes(t.assignedDotId)) throw Error("UNKNOWN_DOT");
		if (!t.requiredTools.includes("artifact_save"))
			throw Error("SAVE_TOOL_REQUIRED");
		for (const input of t.inputs) {
			const [kind, key] = input.split(":") as [string, string];
			if (
				kind === "input"
					? !materials.includes(key)
					: !t.dependencies.includes(key)
			)
				throw Error("UNAUTHORIZED_INPUT");
		}
		visiting.add(id);
		for (const d of t.dependencies) visit(d);
		visiting.delete(id);
		seen.add(id);
	};
	for (const id of ids) visit(id);
}

/** Interprets only a closed arithmetic grammar. Never evaluates generated JS or exposes host globals. */
export function checkCode(source: string): {
	ok: boolean;
	cases: number;
	reason?: string;
} {
	const m =
		/^\s*export\s+function\s+add\s*\(\s*a\s*,\s*b\s*\)\s*\{\s*return\s+a\s*([+*-])\s*b\s*;?\s*\}\s*$/.exec(
			source,
		);
	if (!m)
		return {
			ok: false,
			cases: 0,
			reason:
				"Unsupported syntax: only one ES-module exported function named add with parameters a,b and return a <arithmetic operator> b is accepted. CommonJS module.exports, extra statements and code fences are unsupported.",
		};
	const vectors: Array<[number, number, number]> = [
		[1, 2, 3],
		[-4, 7, 3],
		[0, 0, 0],
		[2.5, 1.5, 4],
	];
	return {
		ok: vectors.every(
			([a, b, expected]) =>
				(m[1] === "+" ? a + b : m[1] === "-" ? a - b : a * b) === expected,
		),
		cases: vectors.length,
	};
}
