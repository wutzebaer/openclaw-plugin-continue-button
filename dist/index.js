import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";

export default definePluginEntry({
  id: "continue-button",
  name: "Continue Button",
  description:
    "Adds a Continue button beside Send in the Control UI. Visible while the selected session is idle; clicking it sends \"continue\".",
  register() {},
});
