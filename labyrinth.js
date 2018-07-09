const labyrinth = (function () {
    let module = {};
    let ctx;
    let canvasWidth,
        canvasHeight;
    let maze;
    let playing = false;
    let user_x, user_y;
    let dx, dy;
    let level;
    let mode;

    function start(id, _canvasWidth, _canvasHeight) {
        canvasWidth = _canvasWidth;
        canvasHeight = _canvasHeight;
        var canvas = document.getElementById(id);
        ctx = canvas.getContext('2d');
        let arrows = document.getElementById('arrow-keys');
        arrows.onclick = function(event) {
            let htDistpatch = {
                'up-key': 'ArrowUp',
                'down-key': 'ArrowDown',
                'left-key': 'ArrowLeft',
                'right-key': 'ArrowRight'
            };
            processEvent(htDistpatch[event.target.id]);
            setTimeout(keepMoving, 100);
        };
        if (window.innerWidth>850) {
            arrows.style.visibility = 'hidden';
        } 

        greeting();
    }
    module.start = start;

    function cleardevice() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    }

    function keepMoving() {
        // If there is only one position to go moves to that position
        let hwalls = maze.hwalls;
        let vwalls = maze.vwalls;
        let M = vwalls.length;
        let N = hwalls.length;
        let hits = 0;
        let sNext = '';
        if (user_y !== 0 && !hwalls[user_x][user_y-1] && sLastArrow !== 'ArrowDown') {
            hits++;
            sNext = 'ArrowUp';
        }
        if (user_y !== M-1 && !hwalls[user_x][user_y] && sLastArrow !== 'ArrowUp') {
            hits++;
            sNext = 'ArrowDown';
        }
        if (user_x !== N-1 && !vwalls[user_y][user_x] && sLastArrow !== 'ArrowLeft') {
            hits++;
            sNext = 'ArrowRight';
        }
        if (user_x !== 0 && !vwalls[user_y][user_x-1] && sLastArrow !== 'ArrowRight') {
            hits++;
            sNext = 'ArrowLeft';
        }
        if (hits === 1) {
            processEvent(sNext);
            setTimeout(keepMoving, 100)
        }

    }

    document.addEventListener('keydown', (event) => {
        if (!playing) {
            return;
        }
        processEvent(event.key);
    }, false);
    let sLastArrow = '';

    function processEvent(sEventName) {
        let hwalls = maze.hwalls;
        let vwalls = maze.vwalls;
        let M = vwalls.length;
        let N = hwalls.length;
        clearLittleGuy();
        sLastArrow = sEventName;
        switch(sEventName) {
            case 'ArrowUp':
                if (user_y !== 0 && !hwalls[user_x][user_y-1]) {
                    user_y--;
                }
            break;
            case 'ArrowDown':
                if (user_y !== M-1 && !hwalls[user_x][user_y]) {
                    user_y++;
                }
            break;
            case 'ArrowRight':
                if (user_x !== N-1 && !vwalls[user_y][user_x]) {
                    user_x++;
                }
            break;
            case 'ArrowLeft':
                if (user_x !== 0 && !vwalls[user_y][user_x-1]) {
                    user_x--;
                }
            break;
            case 'End':
                // Backdoor
                user_x = N-1;
                user_y = M-1;
            break
            default:
                console.log(event.key)
            break;
        }
        drawLittleGuy();
        if (user_x === N-1 && user_y === M-1) {
            nextLevel();
        }
    };

    function startGame() {
        user_x = 0;
        user_y = 0;
        drawLittleGuy();
        playing = true;
    }
    function clearLittleGuy() {
        ctx.strokeStyle = '#fff';
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.fillRect(user_x*dx+1, user_y*dy+1, dx-2, dy-2);
        
        if (mode === 2) {
            // probably a bit too much :/
            cleardevice();
        }
        ctx.stroke();
    }
    function drawLittleGuy() {
        let R = dx*0.1;
        ctx.strokeStyle = '#ccc';
        ctx.fillStyle = '#ccc';
        ctx.beginPath();
        ctx.arc(user_x*dx+dx/2, user_y*dy+dy/2, R, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.stroke();
        if (mode !== 0) {
            let hwalls = maze.hwalls;
            let vwalls = maze.vwalls;
            let M = vwalls.length;
            let N = hwalls.length;
            ctx.beginPath();
            ctx.strokeStyle = '#000';
            if (user_x !== 0 && vwalls[user_y][user_x-1]) {
                line(user_x*dx, user_y*dy, user_x*dx, user_y*dy + dy);
            }
            if (user_y !== 0 && hwalls[user_x][user_y-1]) {
                line(user_x*dx, user_y*dy, user_x*dx+dx, user_y*dy);
            }
            if (user_x !== N-1 && vwalls[user_y][user_x]) {
                line(user_x*dx+dx, user_y*dy, user_x*dx+dx, user_y*dy + dy);
            }
            if (user_y !== M-1 && hwalls[user_x][user_y]) {
                line(user_x*dx, user_y*dy+dy, user_x*dx+dx, user_y*dy+dy);
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
        let totalTime, width, height;
        mode = (level-1) % 3;
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
        }
        return {
            totalTime: totalTime,
            N: width,
            M: height
        }
    }

    function drawMaze() {
        let i, j,
            hwalls = maze.hwalls,
            vwalls = maze.vwalls,
            N = hwalls.length,
            M = vwalls.length;
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
                    line(dx + dx*i, dy * j, dx + dx*i, dy * j + dy);
                }
            }
        }
        for (i = 0; i < N; i++) {
            for (j = 0; j < M; j++) {
                if (hwalls[i][j]) {
                    line(dx*i, dy * j+dy, dx + dx*i, dy * j + dy);
                }
            }
        }
        ctx.stroke();
    }

    function createLabyrinth(N, M) {
        // vertical walls
        let vwalls = new Array(M);
        for (let j=0; j<M; j++) {
            vwalls[j] = new Array(N-1);
            for (let i=0; i<N-1; i++) {
                vwalls[j][i] = true;
            }
        }
        // horizontal walls
        let hwalls = new Array(N);
        for (let i=0; i<N; i++) {
            hwalls[i] = new Array(M-1);
            for (let j=0; j<M-1; j++) {
                hwalls[i][j] = true;
            }
        }
        // The wall to the right in square (i, j) would be:
        // vwalls[j][i]
        // The wall down to (i, j) would be
        // hwalls[i][j]
        let x = N-1, y = M-1;
        let stack = [{x:x, y:y}];
        let iVisited = 1;
        let square = new Array(N);
        for (let i=0; i<N*M; i++) {
            square[i] = new Array(M);
            for (j=0; j<M; j++) {
                square[i][j] = false;
            }
        }
        square[x][y] = true;
        while (iVisited < N*M) {
            if ((x === 0 || square[x-1][y]) &&
                (x === N-1 || square[x+1][y]) &&
                (y === 0 || square[x][y-1]) &&
                (y === M-1 || square[x][y+1])) {

                let sq = stack.pop();
                x = sq.x;
                y = sq.y;
            } else {
                let bMoved = false;
                let a = 0;
                while (!bMoved) {
                    let iDirection = Math.floor(Math.random()*4);
                    switch(iDirection) {
                        case 0: // DOWN
                            if(y !== M-1 && square[x][y+1] !== true) {
                                hwalls[x][y] = false;
                                y++;
                                bMoved = true;
                            }
                            break;
                        case 1: // UP
                            if(y !== 0 && square[x][y-1] !== true) {
                                y--;
                                hwalls[x][y] = false;
                                bMoved = true;
                            }
                            break;
                        case 2: // RIGHT
                            if(x !== N-1 && square[x+1][y] !== true) {
                                vwalls[y][x] = false;
                                x++;
                                bMoved = true;
                            }
                            break;
                        case 3: // LEFT
                            if(x !== 0 && square[x-1][y] !== true) {
                                x--;
                                vwalls[y][x] = false;
                                bMoved = true;
                            }
                            break;
                        default:
                            break;
                    }
                }
                stack.push({x:x, y:y});
                square[x][y] = true;
                iVisited++;
            }
        }

        maze = {
            hwalls: hwalls,
            vwalls: vwalls
        }
    }

    function nextLevel() {
        playing = false;
        let instructions = document.getElementById('instructions');
        instructions.innerHTML = `<div>
        <h1>Congratulations!</h1>
        <p>You passed level ${level}</p>
        <p>Click "Next" to the next level
        </p>
        <div><buttom id="game-start">Next Level</buttom></div>
        </div>`;
        let game_start = document.getElementById('game-start');
        game_start.onclick = function() {
            instructions.innerHTML = '';
            level++;
            playGame();
        }

    }

    function greeting() {
        let instructions = document.getElementById('instructions');
        instructions.innerHTML = `<div><h1> Instructions</h1>
        <p>You should move the little guy (small circle) in the upper left of the maze all to the way out in the lower right corner.
        </p>
        <p>You should use the arrow keys in your keyboard</p>
        <p>Go to level 1!</p>
        <div><buttom id="game-start">Start</buttom></div>
        </div>
        `;
        let game_start = document.getElementById('game-start');
        game_start.onclick = function() {
            instructions.innerHTML = '';
            level = 1;
            playGame();
        }
    }

    function playGame() {
        let levelPoints = 1;

        let opts = changeMode(level);
        dx = canvasWidth/opts.N;
        dy = canvasHeight/opts.M;

        createLabyrinth(opts.N, opts.M);
        drawMaze();
        startGame();
    }

    return module;
})();