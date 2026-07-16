const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const wordList = [
  "apple",
  "bread",
  "chair",
  "cloud",
  "dance",
  "earth",
  "flame",
  "glass",
  "house",
  "light",
  "music",
  "night",
  "ocean",
  "plant",
  "quiet",
  "river",
  "stone",
  "table",
  "water",
  "young"
];

const words = [];

let lastTime = 0;
let elapsedTime = 0;
let spawnTimer = 0;

const spawnDelay = 1500;
const fallSpeed = 42;
const wordFont = '20px "Courier New", monospace';

function getRandomWord() {
  const index = Math.floor(Math.random() * wordList.length);
  return wordList[index];
}

function spawnWord() {
  const text = getRandomWord();

  ctx.font = wordFont;
  const width = ctx.measureText(text).width;

  const padding = 20;
  const minX = padding;
  const maxX = canvas.width - width - padding;
  const x = minX + Math.random() * (maxX - minX);

  words.push({
    text,
    x,
    y: 30
  });
}

function updateWords(deltaTime) {
  const seconds = deltaTime / 1000;

  for (const word of words) {
    word.y += fallSpeed * seconds;
  }

  for (let i = words.length - 1; i >= 0; i--) {
    if (words[i].y > canvas.height + 30) {
      words.splice(i, 1);
    }
  }
}

function update(deltaTime) {
  elapsedTime += deltaTime;
  spawnTimer += deltaTime;

  updateWords(deltaTime);

  if (spawnTimer >= spawnDelay) {
    spawnWord();
    spawnTimer = 0;
  }
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

function drawWords() {
  ctx.fillStyle = "#d8d1c4";
  ctx.font = wordFont;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  for (const word of words) {
    ctx.fillText(word.text, word.x, word.y);
  }
}

function drawStatus() {
  ctx.fillStyle = "#88847c";
  ctx.font = '12px "Courier New", monospace';
  ctx.textBaseline = "alphabetic";

  ctx.textAlign = "left";
  ctx.fillText(`WORDS ${words.length}`, 16, canvas.height - 18);

  ctx.textAlign = "right";
  ctx.fillText(
    `RUNNING ${Math.floor(elapsedTime / 1000)}s`,
    canvas.width - 16,
    canvas.height - 18
  );
}

function render() {
  drawBackground();
  drawWords();
  drawStatus();
}

function gameLoop(timestamp) {
  if (lastTime === 0) {
    lastTime = timestamp;
  }

  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  update(deltaTime);
  render();

  requestAnimationFrame(gameLoop);
}

spawnWord();
requestAnimationFrame(gameLoop);
