const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let lastTime = 0;
let elapsedTime = 0;

function update(deltaTime) {
  elapsedTime += deltaTime;
}

function drawBackground() {
  ctx.fillStyle = "#222526";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#4b4b46";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height - 50);
  ctx.lineTo(canvas.width, canvas.height - 50);
  ctx.stroke();
}

function drawStatus() {
  ctx.fillStyle = "#d8d1c4";
  ctx.font = '18px "Courier New", monospace';
  ctx.textAlign = "center";
  ctx.fillText("WORD RAIN", canvas.width / 2, canvas.height / 2 - 14);

  ctx.fillStyle = "#8f8b83";
  ctx.font = '14px "Courier New", monospace';
  ctx.fillText("The playfield is ready.", canvas.width / 2, canvas.height / 2 + 18);

  ctx.fillStyle = "#77756f";
  ctx.font = '12px "Courier New", monospace';
  ctx.textAlign = "left";
  ctx.fillText(
    `RUNNING ${Math.floor(elapsedTime / 1000)}s`,
    16,
    canvas.height - 18
  );
}

function render() {
  drawBackground();
  drawStatus();
}

function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  update(deltaTime);
  render();

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
