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
let destroyedWords = 0;

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
    destroyedWords++;
  }

  clearLock();
}

function handleKeydown(event) {
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
    if (words[i].y > canvas.height + 30) {
      if (words[i] === activeWord) {
        clearLock();
      }

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

  ctx.fillStyle = "#88847c";
  ctx.textAlign = "left";
  ctx.fillText(
    `DESTROYED ${destroyedWords}`,
    16,
    canvas.height - 18
  );

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

  ctx.fillStyle = "#88847c";
  ctx.textAlign = "right";
  ctx.fillText(
    `WORDS ${words.length}`,
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

window.addEventListener("keydown", handleKeydown);

spawnWord();
requestAnimationFrame(gameLoop);
