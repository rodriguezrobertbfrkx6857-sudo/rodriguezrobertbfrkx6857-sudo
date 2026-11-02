import { z } from "zod";
import type { ModelRef } from "../../shared/types";

export const taskFamilies = ["planning", "reading", "tool_use", "code", "csv", "review"] as const;
export type TaskFamily = typeof taskFamilies[number];
const measure = z.object({
	attempted: z.number().int().positive(), verified: z.number().int().nonnegative(),
	resourceBlocked: z.number().int().nonnegative(), medianMs: z.number().nonnegative(),
	benchmarkVersion: z.string().min(1), harnessSha: z.string().regex(/^[a-f0-9]{40}$/),
	level: z.enum(["L1", "L2", "L3"]), trust: z.literal("measured"),
}).refine(x => x.verified + x.resourceBlocked <= x.attempted);
export const CapabilitySchema = z.object({
	providerId: z.string().min(1), modelId: z.string().min(1), digest: z.string().regex(/^[a-f0-9]{64}$/),
	licenseReviewed: z.boolean(), contextLimit: z.number().int().positive(),
	toolMode: z.enum(["native-tools", "json-schema"]),
	peakMemoryMiB: z.number().positive(),
	testedFamilies: z.partialRecord(z.enum(taskFamilies), measure),
	evidence: z.array(z.object({ path: z.string().min(1), sha256: z.string().regex(/^[a-f0-9]{64}$/) })).min(1),
});
export type ModelCapabilityProfile = z.infer<typeof CapabilitySchema>;
export interface RoutingRequest {
	family: TaskFamily; mode: "fixed" | "auto"; fixed: ModelRef;
	available: Array<ModelRef & { digest: string; local: boolean }>;
	approvedProviders: string[]; freeMemoryMiB: number; contextNeeded: number;
}
export interface RouteDecision extends ModelRef {
	digest: string; family: TaskFamily; reason: string; benchmarkRef?: string;
	scoreComponents: { completionRate?: number; medianMs?: number };
}
/** Pure deterministic selection. No tools, grants, retries, or side effects here.
 * L1 schema probes never authorize an AgentSession routing decision. */
export function selectTaskModel(request: RoutingRequest, profiles: ModelCapabilityProfile[]): RouteDecision {
	const available = request.available.filter(m => m.local && request.approvedProviders.includes(m.providerId));
	const fixed = available.find(m => m.providerId === request.fixed.providerId && m.modelId === request.fixed.modelId);
	if (!Number.isFinite(request.freeMemoryMiB) || request.freeMemoryMiB < 2048) throw Error("RESOURCE_MEMORY_PRESSURE");
	const fallback = (reason: string): RouteDecision => {
		if (!fixed) throw Error("ROUTE_NO_AUTHORIZED_MODEL");
		return { providerId: fixed.providerId, modelId: fixed.modelId, digest: fixed.digest, family: request.family, reason, scoreComponents: {} };
	};
	if (request.mode === "fixed") return fallback("USER_FIXED_MODEL");
	const candidates = profiles.flatMap(raw => {
		const parsed = CapabilitySchema.safeParse(raw); if (!parsed.success) return [];
		const p = parsed.data, m = p.testedFamilies[request.family];
		if (!p.licenseReviewed || p.toolMode !== "native-tools" || p.contextLimit < request.contextNeeded ||
			!available.some(a => a.providerId === p.providerId && a.modelId === p.modelId && a.digest === p.digest) ||
			p.peakMemoryMiB + 2048 > request.freeMemoryMiB || !m || m.level === "L1" || !m.verified) return [];
		return [{ p, m, rate: m.verified / m.attempted }];
	}).sort((a,b) => b.rate-a.rate || a.m.medianMs-b.m.medianMs ||
		(a.p.providerId+'\0'+a.p.modelId).localeCompare(b.p.providerId+'\0'+b.p.modelId, "en"));
	const best = candidates[0];
	if (!best) return fallback("NO_QUALIFIED_EVIDENCE_FIXED_FALLBACK");
	return { providerId: best.p.providerId, modelId: best.p.modelId, digest: best.p.digest, family: request.family,
		reason: "MEASURED_COMPLETION_THEN_LATENCY", benchmarkRef: best.m.benchmarkVersion,
		scoreComponents: { completionRate: best.rate, medianMs: best.m.medianMs } };
}
