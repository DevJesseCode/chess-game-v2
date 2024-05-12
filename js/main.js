const canvas = document.querySelector("canvas"); // Remember to select with id for final build
const ctx = canvas.getContext("2d");
const dimension = Math.round(
    Math.min(window.innerHeight, window.innerWidth) * 0.9 - 16
);
const squareSize = 0.125 * dimension;
const isMobile = navigator.userAgentData.toJSON().mobile
const chessboard = [
    ["br", "bh", "bb", "bq", "bk", "bb", "bh", "br"], // black generals
    [...new Array(8).fill("bp")], // black pawns
    // ...new Array(4).fill([...new Array(8).fill("")]), // approach has been scrapped for duplication along columns
    [...new Array(8).fill("")], // *blank squares
    [...new Array(8).fill("")], //
    [...new Array(8).fill("")], //
    [...new Array(8).fill("")], // *blank squares
    [...new Array(8).fill("wp")], // white pawns
    ["wr", "wh", "wb", "wq", "wk", "wb", "wh", "wr"] // white generals
];
/*
    The previous approach for setting blank squares was scrapped as it caused placed pieces to be duplicated
    throughout row 2 to row 5 of whatever column they were placed in :(
*/
const eventCallbacks = {
    mousedownCanvas: function (event) {
        if (moveData["md"]) return true
        const { x, y } = event;
        const bcr = canvas.getBoundingClientRect();
        const row = Math.floor((y - bcr.y) / squareSize);
        const col = Math.floor((x - bcr.x) / squareSize);
        moveData["sy"] = row;
        moveData["sx"] = col;
        moveData["piece"] = chessboard[row][col];
        moveData["md"] = true;
        if (row % 2) {
            ctx.fillStyle = col % 2 ? "#999999" : "#666666";
        } else {
            ctx.fillStyle = col % 2 ? "#666666" : "#999999";
        }
        canvas.static = new Image();
        canvas.static.src = canvas.toDataURL("base64");
        ctx.fillRect(
            squareSize * col,
            squareSize * row,
            squareSize,
            squareSize
        );
        canvas.addEventListener("mousemove", eventCallbacks.mousemoveCanvas);
        canvas.addEventListener("mouseup", eventCallbacks.mouseupCanvas);
    },
    mouseupCanvas: function ({ x, y }) {
        const bcr = canvas.getBoundingClientRect();
        const row = Math.floor((y - bcr.y) / squareSize);
        const col = Math.floor((x - bcr.x) / squareSize);
        moveData["dy"] = row;
        moveData["dx"] = col;
        moveData["md"] = false;
        placePiece();
        canvas.removeEventListener("mousemove", eventCallbacks.mousemoveCanvas);
    },
    mousemoveCanvas: function ({ x, y }) {
        const bcr = canvas.getBoundingClientRect();
        const row = Math.floor((y - bcr.y) / squareSize);
        const col = Math.floor((x - bcr.x) / squareSize);
        moveData["cy"] = y - bcr.y;
        moveData["cx"] = x - bcr.x;
        moveData["piece"] && drawMovingPiece();
    }
};
const moveData = { cx: 0, cy: 0, sx: 0, sy: 0, dx: 0, dy: 0 };
const fr = new FileReader();
const images = {};
let drawIndex = 0;
let piecesFetched = 0;
let piece = "";
canvas.height = dimension;
canvas.width = dimension;
fr.onloadend = read => {
    const dataURL = read.target.result;
    images[piece].dataURL = dataURL;
    console.log(this);
};

Image.prototype.setSourceAsDataURL = function () {
    const img = this;
    const { piece } = img;
    img.fr.onloadend = function (read) {
        const dataURL = read.target.result;
        img.dataURL = dataURL;
        img.src = dataURL;
        piecesFetched++;
    };
    fetch(`/img/${piece}.svg`)
        .then(response => response.blob())
        .then(result => {
            this.blob = result;
            this.fr.readAsDataURL(result);
        })
        .catch(err => console.warn(err));
};
for (let i = 0; i < 8; i++) {
    function setupImageData(row) {
        piece = chessboard[row][i];
        images[piece] = new Image();
        images[piece].fr = new FileReader();
        images[piece]["piece"] = piece;
        images[piece].setSourceAsDataURL();
    }
    setupImageData(0);
    setupImageData(7);
    if (i === 7) {
        setupImageData(1);
        setupImageData(6);
    }
}

function drawSquares() {
    const loc = chessboard[Math.floor(drawIndex / 8)][drawIndex % 8];
    const img = images[loc];
    let x = ((drawIndex % 8) / 8) * dimension;
    let y = (Math.floor(drawIndex / 8) / 8) * dimension;
    if (!drawIndex) {
        ctx.fillStyle = "#000";
        ctx.clearRect(0, 0, dimension, dimension);
    }
    if (Math.floor(drawIndex / 8) % 2) {
        ctx.fillStyle = drawIndex % 2 ? "#999999" : "#666666";
    } else {
        ctx.fillStyle = drawIndex % 2 ? "#666666" : "#999999";
    }
    ctx.fillRect(x, y, squareSize, squareSize);
    img && ctx.drawImage(img, x + 5, y + 5, squareSize - 10, squareSize - 10);
    drawIndex++;
    drawIndex < 64 ? requestAnimationFrame(drawSquares) : (drawIndex = 0);
}
function firstDraw() {
    if (piecesFetched === 18) {
        const loadEl = document.querySelector(".loading");
        loadEl.querySelector("#loadMsg").textContent = "Done!";
        setTimeout(() => {
            loadEl.style.display = "none";
            requestAnimationFrame(drawSquares);
        }, 2000);
    } else {
        setTimeout(firstDraw, 300);
    }
}
function drawMovingPiece() {
    const { piece, cx, cy, sx, sy } = moveData;
    const img = images[piece];
    const draw = { x: cx + 5 - squareSize / 2, y: cy + 5 - squareSize / 2 };
    ctx.clearRect(0, 0, dimension, dimension);
    ctx.drawImage(canvas.static, 0, 0, dimension, dimension);
    if (sy % 2) {
        ctx.fillStyle = sx % 2 ? "#999999" : "#666666";
    } else {
        ctx.fillStyle = sx % 2 ? "#666666" : "#999999";
    }
    ctx.fillRect(squareSize * sx, squareSize * sy, squareSize, squareSize);
    ctx.drawImage(img, draw.x, draw.y, squareSize - 10, squareSize - 10);
}
async function placePiece() {
    const { piece, sx, sy, dx, dy } = moveData;
    const move = await checkMove(sx, sy, dx, dy)
    ctx.clearRect(0, 0, dimension, dimension);
    ctx.drawImage(canvas.static, 0, 0, dimension, dimension);
    if (!piece || !move.valid) return false;
    chessboard[dy][dx] = chessboard[sy][sx];
    chessboard[sy][sx] = "";
    if (sy % 2) {
        ctx.fillStyle = sx % 2 ? "#999999" : "#666666";
    } else {
        ctx.fillStyle = sx % 2 ? "#666666" : "#999999";
    }
    ctx.fillRect(squareSize * sx, squareSize * sy, squareSize, squareSize);
    if (dy % 2) {
        ctx.fillStyle = dx % 2 ? "#999999" : "#666666";
    } else {
        ctx.fillStyle = dx % 2 ? "#666666" : "#999999";
    }
    ctx.fillRect(squareSize * dx, squareSize * dy, squareSize, squareSize);
    if (move.special.enpassant) {
        let pos = move.special.enpassant
        if (pos[0] % 2) {
            ctx.fillStyle = pos[1] % 2 ? "#999999" : "#666666";
        } else {
            ctx.fillStyle = pos[1] % 2 ? "#666666" : "#999999";
        }
        ctx.fillRect(squareSize * pos[1], squareSize * pos[0], squareSize, squareSize);
        chessboard[pos[0]][pos[1]] = ""
    }
    ctx.drawImage(
        images[piece],
        squareSize * dx + 5,
        squareSize * dy + 5,
        squareSize - 10,
        squareSize - 10
    );
}
async function checkMove(fx, fy, tx, ty) {
    const samePos = (fx === tx) && (fy === ty)
    const sameCamp = (chessboard[fy][fx][0] === chessboard[ty][tx][0])
    if (samePos || sameCamp) return false
    const move = await fetch(
        `/verify?board=${encodeURI(JSON.stringify(
            chessboard
        ))}&fx=${fx}&fy=${fy}&tx=${tx}&ty=${ty}`
    )
        .then(response => response.json())
        .catch(err => console.log(err));
    move.valid = !samePos && !sameCamp && move.valid
    return move;
}
document.addEventListener(
    "keydown",
    ({ key }) => key === "p" && requestAnimationFrame(drawSquares)
);
canvas.addEventListener("mousedown", eventCallbacks.mousedownCanvas);
firstDraw();
