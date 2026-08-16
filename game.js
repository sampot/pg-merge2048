/**
 * 2048 — pure board logic (no DOM).
 */

export function emptyBoard(size = 4) {
  return Array.from({ length: size }, () => Array(size).fill(0));
}

export function cloneBoard(board) {
  return board.map((row) => row.slice());
}

export function spawnTile(board, rand = Math.random) {
  const empties = [];
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] === 0) empties.push([r, c]);
    }
  }
  if (!empties.length) return { board, spawned: null };
  const [r, c] = empties[Math.floor(rand() * empties.length)];
  const next = cloneBoard(board);
  next[r][c] = rand() < 0.9 ? 2 : 4;
  return { board: next, spawned: { r, c, value: next[r][c] } };
}

function slideLine(line) {
  const filtered = line.filter((v) => v !== 0);
  const out = [];
  let score = 0;
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const merged = filtered[i] * 2;
      out.push(merged);
      score += merged;
      i += 2;
    } else {
      out.push(filtered[i]);
      i += 1;
    }
  }
  while (out.length < line.length) out.push(0);
  const moved = out.some((v, idx) => v !== line[idx]);
  return { line: out, score, moved };
}

/** @param {'left'|'right'|'up'|'down'} dir */
export function move(board, dir) {
  const size = board.length;
  const next = emptyBoard(size);
  let scoreGain = 0;
  let moved = false;

  if (dir === "left" || dir === "right") {
    for (let r = 0; r < size; r++) {
      const row = board[r].slice();
      if (dir === "right") row.reverse();
      const res = slideLine(row);
      if (dir === "right") res.line.reverse();
      next[r] = res.line;
      scoreGain += res.score;
      if (res.moved) moved = true;
    }
  } else {
    for (let c = 0; c < size; c++) {
      const col = [];
      for (let r = 0; r < size; r++) col.push(board[r][c]);
      if (dir === "down") col.reverse();
      const res = slideLine(col);
      if (dir === "down") res.line.reverse();
      for (let r = 0; r < size; r++) next[r][c] = res.line[r];
      scoreGain += res.score;
      if (res.moved) moved = true;
    }
  }
  return { board: next, scoreGain, moved };
}

export function canMove(board) {
  for (const dir of ["left", "right", "up", "down"]) {
    if (move(board, dir).moved) return true;
  }
  return false;
}

export function maxTile(board) {
  let m = 0;
  for (const row of board) for (const v of row) if (v > m) m = v;
  return m;
}

export function newGame(rand = Math.random) {
  let board = emptyBoard(4);
  ({ board } = spawnTile(board, rand));
  ({ board } = spawnTile(board, rand));
  return { board, score: 0, won: false, over: false, wonOnce: false };
}

export function applyMove(state, dir, rand = Math.random) {
  if (state.over) return { state, changed: false };
  const res = move(state.board, dir);
  if (!res.moved) return { state, changed: false };
  let board = res.board;
  ({ board } = spawnTile(board, rand));
  const score = state.score + res.scoreGain;
  const hit2048 = maxTile(board) >= 2048;
  const wonOnce = state.wonOnce || hit2048;
  const over = !canMove(board);
  return {
    state: {
      board,
      score,
      won: hit2048 && !state.wonOnce,
      over,
      wonOnce,
    },
    changed: true,
  };
}
