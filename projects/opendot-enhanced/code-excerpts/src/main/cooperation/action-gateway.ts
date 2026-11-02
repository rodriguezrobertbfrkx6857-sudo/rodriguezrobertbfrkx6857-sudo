import { createHash, randomUUID } from "node:crypto";

export function canonicalArgsHash(value: unknown): string {
	const canonical = (item: unknown): unknown => {
		if (Array.isArray(item)) return item.map(canonical);
		if (item && typeof item === "object") return Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, canonical(v)]));
		return item;
	};
	return createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
}
export interface ActionBinding {
	projectId: string; dotId: string; taskId: string; runId: string; toolCallId: string; argsHash: string; scope: string;
}
/** Host-only, one-use grant issued AFTER native ApprovalBroker resolution. Never exposed as a tool. */
export class ActionGateway {
	private capabilities = new Map<string, { binding: ActionBinding; expiry: number }>();
	constructor(private now = Date.now) {}
	issue(binding: ActionBinding, ttlMs = 30_000): string {
		const id = randomUUID(); this.capabilities.set(id, { binding: { ...binding }, expiry: this.now() + ttlMs }); return id;
	}
	consume(id: string, binding: ActionBinding): void {
		const cap = this.capabilities.get(id);
		this.capabilities.delete(id);
		if (!cap) throw Error("CAPABILITY_UNKNOWN_OR_CONSUMED");
		if (cap.expiry <= this.now()) throw Error("CAPABILITY_EXPIRED");
		if (canonicalArgsHash(cap.binding) !== canonicalArgsHash(binding)) throw Error("CAPABILITY_BINDING_MISMATCH");
	}
}
