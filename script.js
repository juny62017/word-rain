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
let activeWord = null;
let typedIndex = 0;
let score = 0;
let lives = 3;
let level = 1;
let gameOver = false;

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
  const minX = padding;
  const maxX = canvas.width - width - padding;
  const x = minX + Math.random() * (maxX - minX);

  words.push({
    text,
    x,
    y: 30
  });
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
    gameOver = true;
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

function handleKeydown(event) {
  if (gameOver) {
    return;
  }

  const key = event.key.toLowerCase();

  if (key === "escape") {
    clearLock();
    return;
  }

  if (!/^[a-z]$/.test(key)) {
    return;
  }

  if (!activeWord) {
    const match = findWord(key);

    if (match) {
      activeWord = match;
      typedIndex = 1;

      if (typedIndex === activeWord.text.length) {
        destroyActiveWord();
      }
    }

    return;
  }

  const expectedLetter = activeWord.text[typedIndex];

  if (key === expectedLetter) {
    typedIndex++;

    if (typedIndex === activeWord.text.length) {
      destroyActiveWord();
    }
  }
}

function updateWords(deltaTime) {
  const seconds = deltaTime / 1000;

  for (const word of words) {
    word.y += fallSpeed * seconds;
  }

  for (let i = words.length - 1; i >= 0; i--) {
    if (words[i].y >= groundY) {
      if (words[i] === activeWord) {
        clearLock();
      }

      words.splice(i, 1);
      loseLife();

      if (gameOver) {
        words.length = 0;
        break;
      }
    }
  }
}

function update(deltaTime) {
  if (gameOver) {
    return;
  }

  elapsedTime += deltaTime;
  spawnTimer += deltaTime;

  updateDifficulty();
  updateWords(deltaTime);

  while (spawnTimer >= spawnDelay) {
    spawnWord();
    spawnTimer -= spawnDelay;
  }
}

function drawBackground() {
  ctx.fillStyle = "#222526";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#4b4b46";
  ctx.lineWidth = 1;
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

  ctx.fillStyle = "#c9a66b";
  ctx.fillText(matchedText, word.x, word.y);

  const matchedWidth = ctx.measureText(matchedText).width;

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
    ctx.measureText(word.text).width + 12,
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
  ctx.fillText(
    `SCORE ${score}`,
    canvas.width - 16,
    canvas.height - 18
  );
}

function drawGameOver() {
  if (!gameOver) {
    return;
  }

  ctx.fillStyle = "#222526";
  ctx.fillRect(
    canvas.width / 2 - 170,
    canvas.height / 2 - 55,
    340,
    110
  );

  ctx.strokeStyle = "#71675f";
  ctx.lineWidth = 1;
  ctx.strokeRect(
    canvas.width / 2 - 170,
    canvas.height / 2 - 55,
    340,
    110
  );

  ctx.fillStyle = "#b46f62";
  ctx.font = '24px "Courier New", monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    "GAME OVER",
    canvas.width / 2,
    canvas.height / 2 - 14
  );

  ctx.fillStyle = "#a7a198";
  ctx.font = '13px "Courier New", monospace';
  ctx.fillText(
    `Final score: ${score}`,
    canvas.width / 2,
    canvas.height / 2 + 22
  );
}

function render() {
  drawBackground();
  drawWords();
  drawStatus();
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

spawnWord();
requestAnimationFrame(gameLoop);
