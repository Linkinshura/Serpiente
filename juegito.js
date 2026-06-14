// Constantinopla
const GRID      = 20;          // celdas por lado
const CELL      = 23;          // px por celda (canvas = 460px)
const CANVAS_PX = GRID * CELL; // 460

// Colores del canvas (independientes del CSS)
const C = {
  bg:        '#0d1117',
  gridLine:  '#161b22',
  snakeHead: '#1a7f37',
  snakeBody: '#3fb950',
  snakeBorder:'#7ee787',
  apple:     '#f85149',
  appleShine:'#ff8074',
  text:      '#e6edf3',
};

const DIR = { UP:[0,-1], DOWN:[0,1], LEFT:[-1,0], RIGHT:[1,0] };
const OPPOSITE = { UP:'DOWN', DOWN:'UP', LEFT:'RIGHT', RIGHT:'LEFT' };

// Estado
let snake, dir, nextDir, apple, score, bestScore, paused, running, gameLoopId, speed;

// Herencia de DOOM
const screens = {
  menu:     document.getElementById('menu'),
  game:     document.getElementById('game-screen'),
  gameover: document.getElementById('game-over-screen'),
};
const canvas     = document.getElementById('gameCanvas');
const ctx        = canvas.getContext('2d');
const elScore    = document.getElementById('score');
const elBest     = document.getElementById('best-score');
const elPause    = document.getElementById('pause-badge');
const elMenuBest = document.getElementById('menu-best-score');
const elFinal    = document.getElementById('final-score');
const elFinalB   = document.getElementById('final-best');
const elNewRec   = document.getElementById('new-record-msg');

// Botones
document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-menu').addEventListener('click', showMenu);
document.getElementById('btn-restart').addEventListener('click', startGame);
document.getElementById('btn-back-menu').addEventListener('click', showMenu);

// CanvaSize
canvas.width  = CANVAS_PX;
canvas.height = CANVAS_PX;

// Almacenamiento del local
function loadBest() {
  const v = parseInt(localStorage.getItem('snakeBest') || '0', 10);
  return isNaN(v) ? 0 : v;
}
function saveBest(v) { localStorage.setItem('snakeBest', v); }

// Pantallita
function showScreen(name) {
  Object.entries(screens).forEach(([k, el]) => {
    el.classList.toggle('active', k === name);
  });
}
function showMenu() {
  stopLoop();
  bestScore = loadBest();
  elMenuBest.textContent = bestScore;
  showScreen('menu');
}
function showGameOver(isNewRecord) {
  stopLoop();
  elFinal.textContent  = score;
  elFinalB.textContent = bestScore;
  elNewRec.classList.toggle('hidden', !isNewRecord);
  showScreen('gameover');
}

// Link Start
function startGame() {
  bestScore = loadBest();
  speed     = parseInt(document.getElementById('difficulty').value, 10) || 100;

  snake   = [ [10,10], [9,10], [8,10] ];
  dir     = DIR.RIGHT;
  nextDir = DIR.RIGHT;
  score   = 0;
  paused  = false;
  running = true;

  apple = spawnApple();

  elScore.textContent = 0;
  elBest.textContent  = bestScore;
  elPause.classList.add('hidden');

  showScreen('game');
  stopLoop();
  gameLoop();
}

// Ledesma del Juego
function spawnApple() {
  let pos;
  do {
    pos = [ Math.floor(Math.random() * GRID), Math.floor(Math.random() * GRID) ];
  } while (snake.some(s => s[0] === pos[0] && s[1] === pos[1]));
  return pos;
}

function step() {
  dir = nextDir;
  const head = [ snake[0][0] + dir[0], snake[0][1] + dir[1] ];

  // Colisión con paredes
  if (head[0] < 0 || head[0] >= GRID || head[1] < 0 || head[1] >= GRID) {
    return endGame();
  }
  // Colisión consigo misma
  if (snake.some(s => s[0] === head[0] && s[1] === head[1])) {
    return endGame();
  }

  snake.unshift(head);

  if (head[0] === apple[0] && head[1] === apple[1]) {
    score++;
    elScore.textContent = score;
    apple = spawnApple();
    // Aceleración leve cada 5 puntos
    if (score % 5 === 0 && speed > 50) speed = Math.max(50, speed - 5);
  } else {
    snake.pop();
  }
}

function endGame() {
  running = false;
  stopLoop();

  let newRecord = false;
  if (score > bestScore) {
    bestScore = score;
    saveBest(bestScore);
    newRecord = true;
  }
  // Pequeña pausa antes de mostrar GO
  setTimeout(() => showGameOver(newRecord), 300);
}

// FrootLoop
function gameLoop() {
  if (!running) return;
  step();
  if (running) draw();
  gameLoopId = setTimeout(gameLoop, speed);
}
function stopLoop() {
  if (gameLoopId) clearTimeout(gameLoopId);
  gameLoopId = null;
}

// Painticito
function draw() {
  // Fondo
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, CANVAS_PX, CANVAS_PX);

  // Cuadrícula sutil
  ctx.strokeStyle = C.gridLine;
  ctx.lineWidth   = 0.5;
  for (let i = 0; i <= GRID; i++) {
    ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, CANVAS_PX); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(CANVAS_PX, i * CELL); ctx.stroke();
  }

  // Serpiente (cuerpo → cabeza encima)
  snake.forEach((seg, i) => {
    const x = seg[0] * CELL;
    const y = seg[1] * CELL;
    const isHead = i === 0;
    const pad = isHead ? 1 : 2;

    ctx.fillStyle   = isHead ? C.snakeHead : C.snakeBody;
    ctx.strokeStyle = C.snakeBorder;
    ctx.lineWidth   = isHead ? 1.5 : 0.8;

    roundRect(ctx, x + pad, y + pad, CELL - pad*2, CELL - pad*2, isHead ? 5 : 4);
    ctx.fill();
    ctx.stroke();

    // Ojos de la cabeza
    if (isHead) drawEyes(x, y);
  });

  // Manzana
  drawApple(apple[0] * CELL, apple[1] * CELL);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
}

function drawEyes(hx, hy) {
  // Posición de los ojos según dirección
  let e1x, e1y, e2x, e2y;
  const [dx, dy] = dir;
  const cx = hx + CELL / 2;
  const cy = hy + CELL / 2;
  const off = 4;

  if (dx === 1)       { e1x = cx+4; e1y = cy-off; e2x = cx+4; e2y = cy+off; }
  else if (dx === -1) { e1x = cx-4; e1y = cy-off; e2x = cx-4; e2y = cy+off; }
  else if (dy === -1) { e1x = cx-off; e1y = cy-4; e2x = cx+off; e2y = cy-4; }
  else                { e1x = cx-off; e1y = cy+4; e2x = cx+off; e2y = cy+4; }

  ctx.fillStyle = '#e6edf3';
  [[e1x,e1y],[e2x,e2y]].forEach(([ex,ey]) => {
    ctx.beginPath(); ctx.arc(ex, ey, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0d1117';
    ctx.beginPath(); ctx.arc(ex + dx*0.8, ey + dy*0.8, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e6edf3';
  });
}

function drawApple(ax, ay) {
  const cx = ax + CELL / 2;
  const cy = ay + CELL / 2;
  const r  = CELL / 2 - 3;

  // Cuerpo
  ctx.fillStyle = C.apple;
  ctx.beginPath();
  ctx.arc(cx, cy + 1, r, 0, Math.PI * 2);
  ctx.fill();

  // Brillo
  ctx.fillStyle = C.appleShine;
  ctx.beginPath();
  ctx.arc(cx - r * 0.28, cy - r * 0.2, r * 0.32, 0, Math.PI * 2);
  ctx.fill();

  // Tallo
  ctx.strokeStyle = '#7ee787';
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx + 4, cy - r - 5, cx + 2, cy - r - 7);
  ctx.stroke();
}

// Tecladito Chill
document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp':    case 'w': case 'W':
      if (dir !== DIR.DOWN)  nextDir = DIR.UP;    break;
    case 'ArrowDown':  case 's': case 'S':
      if (dir !== DIR.UP)    nextDir = DIR.DOWN;  break;
    case 'ArrowLeft':  case 'a': case 'A':
      if (dir !== DIR.RIGHT) nextDir = DIR.LEFT;  break;
    case 'ArrowRight': case 'd': case 'D':
      if (dir !== DIR.LEFT)  nextDir = DIR.RIGHT; break;

    case 'p': case 'P':
      togglePause(); break;

    case 'r': case 'R':
      // Reinicio desde cualquier pantalla de juego
      if (screens.game.classList.contains('active') ||
          screens.gameover.classList.contains('active')) {
        startGame();
      }
      break;
  }
});

function togglePause() {
  if (!running && !paused) return;
  paused = !paused;
  elPause.classList.toggle('hidden', !paused);
  if (!paused) {
    running = true;
    stopLoop();
    gameLoop();
  } else {
    stopLoop();
  }
}

// ─── INIT ────────────────────────────────────────────────────
showMenu();
