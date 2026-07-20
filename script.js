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
let scoreMultiplier = 1;
let multiplierTimer = 0;

const pointsPerWord = 10;
const multiplierDuration = 7000;
const groundY = canvas.height - 50;
const wordFont = 'bold 20px monospace';

function getRandomWord() {
  const index = Math.floor(Math.random() * wordList.length);
  return wordList[index];
}

function getMultiplierChance() {
  return Math.min(0.08 + score / 1500, 0.28);
}

function spawnWord() {
  const text = getRandomWord();
  const isMultiplier = Math.random() < getMultiplierChance();

  ctx.font = wordFont;
  const width = ctx.measureText(text).width;
  const padding = 20;
  const maxX = canvas.width - width - padding;
  const x = padding + Math.random() * (maxX - padding);

  words.push({
    text,
    x,
    y: 30,
    isMultiplier,
    speedFactor: isMultiplier ? 1.18 : 1
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
  scoreMultiplier = 1;
  multiplierTimer = 0;

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

function activateMultiplier() {
  scoreMultiplier = 2;
  multiplierTimer = multiplierDuration;
}

function destroyActiveWord() {
  const index = words.indexOf(activeWord);

  if (index !== -1) {
    const destroyedWord = words[index];

    score += pointsPerWord * scoreMultiplier;
    words.splice(index, 1);

    if (destroyedWord.isMultiplier) {
      activateMultiplier();
    }
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

function updateMultiplier(deltaTime) {
  if (multiplierTimer <= 0) {
    return;
  }

  multiplierTimer -= deltaTime;

  if (multiplierTimer <= 0) {
    multiplierTimer = 0;
    scoreMultiplier = 1;
  }
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
    word.y += fallSpeed * word.speedFactor * seconds;
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
  updateMultiplier(deltaTime);
  updateWords(deltaTime);

  while (spawnTimer >= spawnDelay && gameState === "playing") {
    spawnWord();
    spawnTimer -= spawnDelay;
  }
}

function drawBackground() {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#333333";
  ctx.lineWidth = 1;

  for (let y = 100; y < groundY; y += 100) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(canvas.width, groundY);
  ctx.stroke();
}

function drawNormalWord(word) {
  ctx.fillStyle = word.isMultiplier ? "#FFFF00" : "#FFFFFF";
  ctx.fillText(word.text, word.x, word.y);
}

function drawActiveWord(word) {
  const matchedText = word.text.slice(0, typedIndex);
  const remainingText = word.text.slice(typedIndex);
  const matchedWidth = ctx.measureText(matchedText).width;
  const wordWidth = ctx.measureText(word.text).width;

  ctx.fillStyle = "#FFFF00";
  ctx.fillText(matchedText, word.x, word.y);

  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(
    remainingText,
    word.x + matchedWidth,
    word.y
  );

  ctx.strokeStyle = word.isMultiplier ? "#FFFF00" : "#FFFFFF";
  ctx.lineWidth = 2;
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
  ctx.font = 'bold 14px monospace';
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "left";
  ctx.fillText(`LIVES ${lives}`, 16, canvas.height - 18);

  ctx.fillText(`LEVEL ${level}`, 110, canvas.height - 18);

  ctx.textAlign = "center";

  if (activeWord) {
    const matchedText = activeWord.text.slice(0, typedIndex);

    ctx.fillStyle = "#FFFF00";
    ctx.fillText(
      `LOCKED: ${matchedText}`,
      canvas.width / 2,
      canvas.height - 18
    );
  } else {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(
      "TYPE A FIRST LETTER",
      canvas.width / 2,
      canvas.height - 18
    );
  }

  ctx.textAlign = "right";

  if (scoreMultiplier > 1) {
    const secondsLeft = Math.ceil(multiplierTimer / 1000);

    ctx.fillStyle = "#FFFF00";
    ctx.fillText(
      `2X ${secondsLeft}s`,
      canvas.width - 112,
      canvas.height - 18
    );
  }

  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(`SCORE ${score}`, canvas.width - 16, canvas.height - 18);
}

function drawPanel(width, height) {
  const x = canvas.width / 2 - width / 2;
  const y = canvas.height / 2 - height / 2;

  ctx.fillStyle = "#000000";
  ctx.fillRect(x, y, width, height);

  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
}

function drawStartScreen() {
  drawPanel(430, 240);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#FFFF00";
  ctx.font = 'bold 32px monospace';
  ctx.fillText("WORD RAIN", canvas.width / 2, canvas.height / 2 - 78);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = 'bold 16px monospace';
  ctx.fillText(
    "Type each word before it reaches the ground.",
    canvas.width / 2,
    canvas.height / 2 - 32
  );

  ctx.font = '14px monospace';
  ctx.fillText(
    "The first letter locks onto the lowest matching word.",
    canvas.width / 2,
    canvas.height / 2
  );

  ctx.fillStyle = "#FFFF00";
  ctx.fillText(
    "Yellow words trigger double points for seven seconds.",
    canvas.width / 2,
    canvas.height / 2 + 30
  );

  ctx.fillStyle = "#FFFFFF";
  ctx.font = 'bold 16px monospace';
  ctx.fillText(
    "PRESS ENTER OR CLICK TO START",
    canvas.width / 2,
    canvas.height / 2 + 82
  );
}

function drawGameOver() {
  drawPanel(380, 190);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#FFFFFF";
  ctx.font = 'bold 32px monospace';
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 55);

  ctx.font = 'bold 16px monospace';
  ctx.fillText(
    `FINAL SCORE ${score}`,
    canvas.width / 2,
    canvas.height / 2 - 10
  );

  ctx.fillText(
    `LEVEL REACHED ${level}`,
    canvas.width / 2,
    canvas.height / 2 + 20
  );

  ctx.fillStyle = "#FFFF00";
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