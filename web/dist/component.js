function getToolOutput() {
  const api = window.openai || {};
  return api.toolOutput || api.widgetState || {};
}

function el(tag, attrs, children) {
  const node = document.createElement(tag);
  if (attrs) {
    for (const k in attrs) {
      if (k === "class") node.className = attrs[k];
      else if (k === "text") node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    }
  }
  (children || []).forEach((c) => c && node.appendChild(c));
  return node;
}

function renderScene(root, data) {
  root.innerHTML = "";
  const wrap = el("div", { style: "font-family: sans-serif; padding: 16px; color: #eee; background:#111; border-radius:12px;" });
  wrap.appendChild(el("div", { style: "font-size:12px; opacity:.7;", text: `Chapter ${data.chapter}: ${data.chapter_title}` }));
  wrap.appendChild(el("div", { style: "font-size:12px; opacity:.7; margin-bottom:8px;", text: `Day ${data.day} - ${data.date_str}` }));
  wrap.appendChild(el("h2", { style: "margin:4px 0;", text: data.scene_title }));
  wrap.appendChild(el("div", { style: "font-size:13px; opacity:.8; margin-bottom:12px;", text: `${data.time_str} . ${data.location}` }));
  (data.paragraphs || []).forEach((p) => {
    wrap.appendChild(el("p", { style: "line-height:1.5; margin:8px 0;", text: p }));
  });
  root.appendChild(wrap);
}

function renderDecision(root, data) {
  root.innerHTML = "";
  const wrap = el("div", { style: "font-family: sans-serif; padding:16px; color:#eee; background:#111; border-radius:12px;" });
  wrap.appendChild(el("h3", { style: "margin:0 0 12px;", text: `What does ${data.character} do?` }));
  (data.options || []).forEach((opt) => {
    const btn = el("button", {
      style: "display:block; width:100%; text-align:left; margin:6px 0; padding:10px 12px; background:#222; color:#eee; border:1px solid #444; border-radius:8px; cursor:pointer;",
    });
    btn.appendChild(el("strong", { text: `${opt.letter}. ${opt.name}` }));
    btn.appendChild(el("div", { style: "font-size:12px; opacity:.75; margin-top:2px;", text: opt.description }));
    btn.onclick = () => {
      if (window.openai && window.openai.callTool) {
        window.openai.callTool("decision_selected", { character: data.character, letter: opt.letter });
      }
    };
    wrap.appendChild(btn);
  });
  root.appendChild(wrap);
}

function renderOptionCards(root, data) {
  root.innerHTML = "";
  const wrap = el("div", { style: "font-family: sans-serif; padding:16px; color:#eee; background:#111; border-radius:12px;" });
  wrap.appendChild(el("h3", { style: "margin:0 0 12px;", text: data.section_title }));
  const grid = el("div", { style: "display:grid; grid-template-columns:1fr 1fr; gap:10px;" });
  (data.cards || []).forEach((c) => {
    const card = el("div", { style: "background:#222; border:1px solid #444; border-radius:8px; padding:10px;" });
    card.appendChild(el("div", { style: "font-size:11px; opacity:.6;", text: c.category }));
    card.appendChild(el("strong", { text: `${c.option_number}. ${c.name}` }));
    card.appendChild(el("div", { style: "font-size:12px; opacity:.8; margin:4px 0;", text: c.subtitle }));
    card.appendChild(el("p", { style: "font-size:12px; line-height:1.4;", text: c.description }));
    card.appendChild(el("div", { style: "font-size:11px; opacity:.6; margin-top:4px;", text: `Best for: ${c.best_for}` }));
    grid.appendChild(card);
  });
  wrap.appendChild(grid);
  root.appendChild(wrap);
}

window.renderWidget = function (widgetName) {
  const root = document.getElementById("root");
  if (!root) return;
  const data = getToolOutput();
  try {
    if (widgetName === "scene") renderScene(root, data);
    else if (widgetName === "decision") renderDecision(root, data);
    else if (widgetName === "option_cards") renderOptionCards(root, data);
    else root.textContent = "Unknown widget: " + widgetName;
  } catch (e) {
    root.textContent = "Widget render error: " + e.message;
  }
};
