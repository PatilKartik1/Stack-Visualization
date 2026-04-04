// ── Mode ──────────────────────────────────────────────
let mode = "array"; // 'array' | 'linkedlist'

function setMode(m) {
  mode = m;
  // reset on switch
  arrayStack = [];
  llHead = null;
  llSize = 0;

  document
    .getElementById("btn-array")
    .classList.toggle("active", m === "array");
  document
    .getElementById("btn-ll")
    .classList.toggle("active", m === "linkedlist");

  const maxCard = document.getElementById("max-size-card");
  const capWrap = document.querySelector(".cap-wrap");

  if (m === "array") {
    document.getElementById("mode-hint").innerHTML =
      "<strong>Array:</strong> Fixed-size, index-based. Max size limit applies.";
    maxCard.style.display = "";
    capWrap.style.display = "";
    document.getElementById("header-max").parentElement.style.display = "";
  } else {
    document.getElementById("mode-hint").innerHTML =
      "<strong>Linked List:</strong> Dynamic nodes with next pointers. No fixed size limit — each node points to the next.";
    maxCard.style.display = "none";
    capWrap.style.display = "none";
    document.getElementById("header-max").parentElement.style.display = "none";
  }

  log(
    "🔄 Switched to " +
      (m === "array" ? "Array" : "Linked List") +
      " mode. Stack cleared.",
  );
  renderStack(false);
}

// ── Array implementation ───────────────────────────────
let arrayStack = [];
let maxSize = 5;

// ── Linked List implementation ─────────────────────────
// Node: { value, next }
let llHead = null;
let llSize = 0;

function llPush(val) {
  llHead = { value: val, next: llHead };
  llSize++;
}

function llPop() {
  if (!llHead) return null;
  const val = llHead.value;
  llHead = llHead.next;
  llSize--;
  return val;
}

function llPeek() {
  return llHead ? llHead.value : null;
}

// Returns array of values from top to bottom for rendering
function llToArray() {
  const arr = [];
  let cur = llHead;
  while (cur) {
    arr.push(cur.value);
    cur = cur.next;
  }
  return arr; // index 0 = top
}

// ── Shared helpers ─────────────────────────────────────
function log(text) {
  document.getElementById("message").innerText = text;
}

function getSize() {
  return mode === "array" ? arrayStack.length : llSize;
}
function isEmpty() {
  return getSize() === 0;
}
function getTopVal() {
  return mode === "array" ? arrayStack[arrayStack.length - 1] : llPeek();
}

document.getElementById("input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") pushElement();
});
document.getElementById("max-size-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") updateMaxSize();
});

// ── Operations ─────────────────────────────────────────
function updateMaxSize() {
  const val = parseInt(document.getElementById("max-size-input").value);
  if (isNaN(val) || val < 1) {
    log("⚠️ Max size must be at least 1.");
    return;
  }
  if (arrayStack.length > val) {
    arrayStack = arrayStack.slice(0, val);
    log(`⚙️ Max size set to ${val} — stack trimmed to fit.`);
  } else {
    log(`⚙️ Max size updated to ${val}.`);
  }
  maxSize = val;
  document.getElementById("header-max").textContent = maxSize;
  document.getElementById("badge-max").textContent = maxSize;
  renderStack(false);
}

function pushElement() {
  const input = document.getElementById("input");
  const value = input.value.trim();
  if (value === "") {
    log("⚠️ Enter a value first.");
    return;
  }

  if (mode === "array") {
    if (arrayStack.length >= maxSize) {
      log("❌ Stack Overflow — array is full!");
      return;
    }
    arrayStack.push(value);
    log(`↑ Pushed "${value}"  →  size: ${arrayStack.length}`);
  } else {
    llPush(value);
    log(`↑ Pushed "${value}"  →  node added at head, size: ${llSize}`);
  }

  input.value = "";
  input.focus();
  renderStack(true);
}

function popElement() {
  if (isEmpty()) {
    log("❌ Stack Underflow — nothing to pop!");
    return;
  }

  const topBox = document.querySelector(
    "#stack-container .stack-box:last-child",
  );
  const doRemove = () => {
    let removed;
    if (mode === "array") {
      removed = arrayStack.pop();
      log(`↓ Popped "${removed}"  →  size: ${arrayStack.length}`);
    } else {
      removed = llPop();
      log(`↓ Popped "${removed}"  →  head node removed, size: ${llSize}`);
    }
    renderStack(false);
  };

  if (topBox) {
    topBox.classList.add("pop-anim");
    topBox.addEventListener("animationend", doRemove, { once: true });
  } else {
    doRemove();
  }
}

function peekElement() {
  if (isEmpty()) {
    log("⚠️ Stack is empty — nothing to peek.");
    return;
  }
  log(`🔍 Top: "${getTopVal()}"`);
}

function checkEmpty() {
  log(
    isEmpty()
      ? "✅ Stack IS empty."
      : `❌ Not empty — ${getSize()} item${getSize() > 1 ? "s" : ""} inside.`,
  );
}

function checkFull() {
  if (mode === "linkedlist") {
    log("ℹ️ Linked List has no fixed size — it never gets full.");
    return;
  }
  log(
    arrayStack.length === maxSize
      ? "✅ Stack IS full."
      : `❌ Not full — ${maxSize - arrayStack.length} slot${maxSize - arrayStack.length > 1 ? "s" : ""} remaining.`,
  );
}

function resetStack() {
  arrayStack = [];
  llHead = null;
  llSize = 0;
  log("🔄 Stack has been reset.");
  renderStack(false);
}

// ── Render ─────────────────────────────────────────────
function renderStack(justPushed) {
  const container = document.getElementById("stack-container");
  const emptyState = document.getElementById("empty-state");

  container
    .querySelectorAll(".stack-box, .ll-arrow")
    .forEach((el) => el.remove());

  const size = getSize();
  emptyState.style.display = size === 0 ? "flex" : "none";

  // Build display array: always bottom-to-top for column-reverse container
  let items; // index 0 = bottom
  if (mode === "array") {
    items = [...arrayStack]; // index 0 = bottom
  } else {
    items = llToArray().reverse(); // llToArray gives top→bottom, reverse for bottom→top
  }

  for (let i = 0; i < items.length; i++) {
    const isTop = i === items.length - 1;

    // In linked list mode, show pointer arrow between nodes (above each non-top box)
    if (mode === "linkedlist" && i > 0) {
      const arrow = document.createElement("div");
      arrow.className = "ll-arrow";
      arrow.title = "next pointer";
      container.appendChild(arrow);
    }

    const div = document.createElement("div");
    div.className = "stack-box" + (isTop ? " top-box" : "");
    if (isTop && justPushed) div.classList.add("push-anim");

    const indexLabel =
      mode === "array"
        ? `[${i}]`
        : isTop
          ? "head"
          : `next×${items.length - 1 - i}`;

    div.innerHTML = `
        <span class="idx">${indexLabel}</span>
        <span>${items[i]}</span>
        ${isTop ? '<span class="top-tag">TOP</span>' : "<span></span>"}
      `;
    container.appendChild(div);
  }

  // Stats
  const pct = mode === "array" ? Math.round((size / maxSize) * 100) : null;
  document.getElementById("size-num").textContent = size;
  if (pct !== null) {
    document.getElementById("cap-fill").style.width = pct + "%";
    document.getElementById("cap-pct").textContent = pct + "%";
  }
  document.getElementById("badge-max").textContent =
    mode === "array" ? maxSize : "∞";

  const topDisplay = document.getElementById("top-display");
  if (size === 0) {
    topDisplay.textContent = "—";
    topDisplay.className = "stat-value dash";
  } else {
    topDisplay.textContent = getTopVal();
    topDisplay.className = "stat-value";
  }
}

renderStack(false);
