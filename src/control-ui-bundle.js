const PLUGIN_ID = "continue-button";

function selectedSession(host) {
  const key = host && host.sessions ? host.sessions.selectedKey : "";
  if (!key) return null;
  const rows = host.sessions.rows || [];
  for (const row of rows) {
    if (row && row.sessionKey === key) return row;
  }
  return null;
}

function canContinue(host) {
  const key = host && host.sessions ? host.sessions.selectedKey : "";
  if (!key) return false;
  const row = selectedSession(host);
  return !row || row.hasActiveRun !== true;
}

function visibleSendButton(host) {
  const key = host && host.sessions ? host.sessions.selectedKey : "";
  let fallback = null;
  for (const button of document.querySelectorAll(".chat-send-btn--send")) {
    const pane = button.closest(".chat-pane-cache__pane");
    if (pane && !pane.classList.contains("chat-pane-cache__pane--visible")) continue;
    const owner = button.closest("openclaw-chat-pane");
    if (owner && key && typeof owner.sessionKey === "string" && owner.sessionKey !== key) continue;
    if (!fallback) fallback = button;
    if (button.getClientRects().length > 0) return button;
  }
  return fallback;
}

function insertionPoint(button) {
  const actions = button.closest(".agent-chat__composer-actions");
  if (!actions) return { parent: button.parentElement, before: button };
  let node = button;
  while (node.parentElement && node.parentElement !== actions) node = node.parentElement;
  return { parent: actions, before: node };
}

export default {
  id: PLUGIN_ID,
  activate(host) {
    let disposed = false;
    let painting = false;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cb-btn";
    button.setAttribute("aria-label", "Continue");
    button.title = "Continue";
    button.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4.5v15L19 12z"/></svg>';

    const sessionKey = () => {
      const row = selectedSession(host);
      if (row && typeof row.sessionKey === "string") return row.sessionKey;
      const key = host && host.sessions ? host.sessions.selectedKey : "";
      return typeof key === "string" ? key : "";
    };
    const agentId = () => {
      const row = selectedSession(host);
      return row && typeof row.agentId === "string" ? row.agentId : "";
    };

    const paint = () => {
      if (disposed || painting) return;
      painting = true;
      try {
        if (!canContinue(host)) {
          button.remove();
          return;
        }
        const send = visibleSendButton(host);
        const point = send ? insertionPoint(send) : null;
        if (!point || !point.parent) {
          button.remove();
          return;
        }
        if (button.parentElement === point.parent && button.nextElementSibling === point.before) return;
        point.parent.insertBefore(button, point.before);
      } finally {
        painting = false;
      }
    };

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const key = sessionKey();
      if (button.disabled || !key || !canContinue(host)) return;
      button.disabled = true;
      const params = {
        sessionKey: key,
        message: "continue",
        idempotencyKey: crypto.randomUUID(),
        deliver: false,
      };
      const agent = agentId();
      if (agent) params.agentId = agent;
      host
        .request("chat.send", params)
        .catch(() => {})
        .finally(() => {
          if (disposed) return;
          button.disabled = false;
        });
    });

    const observer = new MutationObserver(() => {
      paint();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    const unsubscribe = host.subscribe(paint);
    paint();

    return () => {
      disposed = true;
      observer.disconnect();
      unsubscribe();
      button.remove();
    };
  },
};
