const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const restartBtn = document.getElementById("restartBtn");

const gridSize = 30;
const tileCount = canvas.width / gridSize;

let snake = [
  { x: 10, y: 10 }
];

let velocityX = 0;
let velocityY = 0;

let food = {
  x: 5,
  y: 5
};

let score = 0;
let gameOver = false;

function gameLoop() {

  if (gameOver) {
    drawGameOver();
    return;
  }

  update();
  draw();

  setTimeout(gameLoop, 100);
}

function update() {

  const head = {
    x: snake[0].x + velocityX,
    y: snake[0].y + velocityY
  };

  snake.unshift(head);

  // Comer comida
  if (head.x === food.x && head.y === food.y) {

    score++;
    scoreText.textContent = score;

    generateFood();

  } else {
    snake.pop();
  }

  // Colisiones pared
  if (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= tileCount ||
    head.y >= tileCount
  ) {
    gameOver = true;
  }

  // Colisiones cuerpo
  for (let i = 1; i < snake.length; i++) {

    if (
      snake[i].x === head.x &&
      snake[i].y === head.y
    ) {
      gameOver = true;
    }
  }
}

function draw() {

  // Fondo
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Comida
  ctx.fillStyle = "red";
  ctx.fillRect(
    food.x * gridSize,
    food.y * gridSize,
    gridSize,
    gridSize
  );

  // Snake
  snake.forEach((segment, index) => {

    if (index === 0) {
      ctx.fillStyle = "#66ff66";
    } else {
      ctx.fillStyle = "#33cc33";
    }

    ctx.fillRect(
      segment.x * gridSize,
      segment.y * gridSize,
      gridSize - 2,
      gridSize - 2
    );
  });
}

function generateFood() {

  food.x = Math.floor(Math.random() * tileCount);
  food.y = Math.floor(Math.random() * tileCount);
}

function drawGameOver() {

  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "50px Arial";
  ctx.textAlign = "center";

  ctx.fillText(
    "GAME OVER",
    canvas.width / 2,
    canvas.height / 2
  );
}

document.addEventListener("keydown", changeDirection);

function changeDirection(event) {

  const key = event.key;

  if (key === "ArrowUp" && velocityY !== 1) {
    velocityX = 0;
    velocityY = -1;
  }

  if (key === "ArrowDown" && velocityY !== -1) {
    velocityX = 0;
    velocityY = 1;
  }

  if (key === "ArrowLeft" && velocityX !== 1) {
    velocityX = -1;
    velocityY = 0;
  }

  if (key === "ArrowRight" && velocityX !== -1) {
    velocityX = 1;
    velocityY = 0;
  }
}

restartBtn.addEventListener("click", restartGame);

function restartGame() {

  snake = [{ x: 10, y: 10 }];

  velocityX = 0;
  velocityY = 0;

  food = {
    x: 5,
    y: 5
  };

  score = 0;
  scoreText.textContent = score;

  gameOver = false;

  gameLoop();
}

gameLoop();