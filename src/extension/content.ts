/*
  TermExpander content script
  - Watches user selection
  - Shows tooltip near cursor
  - Sends request to background service worker via chrome.runtime.sendMessage
*/

let tooltip: HTMLDivElement | null = null;
let enableWebSelection = true;

const TOOLTIP_STYLE_ID = "term-expander-tooltip-style";

function ensureStyles() {
  if (document.getElementById(TOOLTIP_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = TOOLTIP_STYLE_ID;
  style.textContent = `
.term-expander-tooltip{position:absolute;z-index:2147483647;max-width:360px;background:oklch(1 0 0);color:oklch(0.145 0 0);border:1px solid oklch(0.922 0 0);border-radius:10px;padding:10px;box-shadow:0 6px 18px rgba(0,0,0,.12);font-family:system-ui,-apple-system,Segoe UI,Roboto,Noto Sans,Arial,sans-serif;user-select:text;-webkit-user-select:text;pointer-events:auto}
.term-expander-tooltip .row{display:flex;gap:8px;align-items:center;justify-content:space-between}
.term-expander-tooltip .message{font-size:12px;color:oklch(0.556 0 0);user-select:text;-webkit-user-select:text}
.term-expander-tooltip .term-expander-btn{border:1px solid transparent;border-radius:10px;padding:6px 10px;font-size:12px;cursor:pointer;background:oklch(0.145 0 0);color:oklch(1 0 0)}
.term-expander-tooltip .term-expander-btn:disabled{opacity:.6;cursor:not-allowed}
.term-expander-tooltip .snippet{margin-top:8px;font-size:12px;color:oklch(0.556 0 0);max-height:84px;overflow:auto;white-space:pre-wrap;user-select:text;-webkit-user-select:text;cursor:text}
.term-expander-tooltip .result{margin-top:8px;font-size:12px;color:oklch(0.145 0 0);white-space:pre-wrap;cursor:text;user-select:text;-webkit-user-select:text}
`;
  document.documentElement.appendChild(style);
}

function isSelectionInsideTooltip(sel: Selection, tip: HTMLDivElement) {
  if (!sel || sel.rangeCount === 0) return false;

  const anchorNode = sel.anchorNode;
  const focusNode = sel.focusNode;
  if (anchorNode && tip.contains(anchorNode)) return true;
  if (focusNode && tip.contains(focusNode)) return true;

  try {
    const range = sel.getRangeAt(0);
    const container = range.commonAncestorContainer;
    return !!container && tip.contains(container);
  } catch {
    return false;
  }
}

function getSelectedText(sel: Selection | null) {
  try {
    return (sel?.toString() ?? "").trim();
  } catch {
    return "";
  }
}

async function refreshEnableFlag() {
  try {
    const result = await chrome.storage.local.get(["enableWebSelection"]);
    enableWebSelection = result.enableWebSelection !== false;
  } catch {
    enableWebSelection = true;
  }
}

function removeTooltip() {
  if (!tooltip) return;
  tooltip.remove();
  tooltip = null;
}

function getRuntimeIdSafe() {
  try {
    return chrome?.runtime?.id || null;
  } catch {
    return null;
  }
}

function sendMessageSafe(
  message: unknown,
  callback: (
    response: { result?: string; error?: string } | null,
    err: Error | null
  ) => void
) {
  try {
    if (!getRuntimeIdSafe()) {
      callback(null, new Error("Extension context invalidated"));
      return;
    }

    chrome.runtime.sendMessage(message, (response) => {
      const lastError = chrome.runtime.lastError;
      if (lastError) {
        callback(null, new Error(lastError.message));
        return;
      }
      callback(response, null);
    });
  } catch (err) {
    callback(null, err instanceof Error ? err : new Error(String(err)));
  }
}

function escapeHtml(text: string) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function showTooltip(
  x: number,
  y: number,
  message: string,
  options?: { canQuery?: boolean; selectedText?: string }
) {
  ensureStyles();

  const { canQuery, selectedText } = {
    canQuery: false,
    selectedText: "",
    ...(options || {}),
  };

  removeTooltip();

  tooltip = document.createElement("div");
  tooltip.className = "term-expander-tooltip";

  const snippet = selectedText
    ? `<div class="snippet">${escapeHtml(selectedText)}</div>`
    : "";

  tooltip.innerHTML = `
    <div class="row">
      <div class="message">${escapeHtml(message || "")}</div>
      ${
        canQuery
          ? '<button type="button" class="term-expander-btn" id="termExpanderRun">轉換</button>'
          : ""
      }
    </div>
    ${snippet}
    <div class="result" id="termExpanderResult"></div>
  `;

  tooltip.style.left = `${x + 10}px`;
  tooltip.style.top = `${y + 10}px`;
  document.body.appendChild(tooltip);

  if (!canQuery) return;

  const runBtn = tooltip.querySelector<HTMLButtonElement>("#termExpanderRun");
  const resultEl = tooltip.querySelector<HTMLDivElement>("#termExpanderResult");
  if (!runBtn || !resultEl) return;

  runBtn.addEventListener("click", () => {
    runBtn.disabled = true;
    resultEl.textContent = "查詢中...";

    sendMessageSafe(
      { action: "getExpansion", text: selectedText },
      (response, err) => {
        if (err) {
          const msg = String(err.message || err);
          if (msg.toLowerCase().includes("context invalidated")) {
            resultEl.textContent =
              "擴充功能已更新/重新載入，請重新整理頁面後再試一次。";
          } else {
            resultEl.textContent = `擴充功能錯誤：${msg}`;
          }
          runBtn.disabled = false;
          return;
        }

        if (!response) {
          resultEl.textContent =
            "沒有收到回應（可能背景 Service Worker 未啟動或已崩潰）。";
          runBtn.disabled = false;
          return;
        }

        if (response.error) {
          resultEl.textContent = String(response.error);
          runBtn.disabled = false;
        } else {
          resultEl.textContent = String(response.result ?? "");
        }
      }
    );
  });
}

// Boot
console.log("[TermExpander] content script loaded", location.href);
refreshEnableFlag();

try {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    if (!changes.enableWebSelection) return;

    enableWebSelection = changes.enableWebSelection.newValue !== false;
    if (!enableWebSelection) removeTooltip();
  });
} catch {
  // ignore
}

document.addEventListener("mouseup", (event) => {
  if (!enableWebSelection) {
    removeTooltip();
    return;
  }

  const sel = window.getSelection();
  if (tooltip && sel && isSelectionInsideTooltip(sel, tooltip)) {
    return;
  }

  if (tooltip && event.target && tooltip.contains(event.target as Node)) {
    return;
  }

  const selection = getSelectedText(sel);

  // 移除舊的框框
  removeTooltip();

  if (selection.length === 0) return;

  // 限制長度避免整段誤觸；但仍顯示提示，避免使用者以為沒有啟動
  if (selection.length > 200) {
    showTooltip(event.pageX, event.pageY, "（選取文字過長，請選 200 字以內）", {
      canQuery: false,
      selectedText: "",
    });
    return;
  }

  showTooltip(event.pageX, event.pageY, "已選取文字。", {
    canQuery: true,
    selectedText: selection,
  });
});

// Some sites (e.g., Notion) intercept/disable copy. When the selection is inside our tooltip,
// force the clipboard contents and stop propagation so the page can't override it.
document.addEventListener(
  "copy",
  (event) => {
    const sel = window.getSelection();
    if (!tooltip || !sel || !isSelectionInsideTooltip(sel, tooltip)) return;

    const text = getSelectedText(sel);
    if (!text) return;

    try {
      event.stopImmediatePropagation();
      event.preventDefault();

      // Most browsers provide clipboardData here.
      event.clipboardData?.setData("text/plain", text);
      event.clipboardData?.setData("text", text);
    } catch {
      // ignore
    }
  },
  true
);
