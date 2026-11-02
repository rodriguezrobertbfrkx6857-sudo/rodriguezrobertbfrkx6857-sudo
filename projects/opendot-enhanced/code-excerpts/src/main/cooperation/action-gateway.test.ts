import { expect, it } from "vitest";
import { ActionGateway, canonicalArgsHash } from "./action-gateway";
const binding = { projectId: "p", dotId: "d", taskId: "t", runId: "r", toolCallId: "c", argsHash: canonicalArgsHash({ content: "safe" }), scope: "fixed-slot" };
it("binds all authority dimensions and consumes even invalid grants", () => {
	for (const field of Object.keys(binding)) {
		const gateway = new ActionGateway(); const id = gateway.issue(binding);
		expect(() => gateway.consume(id, { ...binding, [field]: "forged" })).toThrow("BINDING_MISMATCH");
		expect(() => gateway.consume(id, binding)).toThrow("CONSUMED");
	}
});
it("rejects expiry and replay; canonical hashes ignore object key order", () => {
	let now = 0; const gateway = new ActionGateway(() => now);
	const id = gateway.issue(binding, 5); now = 5;
	 expect(() => gateway.consume(id, binding)).toThrow("EXPIRED");
	const next = gateway.issue(binding); gateway.consume(next, binding);
	expect(() => gateway.consume(next, binding)).toThrow("CONSUMED");
	expect(canonicalArgsHash({ a: 1, b: 2 })).toBe(canonicalArgsHash({ b: 2, a: 1 }));
});
