const Chessground = require('chessground').Chessground;

const targets = ["c1","d1","f1","g1","a2","b2","d2","f2","h2","a3","b3","c3","g3","h3","a5","b5","c5","g5","h5","a6","b6","d6","f6","h6","a7","c7","d7","f7","g7","b8","c8","d8","f8","g8","h8"]
let startTarget = "c1";

const forbidden = ["b1","e1","h1","c2","e2","g2","d3","e3","f3","a4","b4","c4","d4","e4","f4","g4","h4","d5","e5","f5","c6","e6","g6","b7","e7","h7","a8","e8"]

let timeRunning = false;
let movesCount = 0;
let interval; // the interval that updates the time 
let updateDelay = 100; // miliseconds for time update
let offset; // Date.now() from when game started
let clock; // miliseconds since start of game

// keys for localStorage
let timeKey = "knightManeuverTime";
let moveKey = "knightManeuverMoves";

/* 
 * Returns all squares the knight can move to 
 * (even ones the queen attacks)
 */
function knightMoves(square) {
    let coords = square.split("");
    let validMoves = [];

    let charCodeRangeMin = 97;
    let charCodeRangeMax = 104;
    
    let moves = [[2,1],[1,2],[-1,2],[-2,1],[-2,-1],[-1,-2],[1,-2],[2,-1]];
    
    for (let i = 0; i < 8; ++i) {
        let file = coords[0].charCodeAt(0) + moves[i][0];
        let rank = parseInt(coords[1]) + moves[i][1];

        if (file >= charCodeRangeMin
         && file <= charCodeRangeMax 
         && rank >= 1
         && rank <= 8) {
            move = String.fromCharCode(file) + rank;
            validMoves.push(move);
        }
    }
    return validMoves;
}

function drawTarget() {
    shape = {};
    shape["orig"] = target;
    shape["brush"] = "green";
    ground.setAutoShapes([shape]);

    ground.redrawAll();
}

function updateTime() {
    let now = Date.now();
    let diff = parseInt((now-offset)/1000);
    let minutes = parseInt(diff/60);
    let seconds = diff%60;
    
    document.getElementById("time").innerText = (""+minutes).padStart(2,"0") + ":" + (""+seconds).padStart(2,"0");
}

function updateHighscore() {
    console.log("updatehighscores");
    let now = Date.now();
    let diff = parseInt((now-offset)/1000);

    let currentTime = localStorage.getItem(timeKey) || 9999;
    let currentMoves = localStorage.getItem(moveKey) || 9999;

    if (diff < currentTime) {
        localStorage.setItem(timeKey, diff);
    }    
    if (movesCount < currentMoves) {
        localStorage.setItem(moveKey, movesCount);
    }

    displayHighscore();
}

function displayHighscore() {
    let time = localStorage.getItem(timeKey) || 0;
    let moves = localStorage.getItem(moveKey) || 0;
    
    let minutes = parseInt(time/60);
    let seconds = time%60;
    
    document.getElementById("timeHighscore").innerText = (""+minutes).padStart(2,"0") + ":" + (""+seconds).padStart(2,"0");
    document.getElementById("movesHighscore").innerText = moves;
}

/* Handles the move 
 * => Set new target
 * => create new valid moves
 */
function handleMove(orig, dest) {
    let knightSquare = dest;
    if (forbidden.includes(dest)) {
        // Cant jump into queen attacking squares
        ground.move(dest,orig);
        knightSquare = orig;
    } 
    movesCount++;
    document.getElementById("moves").innerText = movesCount;

    if (!timeRunning) {
        offset = Date.now();
        interval = setInterval(updateTime, updateDelay);
        timeRunning = true;
    }


    // at this point the knight is at the right position

    // readd the queen
    if (dest == "e4") {
        ground.newPiece({"color":"black", "role":"queen"}, "e4");
    }

    validMoves = {};
    validMoves[knightSquare] = knightMoves(knightSquare);
    ground.set({movable: {dests: validMoves}});

    // knight reached next target location
    if (knightSquare == target) {
        if (targets.indexOf(target)+1 == targets.length) {
            // done, hurray
            timeRunning = false;
            clearInterval(interval);
            updateHighscore();
        } else {
            // advance the target
            target = targets[targets.indexOf(target) + 1];
        }
    }

    drawTarget();
    ground.redrawAll();
}

function changeBoardSize(amount) {
    let size = parseInt(localStorage.getItem("chessgroundSize")) || 320;
    size += amount;
    localStorage.setItem("chessgroundSize", size)

    drawBoard();
}
window.changeBoardSize = changeBoardSize;

function drawBoard() {
    let size = parseInt(localStorage.getItem("chessgroundSize")) || 320;
    let b = document.getElementById("board");
    b.style.width = size + "px"
    b.style.height = size + "px"

    ground.redrawAll();
}
window.drawBoard = drawBoard;

/* setup for the control div */
function createControl() {
    let control = document.getElementById("control");

    let br = document.createElement("br");

    // score p with two spans for # moves and time
    let score = document.createElement("p");
    score.innerText = "Moves: ";
    let moves_span = document.createElement("span")
    moves_span.id = "moves";
    moves_span.innerText = 0;
    score.appendChild(moves_span);
    score.append(", Time: ");
    let time_span = document.createElement("span")
    time_span.id = "time";
    time_span.innerText = "00:00";
    score.appendChild(time_span);

    // highscore p with two spans for # moves and time
    let highscore = document.createElement("p");
    highscore.innerText = "[HIGHSCORE] Moves: ";
    let high_moves_span = document.createElement("span")
    high_moves_span.id = "movesHighscore";
    high_moves_span.innerText = 0;
    highscore.appendChild(high_moves_span);
    highscore.append(", Time: ");
    let high_time_span = document.createElement("span")
    high_time_span.id = "timeHighscore";
    high_time_span.innerText = "00:00";
    highscore.appendChild(high_time_span);


    let restart = document.createElement("button");
    restart.textContent = "Restart";
    restart.onclick = function() {resetScore(); setup();};
    restart.classList.add("button");

    let inc_label = document.createElement("label");
    inc_label.setAttribute("for", "inc");
    inc_label.innerText = "Change Board Size: ";

    let inc = document.createElement("button");
    inc.classList.add("button");
    let dec = document.createElement("button");
    dec.classList.add("button");
    inc.textContent = "+";
    dec.textContent = "-";
    inc.onclick = function() {changeBoardSize(20)};
    dec.onclick = function() {changeBoardSize(-20)};
    inc.id = "inc"

    control.append(score);
    control.append(inc_label);
    control.append(inc);
    control.append(dec);

    control.append(document.createElement("br"));

    control.append(restart);

    control.append(br);

    control.append(highscore);
}

function resetScore() {
    movesCount = 0;
    timeRunning = false;
    clearInterval(interval);

    document.getElementById("moves").innerText = movesCount;
    document.getElementById("time").innerText = "00:00";
}

/* (re-)Setup the board */
function setup() {
    const config = {fen: '8/8/8/8/4q3/8/8/N7 w - - 0 1',
        movable: {
            free: false,
            showDests: true,
            events: {
                after: handleMove
            },
            dests: {
                'a1': ['b3', 'c2']
            }
        },
    }
    const ground = Chessground(document.getElementById("board"), config);
    window.ground = ground; 
    ground.redrawAll();

    target = startTarget;
    drawBoard();
    drawTarget();
    ground.redrawAll();
}
window.setup = setup;

//starting point of the application
setup();
ground.redrawAll();
createControl();
ground.redrawAll();
displayHighscore();
ground.redrawAll();
