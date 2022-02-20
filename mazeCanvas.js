const MazeCanvas = class {
  constructor(id, width, height) {
    const canvas = document.getElementById(id);
    this.ctx = canvas.getContext('2d');
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.mode = 1;
  }

  clearDevice() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  clearLittleGuy(userX, userY) {
    const { ctx, dx, dy } = this;
    ctx.strokeStyle = '#fff';
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.fillRect(userX * dx + 1, userY * dy + 1, dx - 2, dy - 2);

    if (this.mode === 2) {
      // probably a bit too much :/
      this.clearDevice();
    }
    ctx.stroke();
  }

  drawLittleGuy(userX, userY) {
    const {
      ctx, dx, dy,
    } = this;
    const R = dx * 0.1;
    ctx.strokeStyle = '#ccc';
    ctx.fillStyle = '#ccc';
    ctx.beginPath();
    ctx.arc(userX * dx + dx / 2, userY * dy + dy / 2, R, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.stroke();
    if (this.mode !== 0) {
      const { hWalls, vWalls } = this.maze;
      const M = vWalls.length;
      const N = hWalls.length;
      ctx.beginPath();
      ctx.strokeStyle = '#000';
      if (userX !== 0 && vWalls[userY][userX - 1]) {
        this.line(userX * dx, userY * dy, userX * dx, userY * dy + dy);
      }
      if (userY !== 0 && hWalls[userX][userY - 1]) {
        this.line(userX * dx, userY * dy, userX * dx + dx, userY * dy);
      }
      if (userX !== N - 1 && vWalls[userY][userX]) {
        this.line(userX * dx + dx, userY * dy, userX * dx + dx, userY * dy + dy);
      }
      if (userY !== M - 1 && hWalls[userX][userY]) {
        this.line(userX * dx, userY * dy + dy, userX * dx + dx, userY * dy + dy);
      }

      ctx.stroke();
    }
  }

  line(x1, y1, x2, y2) {
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
  }

  drawMaze(maze, mode) {
    const { hWalls, vWalls } = maze;
    const N = hWalls.length;
    const M = vWalls.length;
    const dx = this.canvasWidth / N;
    const dy = this.canvasHeight / M;
    this.mode = mode;
    const {
      ctx, canvasHeight, canvasWidth,
    } = this;
    this.dx = dx;
    this.dy = dy;
    this.maze = maze;
    this.clearDevice();
    ctx.beginPath();
    ctx.strokeStyle = '#000';
    // border
    this.line(0, 0, canvasWidth, 0);
    this.line(canvasWidth, 0, canvasWidth, canvasHeight);
    this.line(canvasWidth, canvasHeight, 0, canvasHeight);
    this.line(0, canvasHeight, 0, 0);
    if (mode !== 0) {
      return;
    }
    for (let j = 0; j < M; j++) {
      for (let i = 0; i < N; i++) {
        if (vWalls[j][i]) {
          this.line(dx + dx * i, dy * j, dx + dx * i, dy * j + dy);
        }
      }
    }
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < M; j++) {
        if (hWalls[i][j]) {
          this.line(dx * i, dy * j + dy, dx + dx * i, dy * j + dy);
        }
      }
    }
    ctx.stroke();
  }
};

export default MazeCanvas;
