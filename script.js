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
  "young",
  "brush",
  "field",
  "green",
  "heart",
  "lemon",
  "paper",
  "radio",
  "sleep",
  "train",
  "window"
];

const words = [];

let gameState = "start";
let lastTime = 0;
let elapsedTime = 0;
let spawnTimer = 0;
let activeWord = null;
let typedIndex = 0;
let score = 0;
let lives = 3;
let level = 1;
let fallSpeed = 42;
let spawnDelay = 1500;

const pointsPerWord = 10;
const groundY = canvas.height - 50;
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
  const maxX = canvas.width - width - padding;
  const x = padding + Math.random() * (maxX - padding);

  words.push({
    text,
    x,
    y: 30
  });
}

function startGame() {
  words.length = 0;

  gameState = "playing";
  elapsedTime = 0;
  spawnTimer = 0;
  activeWord = null;
  typedIndex = 0;
  score = 0;
  lives = 3;
  level = 1;
  fallSpeed = 42;
  spawnDelay = 1500;

  spawnWord();
  canvas.focus();
}

function findWord(letter) {
  let match = null;

  for (const word of words) {
    if (word.text[0] !== letter) {
      continue;
    }

    if (!match || word.y > match.y) {
      match = word;
    }
  }

  return match;
}

function clearLock() {
  activeWord = null;
  typedIndex = 0;
}

function destroyActiveWord() {
  const index = words.indexOf(activeWord);

  if (index !== -1) {
    words.splice(index, 1);
    score += pointsPerWord;
  }

  clearLock();
}

function loseLife() {
  lives--;

  if (lives <= 0) {
    lives = 0;
    gameState = "gameover";
    words.length = 0;
    clearLock();
  }
}

function updateDifficulty() {
  const timeLevel = Math.floor(elapsedTime / 30000);
  const scoreLevel = Math.floor(score / 100);

  level = 1 + timeLevel + scoreLevel;
  fallSpeed = Math.min(42 + (level - 1) * 7, 140);
  spawnDelay = Math.max(1500 - (level - 1) * 90, 500);
}

function handleLetter(key) {
  if (!activeWord) {
    const match = findWord(key);

    if (!match) {
      return;
    }

    activeWord = match;
    typedIndex = 1;
  } else if (key === activeWord.text[typedIndex]) {
    typedIndex++;
  }

  if (activeWord && typedIndex === activeWord.text.length) {
    destroyActiveWord();
  }
}

function handleKeydown(event) {
  const key = event.key.toLowerCase();

  if (key === "enter") {
    if (gameState !== "playing") {
      startGame();
    }

    event.preventDefault();
    return;
  }

  if (gameState !== "playing") {
    return;
  }

  if (key === "escape") {
    clearLock();
    event.preventDefault();
    return;
  }

  if (/^[a-z]$/.test(key)) {
    handleLetter(key);
  }
}

function handleCanvasClick() {
  canvas.focus();

  if (gameState !== "playing") {
    startGame();
  }
}

function updateWords(deltaTime) {
  const seconds = deltaTime / 1000;

  for (const word of words) {
    word.y += fallSpeed * seconds;
  }

  for (let i = words.length - 1; i >= 0; i--) {
    if (words[i].y < groundY) {
      continue;
    }

    if (words[i] === activeWord) {
      clearLock();
    }

    words.splice(i, 1);
    loseLife();

    if (gameState === "gameover") {
      break;
    }
  }
}

function update(deltaTime) {
  if (gameState !== "playing") {
    return;
  }

  elapsedTime += deltaTime;
  spawnTimer += deltaTime;

  updateDifficulty();
  updateWords(deltaTime);

  while (spawnTimer >= spawnDelay && gameState === "playing") {
    spawnWord();
    spawnTimer -= spawnDelay;
  }
}

function drawBackground() {
  ctx.fillStyle = "#222526";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#343736";
  ctx.lineWidth = 1;

  for (let y = 100; y < groundY; y += 100) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "#5e554e";
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(canvas.width, groundY);
  ctx.stroke();
}

function drawNormalWord(word) {
  ctx.fillStyle = "#d8d1c4";
  ctx.fillText(word.text, word.x, word.y);
}

function drawActiveWord(word) {
  const matchedText = word.text.slice(0, typedIndex);
  const remainingText = word.text.slice(typedIndex);
  const matchedWidth = ctx.measureText(matchedText).width;
  const wordWidth = ctx.measureText(word.text).width;

  ctx.fillStyle = "#c9a66b";
  ctx.fillText(matchedText, word.x, word.y);

  ctx.fillStyle = "#d8d1c4";
  ctx.fillText(
    remainingText,
    word.x + matchedWidth,
    word.y
  );

  ctx.strokeStyle = "#8f7550";
  ctx.lineWidth = 1;
  ctx.strokeRect(
    word.x - 6,
    word.y - 16,
    wordWidth + 12,
    31
  );
}

function drawWords() {
  ctx.font = wordFont;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  for (const word of words) {
    if (word === activeWord) {
      drawActiveWord(word);
    } else {
      drawNormalWord(word);
    }
  }
}

function drawStatus() {
  ctx.font = '12px "Courier New", monospace';
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "#b46f62";
  ctx.textAlign = "left";
  ctx.fillText(`LIVES ${lives}`, 16, canvas.height - 18);

  ctx.fillStyle = "#88847c";
  ctx.fillText(`LEVEL ${level}`, 110, canvas.height - 18);

  ctx.fillStyle = "#c9a66b";
  ctx.textAlign = "center";

  if (activeWord) {
    const matchedText = activeWord.text.slice(0, typedIndex);

    ctx.fillText(
      `LOCKED: ${matchedText}`,
      canvas.width / 2,
      canvas.height - 18
    );
  } else {
    ctx.fillText(
      "TYPE A FIRST LETTER",
      canvas.width / 2,
      canvas.height - 18
    );
  }

  ctx.fillStyle = "#d8d1c4";
  ctx.textAlign = "right";
  ctx.fillText(`SCORE ${score}`, canvas.width - 16, canvas.height - 18);
}

function drawPanel(width, height) {
  const x = canvas.width / 2 - width / 2;
  const y = canvas.height / 2 - height / 2;

  ctx.fillStyle = "#222526";
  ctx.fillRect(x, y, width, height);

  ctx.strokeStyle = "#71675f";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);
}

function drawStartScreen() {
  drawPanel(430, 220);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#c9a66b";
  ctx.font = '30px "Courier New", monospace';
  ctx.fillText("WORD RAIN", canvas.width / 2, canvas.height / 2 - 65);

  ctx.fillStyle = "#d8d1c4";
  ctx.font = '14px "Courier New", monospace';
  ctx.fillText(
    "Type each word before it reaches the ground.",
    canvas.width / 2,
    canvas.height / 2 - 20
  );

  ctx.fillStyle = "#aaa59b";
  ctx.font = '12px "Courier New", monospace';
  ctx.fillText(
    "The first letter locks onto the lowest matching word.",
    canvas.width / 2,
    canvas.height / 2 + 12
  );

  ctx.fillStyle = "#c9a66b";
  ctx.font = '13px "Courier New", monospace';
  ctx.fillText(
    "PRESS ENTER OR CLICK TO START",
    canvas.width / 2,
    canvas.height / 2 + 65
  );
}

function drawGameOver() {
  drawPanel(380, 190);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#b46f62";
  ctx.font = '26px "Courier New", monospace';
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 55);

  ctx.fillStyle = "#d8d1c4";
  ctx.font = '15px "Courier New", monospace';
  ctx.fillText(
    `FINAL SCORE ${score}`,
    canvas.width / 2,
    canvas.height / 2 - 10
  );

  ctx.fillStyle = "#88847c";
  ctx.font = '12px "Courier New", monospace';
  ctx.fillText(
    `LEVEL REACHED ${level}`,
    canvas.width / 2,
    canvas.height / 2 + 20
  );

  ctx.fillStyle = "#c9a66b";
  ctx.fillText(
    "PRESS ENTER OR CLICK TO PLAY AGAIN",
    canvas.width / 2,
    canvas.height / 2 + 60
  );
}

function render() {
  drawBackground();

  if (gameState === "start") {
    drawStartScreen();
    return;
  }

  if (gameState === "playing") {
    drawWords();
    drawStatus();
    return;
  }

  drawGameOver();
}

function gameLoop(timestamp) {
  if (lastTime === 0) {
    lastTime = timestamp;
  }

  const deltaTime = Math.min(timestamp - lastTime, 100);
  lastTime = timestamp;

  update(deltaTime);
  render();

  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", handleKeydown);
canvas.addEventListener("click", handleCanvasClick);

canvas.setAttribute("tabindex", "0");

requestAnimationFrame(gameLoop);
