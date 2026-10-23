const PLUGIN_ID = "continue-button";
const ACTION_ID = "send-continue";

function selectedSession(host) {
  const key = host && host.sessions ? host.sessions.selectedKey : "";
  if (!key) return null;
  const rows = host.sessions.rows || [];
  for (const row of rows) {
    if (row && row.sessionKey === key) return row;
  }
  return null;
}

function isSessionActive(host) {
  const row = selectedSession(host);
  return Boolean(row) && row.hasActiveRun === true;
}

export default {
  id: PLUGIN_ID,
  activate(host) {
    const disposeAccessory = host.ui.registerAccessory({
      id: "continue-button-accessory",
      placement: "session-header",
      mount(container, context) {
        let current = context || { host, props: {} };
        let disposed = false;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "cb-btn";
        button.textContent = "Continue";
        container.appendChild(button);

        const viewHost = () => current.host || host;
        const sessionKey = () => {
          const props = current.props;
          if (props && typeof props.sessionKey === "string" && props.sessionKey) return props.sessionKey;
          const row = selectedSession(viewHost());
          return row && typeof row.sessionKey === "string" ? row.sessionKey : "";
        };
        const agentId = () => {
          const props = current.props;
          if (props && typeof props.agentId === "string" && props.agentId) return props.agentId;
          const row = selectedSession(viewHost());
          return row && typeof row.agentId === "string" ? row.agentId : "";
        };
        const render = () => {
          if (disposed) return;
          button.style.display = isSessionActive(viewHost()) ? "" : "none";
        };

        button.addEventListener("click", () => {
          const key = sessionKey();
          if (button.disabled || !key || !isSessionActive(viewHost())) return;
          button.disabled = true;
          const original = button.textContent;
          button.textContent = "…";
          const payload = {
            sessionKey: key,
            text: "continue",
            idempotencyKey: crypto.randomUUID(),
          };
          const agent = agentId();
          if (agent) payload.agentId = agent;
          host
            .request("plugins.sessionAction", {
              pluginId: PLUGIN_ID,
              actionId: ACTION_ID,
              payload,
            })
            .catch(() => {})
            .finally(() => {
              if (disposed) return;
              button.disabled = false;
              button.textContent = original;
            });
        });

        render();
        const unsubscribe = host.subscribe(render);
        return {
          update(next) {
            current = next || current;
            render();
          },
          dispose() {
            disposed = true;
            unsubscribe();
            button.remove();
          },
        };
      },
    });

    return () => {
      if (typeof disposeAccessory === "function") disposeAccessory();
    };
  },
};
