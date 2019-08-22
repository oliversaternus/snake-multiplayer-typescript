var socket = io();
var movement = "right";
var scoresElement = document.getElementById("scores");
var highscoresElement = document.getElementById("highscores");
var container = document.getElementById("container");
var game = document.getElementById('game');
var background = document.getElementById('background');
var gameContext = game.getContext('2d');
var backgroundContext = background.getContext("2d");
var possibleColors = [];
var allColors = ['yellow', 'orange', 'red', 'greenyellow', 'green', 'violet', 'magenta', 'lightskyblue'];
var colorElements = [];
var chosenColor = 'yellow';

function initializeColors() {
  allColors.forEach(c => colorElements.push(document.getElementById('colors-' + c)));
  chooseColor('yellow');
}

function chooseColor(color) {
  const index = allColors.findIndex(c => c === color);
  const prevIndex = allColors.findIndex(c => c === chosenColor);
  if (index === -1 || prevIndex === -1) {
    return;
  }
  chosenColor = color;
  colorElements[prevIndex].style = '';
  colorElements[index].style = 'border: 4px solid #ffffff;';
}

function drawNet(ctx, height, width) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#566c8b";
  for (let i = 0; i < 70; i++) {
    ctx.beginPath();
    ctx.moveTo(height * i / 70, 0);
    ctx.lineTo(height * i / 70, width);
    ctx.stroke();
  }
  for (let i = 0; i < 70; i++) {
    ctx.beginPath();
    ctx.moveTo(0, width * i / 70);
    ctx.lineTo(height, width * i / 70);
    ctx.stroke();
  }
}

function renderScores(scores) {
  scoresElement.innerHTML = scores.map(s => {
    const name = '<div class="scores-name">' + s.name + '</div>';
    const points = '<div class="scores-points">' + s.points + '</div>';
    const color = '<div class="scores-color" style="background-color:' + s.color + '"></div>';
    return '<div class="scores-item">' + color + name + points + '</div>';
  }).join("");
}

function renderHighScores(highscores) {
  highscoresElement.innerHTML = highscores.map(s => {
    const name = '<div class="highscores-name">' + s.name + '</div>';
    const points = '<div class="highscores-points">' + s.score + '</div>';
    return '<div class="highscores-item">' + name + points + '</div>';
  }).join("");
}

function resize() {
  const widthRatio = roundTo5th(window.innerWidth / 1086);
  const heightRatio = roundTo5th(window.innerHeight / 703);
  const transformRatio = widthRatio < heightRatio ? widthRatio : heightRatio;
  if (widthRatio < 1 || heightRatio < 1) {
    container.style = "transform: scale(" + transformRatio + ");";
  }
}

function roundTo5th(num) {
  return Math.floor(num / 0.2) * 0.2;
}

function keyPressed(e) {
  switch (e.code) {
    case "ArrowUp":
      if (movement === "down") {
        return;
      }
      movement = "up";
      break;
    case "ArrowDown":
      if (movement === "up") {
        return;
      }
      movement = "down";
      break;
    case "ArrowLeft":
      if (movement === "right") {
        return;
      }
      movement = "left";
      break;
    case "ArrowRight":
      if (movement === "left") {
        return;
      }
      movement = "right";
      break;
  }
  socket.emit('action', { direction: movement });
}

function drawGame(fields) {
  gameContext.clearRect(0, 0, 700, 700);
  fields.forEach(field => {
    gameContext.fillStyle = field.color;
    gameContext.beginPath();
    gameContext.rect(field.x * 10 + 0.5, field.y * 10 + 0.5, 9, 9);
    gameContext.fill();
  });
}

function joinGame(name, color) {
  socket.emit("join", { name: name, color: color });
  window.addEventListener('keydown', keyPressed);
  document.getElementById("join-form").style = "display:none;";
};

function clickedJoin() {
  const name = document.getElementById("name-input").value;
  const color = chosenColor;
  joinGame(name, color);
}

function initializeGame() {
  game.width = 700;
  game.height = 700;
  gameContext.translate(0.5, 0.5);

  background.width = 700;
  background.height = 700;
  backgroundContext.translate(0.5, 0.5);

  drawNet(backgroundContext, 700, 700);
  resize();
  socket.on('state', drawGame);
  socket.on('highscore', renderHighScores);
  socket.on('score', renderScores);
  window.addEventListener("resize", resize);
}

initializeColors();
initializeGame();
