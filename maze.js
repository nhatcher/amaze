const module = {};
let ctx;
let canvasWidth;
let canvasHeight;

let playing = false;

// data
let maze;
let userX;
let userY;
let dx;
let dy;
let level;
let mode;

function loadData() {
  if (localStorage.getItem('data')) {
    const data = JSON.parse(localStorage.getItem('data'));
    maze = data.maze;
    level = data.level;
    userX = data.user_x;
    userY = data.user_y;
    const opts = changeMode(level);
    dx = canvasWidth / opts.N;
    dy = canvasHeight / opts.M;
  } else {
    level = 1;
    userX = 0;
    userY = 0;
    const opts = changeMode(level);
    dx = canvasWidth / opts.N;
    dy = canvasHeight / opts.M;
    createLabyrinth(opts.N, opts.M);
  }
}

function saveData() {
  // level, maze, user_x, user_y
  const data = {
    maze,
    level,
    user_x: userX,
    user_y: userY,
  };
  localStorage.setItem('data', JSON.stringify(data));
}

function start(id, _canvasWidth, _canvasHeight) {
  canvasWidth = _canvasWidth;
  canvasHeight = _canvasHeight;
  const canvas = document.getElementById(id);
  ctx = canvas.getContext('2d');
  const arrows = document.getElementById('arrow-keys');
  arrows.onclick = function (event) {
    const htDistpatch = {
      'up-key': 'ArrowUp',
      'down-key': 'ArrowDown',
      'left-key': 'ArrowLeft',
      'right-key': 'ArrowRight',
    };
    processEvent(htDistpatch[event.target.id]);
    setTimeout(keepMoving, 100);
  };
  if (window.innerWidth > 850) {
    arrows.style.display = 'none';
  }
  playing = false;
  loadData();
  greeting();
}
module.start = start;

function cleardevice() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

function resetGame() {
  level = 1;
  userX = 0;
  userY = 0;
  const opts = changeMode(level);
  dx = canvasWidth / opts.N;
  dy = canvasHeight / opts.M;
  createLabyrinth(opts.N, opts.M);
  localStorage.removeItem('data');
  playing = false;
  greeting();
}

function pauseGame() {
  const instructions = document.getElementById('instructions');
  instructions.innerHTML = `<div><h1>Pause</h1>
        <p>Your game is paused. You can close your window and keep playing at a later time</p>
        <div><buttom id="game-start">Continue playing</buttom></div>
        </div>
        `;
  const game_start = document.getElementById('game-start');
  playing = false;
  game_start.onclick = function () {
    instructions.innerHTML = '';
    playing = true;
  };
}

function keepMoving() {
  // If there is only one position to go moves to that position
  const { hwalls } = maze;
  const { vwalls } = maze;
  const M = vwalls.length;
  const N = hwalls.length;
  let hits = 0;
  let sNext = '';
  if (userY !== 0 && !hwalls[userX][userY - 1] && sLastArrow !== 'ArrowDown') {
    hits++;
    sNext = 'ArrowUp';
  }
  if (userY !== M - 1 && !hwalls[userX][userY] && sLastArrow !== 'ArrowUp') {
    hits++;
    sNext = 'ArrowDown';
  }
  if (userX !== N - 1 && !vwalls[userY][userX] && sLastArrow !== 'ArrowLeft') {
    hits++;
    sNext = 'ArrowRight';
  }
  if (userX !== 0 && !vwalls[userY][userX - 1] && sLastArrow !== 'ArrowRight') {
    hits++;
    sNext = 'ArrowLeft';
  }
  if (hits === 1) {
    processEvent(sNext);
    setTimeout(keepMoving, 100);
  }
}

document.addEventListener('keydown', (event) => {
  if (!playing) {
    if (event.key === 'Enter') {
      // hacky!
      document.getElementById('game-start').click();
    }
    return;
  }
  processEvent(event.key);
  if (['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowUp'].includes(event.key)) {
    event.preventDefault();
  }
}, false);
let sLastArrow = '';

function processEvent(sEventName) {
  const { hwalls } = maze;
  const { vwalls } = maze;
  const M = vwalls.length;
  const N = hwalls.length;
  clearLittleGuy();
  sLastArrow = sEventName;
  switch (sEventName) {
    case 'ArrowUp':
      if (userY !== 0 && !hwalls[userX][userY - 1]) {
        userY--;
      }
      break;
    case 'ArrowDown':
      if (userY !== M - 1 && !hwalls[userX][userY]) {
        userY++;
      }
      break;
    case 'ArrowRight':
      if (userX !== N - 1 && !vwalls[userY][userX]) {
        userX++;
      }
      break;
    case 'ArrowLeft':
      if (userX !== 0 && !vwalls[userY][userX - 1]) {
        userX--;
      }
      break;
    case 'End':
      // Backdoor
      userX = N - 1;
      userY = M - 1;
      break;
    case 'Enter':
      // pass
      break;
    case 'Escape':
      resetGame();
      break;
    case ' ':
      saveData();
      pauseGame();
      break;
    default:
      console.log('Key pressed: ', sEventName);
      break;
  }
  drawLittleGuy();
  if (userX === N - 1 && userY === M - 1) {
    nextLevel();
  }
}

function startGame() {
  playing = true;
  drawLittleGuy();
}

function clearLittleGuy() {
  ctx.strokeStyle = '#fff';
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.fillRect(userX * dx + 1, userY * dy + 1, dx - 2, dy - 2);

  if (mode === 2) {
    // probably a bit too much :/
    cleardevice();
  }
  ctx.stroke();
}
function drawLittleGuy() {
  const R = dx * 0.1;
  ctx.strokeStyle = '#ccc';
  ctx.fillStyle = '#ccc';
  ctx.beginPath();
  ctx.arc(userX * dx + dx / 2, userY * dy + dy / 2, R, 0, Math.PI * 2, true);
  ctx.fill();
  ctx.stroke();
  if (mode !== 0) {
    const { hwalls } = maze;
    const { vwalls } = maze;
    const M = vwalls.length;
    const N = hwalls.length;
    ctx.beginPath();
    ctx.strokeStyle = '#000';
    if (userX !== 0 && vwalls[userY][userX - 1]) {
      line(userX * dx, userY * dy, userX * dx, userY * dy + dy);
    }
    if (userY !== 0 && hwalls[userX][userY - 1]) {
      line(userX * dx, userY * dy, userX * dx + dx, userY * dy);
    }
    if (userX !== N - 1 && vwalls[userY][userX]) {
      line(userX * dx + dx, userY * dy, userX * dx + dx, userY * dy + dy);
    }
    if (userY !== M - 1 && hwalls[userX][userY]) {
      line(userX * dx, userY * dy + dy, userX * dx + dx, userY * dy + dy);
    }

    ctx.stroke();
  }
}
function line(x1, y1, x2, y2) {
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
}

function changeMode() {
  // mode cycles throw:
  // (0) light,
  // (1) you see where you have been,
  // (2) you only see where you are
  let totalTime; let width; let
    height;
  mode = (level - 1) % 3;
  switch (level) {
    case 1:
      totalTime = 30;
      width = 15;
      height = 10;
      break;
    case 2:
      totalTime = 60;
      width = 15;
      height = 10;
      break;
    case 3:
      totalTime = 90;
      width = 15;
      height = 10;
      break;
    case 4:
      totalTime = 160;
      width = 25;
      height = 20;
      break;
    case 5:
      totalTime = 300;
      width = 40;
      height = 30;
      break;
    case 6:
      totalTime = 500;
      width = 40;
      height = 30;
      break;
    case 7:
      totalTime = 900;
      width = 50;
      height = 40;
      break;
    case 8:
      totalTime = 1000;
      width = 50;
      height = 40;
      break;
    case 9:
      totalTime = 1200;
      width = 60;
      height = 55;
      break;
    case 10:
      totalTime = 1500;
      width = 60;
      height = 55;
      break;
    default:
      throw Error('Invalid level');
  }
  return {
    totalTime,
    N: width,
    M: height,
  };
}

function drawMaze() {
  let i; let j;
  const { hwalls } = maze;
  const { vwalls } = maze;
  const N = hwalls.length;
  const M = vwalls.length;
  cleardevice();
  ctx.beginPath();
  ctx.strokeStyle = '#000';
  // border
  line(0, 0, canvasWidth, 0);
  line(canvasWidth, 0, canvasWidth, canvasHeight);
  line(canvasWidth, canvasHeight, 0, canvasHeight);
  line(0, canvasHeight, 0, 0);
  if (mode !== 0) {
    return;
  }
  for (j = 0; j < M; j++) {
    for (i = 0; i < N; i++) {
      if (vwalls[j][i]) {
        line(dx + dx * i, dy * j, dx + dx * i, dy * j + dy);
      }
    }
  }
  for (i = 0; i < N; i++) {
    for (j = 0; j < M; j++) {
      if (hwalls[i][j]) {
        line(dx * i, dy * j + dy, dx + dx * i, dy * j + dy);
      }
    }
  }
  ctx.stroke();
}

function createLabyrinth(N, M) {
  // vertical walls
  const vwalls = new Array(M);
  for (let j = 0; j < M; j++) {
    vwalls[j] = new Array(N - 1);
    for (let i = 0; i < N - 1; i++) {
      vwalls[j][i] = true;
    }
  }
  // horizontal walls
  const hwalls = new Array(N);
  for (let i = 0; i < N; i++) {
    hwalls[i] = new Array(M - 1);
    for (let j = 0; j < M - 1; j++) {
      hwalls[i][j] = true;
    }
  }
  // The wall to the right in square (i, j) would be:
  // vwalls[j][i]
  // The wall down to (i, j) would be
  // hwalls[i][j]
  let x = N - 1; let
    y = M - 1;
  const stack = [{ x, y }];
  let iVisited = 1;
  const square = new Array(N);
  for (let i = 0; i < N * M; i++) {
    square[i] = new Array(M);
    for (let j = 0; j < M; j++) {
      square[i][j] = false;
    }
  }
  square[x][y] = true;
  while (iVisited < N * M) {
    if ((x === 0 || square[x - 1][y])
                && (x === N - 1 || square[x + 1][y])
                && (y === 0 || square[x][y - 1])
                && (y === M - 1 || square[x][y + 1])) {
      const sq = stack.pop();
      x = sq.x;
      y = sq.y;
    } else {
      let bMoved = false;
      const a = 0;
      while (!bMoved) {
        const iDirection = Math.floor(Math.random() * 4);
        switch (iDirection) {
          case 0: // DOWN
            if (y !== M - 1 && square[x][y + 1] !== true) {
              hwalls[x][y] = false;
              y++;
              bMoved = true;
            }
            break;
          case 1: // UP
            if (y !== 0 && square[x][y - 1] !== true) {
              y--;
              hwalls[x][y] = false;
              bMoved = true;
            }
            break;
          case 2: // RIGHT
            if (x !== N - 1 && square[x + 1][y] !== true) {
              vwalls[y][x] = false;
              x++;
              bMoved = true;
            }
            break;
          case 3: // LEFT
            if (x !== 0 && square[x - 1][y] !== true) {
              x--;
              vwalls[y][x] = false;
              bMoved = true;
            }
            break;
          default:
            break;
        }
      }
      stack.push({ x, y });
      square[x][y] = true;
      iVisited++;
    }
  }

  maze = {
    hwalls,
    vwalls,
  };
}

function nextLevel() {
  playing = false;
  const instructions = document.getElementById('instructions');
  instructions.innerHTML = `<div>
        <h1>Congratulations!</h1>
        <p>You passed level ${level}</p>
        <p>Click "Next" to the next level
        </p>
        <div><buttom id="game-start">Next Level</buttom></div>
        </div>`;
  const game_start = document.getElementById('game-start');

  game_start.onclick = function () {
    instructions.innerHTML = '';
    level++;
    userX = 0;
    userY = 0;
    const opts = changeMode(level);
    dx = canvasWidth / opts.N;
    dy = canvasHeight / opts.M;
    createLabyrinth(opts.N, opts.M);
    playGame();
  };
}

function greeting() {
  const instructions = document.getElementById('instructions');
  instructions.innerHTML = `<div><h1> Instructions</h1>
        <p>You should move the little guy (small circle) in the upper left of the maze all to the way out in the lower right corner.
        </p>
        <p>You should use the arrow keys in your keyboard</p>
        <p>Go to level ${level}!</p>
        <p>Press "space bar" to pause and save the game and "escape" to reset</p>
        <div><buttom id="game-start">Start</buttom></div>
        </div>
        `;
  const game_start = document.getElementById('game-start');
  game_start.onclick = function () {
    instructions.innerHTML = '';
    playGame();
  };
}

function playGame() {
  drawMaze();
  startGame();
}

export default start;
