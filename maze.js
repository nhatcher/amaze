import createLabyrinth from './backtracker.js';
import MazeCanvas from './mazeCanvas.js';

function getLevelSettings(level) {
  let totalTime;
  let width;
  let height;
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

const Maze = class {
  playing = false;

  // Class variables

  // mazeData => set of horizontal and vertical walls
  // userX, userY => position of the 'little guy'
  // mazeCanvas => class instance representing the maze
  // level
  // playing => true if we are playing the game

  // lastEventName => last arrow key pressed

  constructor(id, width, height) {
    this.mazeCanvas = new MazeCanvas(id, width, height);

    const arrows = document.getElementById('arrow-keys');
    if (window.innerWidth > 850) {
      arrows.style.display = 'none';
    } else {
      arrows.onclick = (event) => {
        const dispatchEvent = {
          'up-key': 'ArrowUp',
          'down-key': 'ArrowDown',
          'left-key': 'ArrowLeft',
          'right-key': 'ArrowRight',
        };
        this.processEvent(dispatchEvent[event.target.id]);
        setTimeout(this.keepMoving, 100);
      };
    }
    this.playing = false;
    this.loadData();
    this.greeting();

    document.addEventListener(
      'keydown',
      (event) => {
        if (!this.playing) {
          if (event.key === 'Enter') {
            // hacky!
            document.getElementById('game-start').click();
          }
          return;
        }
        this.processEvent(event.key);
        if (['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowUp'].includes(event.key)) {
          event.preventDefault();
        }
      },
      false,
    );
    this.lastEventName = '';
  }

  loadData() {
    if (localStorage.getItem('data')) {
      const data = JSON.parse(localStorage.getItem('data'));
      this.mazeData = data.mazeData;
      this.level = data.level;
      this.userX = data.userX;
      this.userY = data.userY;
    } else {
      this.level = 1;
      this.userX = 0;
      this.userY = 0;
      const opts = getLevelSettings(1);
      this.mazeData = createLabyrinth(opts.N, opts.M);
    }
  }

  saveData() {
    // level, maze, user_x, user_y
    const data = {
      mazeData: this.mazeData,
      level: this.level,
      userX: this.userX,
      userY: this.userY,
    };
    localStorage.setItem('data', JSON.stringify(data));
  }

  resetGame() {
    this.level = 1;
    this.userX = 0;
    this.userY = 0;
    const opts = getLevelSettings(this.level);
    this.mazeData = createLabyrinth(opts.N, opts.M);
    localStorage.removeItem('data');
    this.playing = false;
    this.greeting();
  }

  pauseGame() {
    const instructions = document.getElementById('instructions');
    instructions.innerHTML = `<div><h1>Pause</h1>
        <p>Your game is paused. You can close your window and keep playing at a later time</p>
        <div><button id="game-start">Continue playing</button></div>
        </div>
        `;
    const gameStartButton = document.getElementById('game-start');
    this.playing = false;
    gameStartButton.onclick = () => {
      instructions.innerHTML = '';
      this.playing = true;
    };
  }

  keepMoving() {
    // Keeps the little guy moving while there is only one posibility
    // Useful when there is no keyboard
    const { hWalls, vWalls } = this.mazeData;
    const M = vWalls.length;
    const N = hWalls.length;
    let hits = 0;
    const { userX, userY } = this;

    let sNext = '';
    if (userY !== 0 && !hWalls[userX][userY - 1] && this.lastEventName !== 'ArrowDown') {
      hits++;
      sNext = 'ArrowUp';
    }
    if (userY !== M - 1 && !hWalls[userX][userY] && this.lastEventName !== 'ArrowUp') {
      hits++;
      sNext = 'ArrowDown';
    }
    if (userX !== N - 1 && !vWalls[userY][userX] && this.lastEventName !== 'ArrowLeft') {
      hits++;
      sNext = 'ArrowRight';
    }
    if (userX !== 0 && !vWalls[userY][userX - 1] && this.lastEventName !== 'ArrowRight') {
      hits++;
      sNext = 'ArrowLeft';
    }
    if (hits === 1) {
      this.processEvent(sNext);
      setTimeout(this.keepMoving, 100);
    }
  }

  processEvent(eventName) {
    const { hWalls, vWalls } = this.mazeData;
    const { userX, userY } = this;
    const M = vWalls.length;
    const N = hWalls.length;
    this.mazeCanvas.clearLittleGuy(userX, userY);
    this.lastEventName = eventName;
    switch (eventName) {
      case 'ArrowUp':
        if (userY !== 0 && !hWalls[userX][userY - 1]) {
          this.userY = userY - 1;
        }
        break;
      case 'ArrowDown':
        if (userY !== M - 1 && !hWalls[userX][userY]) {
          this.userY = userY + 1;
        }
        break;
      case 'ArrowRight':
        if (userX !== N - 1 && !vWalls[userY][userX]) {
          this.userX = userX + 1;
        }
        break;
      case 'ArrowLeft':
        if (userX !== 0 && !vWalls[userY][userX - 1]) {
          this.userX = userX - 1;
        }
        break;
      case 'End':
        // Backdoor
        this.userX = N - 1;
        this.userY = M - 1;
        break;
      case 'Enter':
        // pass
        break;
      case 'Escape':
        this.resetGame();
        break;
      case ' ':
        this.saveData();
        this.pauseGame();
        break;
      default:
        console.log('Key pressed: ', eventName);
        break;
    }
    this.mazeCanvas.drawLittleGuy(this.userX, this.userY);
    if (this.userX === N - 1 && this.userY === M - 1) {
      this.nextLevel();
    }
  }

  startGame() {
    this.playing = true;
    this.mazeCanvas.drawLittleGuy(this.userX, this.userY);
  }

  playGame() {
    // mode cycles throw:
    // (0) light,
    // (1) you see where you have been,
    // (2) you only see where you are
    const mode = (this.level - 1) % 3;
    this.mazeCanvas.drawMaze(this.mazeData, mode);
    this.startGame();
  }

  nextLevel() {
    this.playing = false;
    const instructions = document.getElementById('instructions');
    instructions.innerHTML = `<div>
        <h1>Congratulations!</h1>
        <p>You passed level ${this.level}</p>
        <p>Click "Next" to the next level
        </p>
        <div><button id="game-start">Next Level</button></div>
        </div>`;
    const gameStartButton = document.getElementById('game-start');

    gameStartButton.onclick = () => {
      instructions.innerHTML = '';
      this.level++;
      this.userX = 0;
      this.userY = 0;
      const opts = getLevelSettings(this.level);
      this.mazeData = createLabyrinth(opts.N, opts.M);
      this.playGame();
    };
  }

  greeting() {
    const instructions = document.getElementById('instructions');
    instructions.innerHTML = `<div><h1> Instructions</h1>
        <p>You should move the little guy (small circle) in the upper left of the maze all to the way out in the lower right corner.
        </p>
        <p>You should use the arrow keys in your keyboard</p>
        <p>Go to level ${this.level}!</p>
        <p>Press "space bar" to pause and save the game and "escape" to reset</p>
        <div><button id="game-start">Start</button></div>
        </div>
        `;
    const gameStartButton = document.getElementById('game-start');
    gameStartButton.onclick = () => {
      instructions.innerHTML = '';
      this.playGame();
    };
  }
};

export default Maze;
