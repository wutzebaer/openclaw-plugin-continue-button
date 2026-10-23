import { defineFeaturePlugin } from "openclaw/plugin-sdk/feature-plugin";
import { contract } from "./contract.js";

const DEFAULT_TEXT = "continue";

function errorText(err) {
  const message = err instanceof Error && err.message ? err.message : "Failed to send";
  return message.slice(0, 500);
}

export default defineFeaturePlugin({
  contract,
  name: "Continue Button",
  description:
    "Adds a Continue button to the Control UI. Visible only while the current session is active; clicking it queues \"continue\" for the next turn.",
  setup(api) {
    return {
      "send-continue": async (input) => {
        const sessionKey = input.sessionKey;
        const text = typeof input.text === "string" && input.text.trim() ? input.text.trim() : DEFAULT_TEXT;
        const idempotencyKey =
          typeof input.idempotencyKey === "string" && input.idempotencyKey.trim()
            ? input.idempotencyKey.trim()
            : `continue:${sessionKey}:${crypto.randomUUID()}`;
        try {
          const queued = await api.enqueueNextTurnInjection({
            sessionKey,
            ...(input.agentId ? { agentId: input.agentId } : {}),
            text,
            idempotencyKey,
          });
          if (!queued.enqueued) {
            return {
              ok: false,
              enqueued: false,
              sessionKey: queued.sessionKey || sessionKey,
              error: "Not enqueued",
            };
          }
          return { ok: true, enqueued: true, sessionKey: queued.sessionKey };
        } catch (err) {
          return { ok: false, enqueued: false, sessionKey, error: errorText(err) };
        }
      },
    };
  },
});
