import { applyMove, newGame } from "./game.js";

const boardEl = document.getElementById("board");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const statusEl = document.getElementById("status");
const btnNew = document.getElementById("btn-new");

let state = newGame();
let best = 0;
let touchStart = null;

async function loadBest() {
  try {
    const res = await fetch("/api/kv/highscore");
    if (res.ok) {
      const t = await res.text();
      const n = Number(t);
      if (Number.isFinite(n) && n > best) best = n;
    }
  } catch {
    /* offline */
  }
  bestEl.textContent = String(best);
}

async function saveBest(score) {
  if (score <= best) return;
  best = score;
  bestEl.textContent = String(best);
  try {
    await fetch("/api/kv/highscore", { method: "PUT", body: String(best) });
  } catch {
    /* offline */
  }
}

function render() {
  boardEl.innerHTML = "";
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const v = state.board[r][c];
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.v = String(v);
      cell.textContent = v ? String(v) : "";
      boardEl.appendChild(cell);
    }
  }
  scoreEl.textContent = String(state.score);
  if (state.won) statusEl.textContent = "達到 2048！可繼續挑戰。";
  else if (state.over) statusEl.textContent = "無法移動——再來一局吧。";
  else statusEl.textContent = "用手指滑動或方向鍵。";
  void saveBest(state.score);
}

function play(dir) {
  const { state: next, changed } = applyMove(state, dir);
  if (!changed) return;
  state = next;
  if (state.won) state = { ...state, won: false };
  render();
}

const keyMap = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
  a: "left",
  d: "right",
  w: "up",
  s: "down",
};

window.addEventListener("keydown", (e) => {
  const dir = keyMap[e.key];
  if (!dir) return;
  e.preventDefault();
  play(dir);
});

boardEl.addEventListener(
  "touchstart",
  (e) => {
    const t = e.changedTouches[0];
    touchStart = { x: t.clientX, y: t.clientY };
  },
  { passive: true },
);

boardEl.addEventListener(
  "touchend",
  (e) => {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    touchStart = null;
    if (Math.hypot(dx, dy) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) play(dx > 0 ? "right" : "left");
    else play(dy > 0 ? "down" : "up");
  },
  { passive: true },
);

btnNew.addEventListener("click", () => {
  state = newGame();
  render();
});

await loadBest();
render();
