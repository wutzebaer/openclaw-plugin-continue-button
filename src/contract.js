import { Type } from "typebox";
import { defineFeatureContract } from "openclaw/plugin-sdk/feature-contract";

export const contract = defineFeatureContract({
  pluginId: "continue-button",
  operations: {
    "send-continue": {
      kind: "action",
      description: "Queue the text \"continue\" for the session's next agent turn.",
      input: Type.Object(
        {
          sessionKey: Type.String({ minLength: 1, maxLength: 512 }),
          agentId: Type.Optional(Type.String({ minLength: 1, maxLength: 256 })),
          text: Type.Optional(Type.String({ minLength: 1, maxLength: 4000 })),
          idempotencyKey: Type.Optional(Type.String({ minLength: 1, maxLength: 200 })),
        },
        { additionalProperties: false },
      ),
      output: Type.Object(
        {
          ok: Type.Boolean(),
          enqueued: Type.Boolean(),
          sessionKey: Type.String({ maxLength: 512 }),
          error: Type.Optional(Type.String({ maxLength: 500 })),
        },
        { additionalProperties: false },
      ),
    },
  },
  events: {},
});
