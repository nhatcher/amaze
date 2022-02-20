// Creates a maze following the backtracker (?) algorithm
function createLabyrinth(N, M) {
  // vertical walls
  const vWalls = new Array(M);
  for (let j = 0; j < M; j++) {
    vWalls[j] = new Array(N - 1);
    for (let i = 0; i < N - 1; i++) {
      vWalls[j][i] = true;
    }
  }
  // horizontal walls
  const hWalls = new Array(N);
  for (let i = 0; i < N; i++) {
    hWalls[i] = new Array(M - 1);
    for (let j = 0; j < M - 1; j++) {
      hWalls[i][j] = true;
    }
  }
  // The wall to the right in square (i, j) would be:
  // vWalls[j][i]
  // The wall down to (i, j) would be
  // hWalls[i][j]
  let x = N - 1;
  let y = M - 1;
  const stack = [{ x, y }];
  let visitedCount = 1;
  const square = new Array(N);
  for (let i = 0; i < N * M; i++) {
    square[i] = new Array(M);
    for (let j = 0; j < M; j++) {
      square[i][j] = false;
    }
  }
  square[x][y] = true;
  while (visitedCount < N * M) {
    if ((x === 0 || square[x - 1][y])
                  && (x === N - 1 || square[x + 1][y])
                  && (y === 0 || square[x][y - 1])
                  && (y === M - 1 || square[x][y + 1])) {
      const sq = stack.pop();
      x = sq.x;
      y = sq.y;
    } else {
      let hasMoved = false;
      while (!hasMoved) {
        const iDirection = Math.floor(Math.random() * 4);
        switch (iDirection) {
          case 0: // DOWN
            if (y !== M - 1 && square[x][y + 1] !== true) {
              hWalls[x][y] = false;
              y++;
              hasMoved = true;
            }
            break;
          case 1: // UP
            if (y !== 0 && square[x][y - 1] !== true) {
              y--;
              hWalls[x][y] = false;
              hasMoved = true;
            }
            break;
          case 2: // RIGHT
            if (x !== N - 1 && square[x + 1][y] !== true) {
              vWalls[y][x] = false;
              x++;
              hasMoved = true;
            }
            break;
          case 3: // LEFT
            if (x !== 0 && square[x - 1][y] !== true) {
              x--;
              vWalls[y][x] = false;
              hasMoved = true;
            }
            break;
          default:
            break;
        }
      }
      stack.push({ x, y });
      square[x][y] = true;
      visitedCount++;
    }
  }

  return {
    hWalls,
    vWalls,
  };
}

export default createLabyrinth;
