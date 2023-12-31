class Board {
  constructor(imgNWidth, imgNHeight, rowCols) {
    this.rowCols = rowCols; // Puzzle size
    this.width = 600; // Puzzle width size
    this.height = 600; // Puzzle height size

    // Stores the width and height of each puzzle piece in pixels
    this.widthIP = Math.floor(imgNWidth / this.rowCols);
    this.heightIP = Math.floor(imgNHeight / this.rowCols);

    // Size of each tile of the puzzle
    this.tileWidth = Math.floor(this.width / this.rowCols);
    this.tileHeight = Math.floor(this.height / this.rowCols);
  }
}

let canvas = document.getElementById("canvas"); //ref to canvas element and stores it in the canvas variable.
let ctx = canvas.getContext("2d"); //retrieves the 2D rendering context of the canvas
let board;
let tileImgs = [];
let tileIds = []; //original order of tiles
let shuffledIds = [];
let img = new Image(); //creates a new Image object
img.src = "./dogs.png";
img.onload = () => {
  //event handler
  //console.log("Image loaded successfully");
  cutImageIntoPieces.call(img);
  canvas.addEventListener("click", move);
};

function cutImageIntoPieces() {
  board = new Board(this.width, this.height, 3); //creates a new Board object
  canvas.width = board.width; //set to match the dimensions of the board
  canvas.height = board.height;
  canvas.style.position = "absolute";
  canvas.style.border = "beige 2px solid";
  //   ctx.fillStyle = "gray";
  //   ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < board.rowCols; row++) {
    //loop iterates over the rows and columns to cut the image into pieces
    for (let col = 0; col < board.rowCols; col++) {
      let tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = board.tileWidth;
      tmpCanvas.height = board.tileHeight;
      let tmpCtx = tmpCanvas.getContext("2d");
      if (row === board.rowCols - 1 && col === board.rowCols - 1) {
        tmpCtx.fillStyle = "gray";
        tmpCtx.fillRect(0, 0, board.tileWidth, board.tileHeight);
        tileImgs.push(tmpCanvas.toDataURL());
        console.log("tile images>", tileImgs);
        tileIds.push(-1); // Use -1 to represent the blank tile
      } else {
        tmpCtx.drawImage(
          this,
          row * board.widthIP,
          col * board.heightIP,
          board.widthIP,
          board.heightIP,
          0,
          0,
          tmpCanvas.width,
          tmpCanvas.height
        );
        tileImgs.push(tmpCanvas.toDataURL()); //converts the content of the canvas (image) into data URL
        let id = row + col * board.rowCols;

        tileIds.push(id); //data URLs are pushed into tileIds array
      }
    }
  }
  shuffle();
  // console.log("Shuffling is complete. Calling drawAllTiles now.");
  drawAllTiles();
}

function shuffle() {
  //shuffles the puzzle pieces until solved
  do {
    shuffledIds = [...tileIds];
    for (let i = shuffledIds.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledIds[i], shuffledIds[j]] = [shuffledIds[j], shuffledIds[i]];
    }
  } while (!isSolvable());
  console.log("Shuffled IDs: ", shuffledIds);
}

function isSolvable() {
  //checks if the current arrangement of puzzle pieces is solvable
  let inversions = 0;
  for (let i = 0; i < shuffledIds.length - 1; i++) {
    for (let j = i + 1; j < shuffledIds.length; j++) {
      if (
        shuffledIds[i] != -1 &&
        shuffledIds[j] != -1 &&
        shuffledIds[i] > shuffledIds[j]
      ) {
        inversions++;
      }
    }
  }
  return inversions % 2 === 0;
}

function drawAllTiles() {
  //uses a loop to iterate over the shuffled tile IDs
  ctx.clearRect(0, 0, canvas.width, canvas.height); //clears the entire canvas
  let loadedImages = 0; //number of puzzle pieces that have been successfully loaded and drawn
  for (let index = 0; index < shuffledIds.length; index++) {
    //loop that iterates over the shuffled tile IDs
    if (shuffledIds[index] == -1) continue;
    let coord = getRowColFromIndex(index); //converts a single index into the corresponding row and column.
    let x = coord.x * board.tileWidth;
    let y = coord.y * board.tileHeight;
    let imgURL = tileImgs[shuffledIds[index]];
    let imgObj = new Image();
    imgObj.onload = function () {
      ctx.drawImage(
        imgObj,
        0,
        0,
        imgObj.width,
        imgObj.height,
        x,
        y,
        board.tileWidth,
        board.tileHeight
      );
      loadedImages++;
      if (loadedImages === shuffledIds.length - 1) {
        console.log("Drawn tiles with shuffled IDs: ", shuffledIds);
      }
    };
    imgObj.src = imgURL;
  }
}

function getRowColFromIndex(i) {
  let row = i % board.rowCols;
  let col = Math.floor(i / board.rowCols);
  return { x: row, y: col };
}

function move(e) {
  //   console.log(e.target);
  e.preventDefault();
  let coords = getMouseCoords(e.clientX, e.clientY);
  let tileX = coords.x; //row number
  let tileY = coords.y; //col number
  let blankCoords = getRowColFromIndex(findBlankIndex());
  let blankX = blankCoords.x; // row number of blank tile
  let blankY = blankCoords.y; // col number of blank tile
  if (!hasBlankNeighbour(tileX, tileY, blankX, blankY)) return;
  // store pixels of tile with image into temp variable
  const swapDataImage = ctx.getImageData(
    //captures the image data of the clicked tile
    tileX * board.tileWidth, //x-axis coordinate of the top-left corner of the tile
    tileY * board.tileHeight,
    board.tileWidth, //width of the tile
    board.tileHeight
  );
  ctx.fillRect(
    //clears the space occupied by the clicked tile
    tileX * board.tileWidth,
    tileY * board.tileHeight,
    board.tileWidth,
    board.tileHeight
  );
  ctx.putImageData(
    //pastes the image data of the clicked tile onto the position of the blank tile.
    swapDataImage,
    blankX * board.tileWidth,
    blankY * board.tileHeight
  );

  const imgIdx = getIndexFromCoords(tileX, tileY); //represents the new position of the clicked tile
  const blankIdx = getIndexFromCoords(blankX, blankY);

  swapIndex(imgIdx, blankIdx); //logic to check if puzzle is solved or not
  if (isSolved()) {
    //new index for the blank tile after the swap
    canvas.removeEventListener("click", move);
    drawLastTile();
    setTimeout(() => alert("Congratulations!!!!!"), 0);
  }
}

function getMouseCoords(x, y) {
  let offset = canvas.getBoundingClientRect(); //returns object about size of element and its position relative
  let left = Math.floor(offset.left); //distance from the left edge of the viewport to the left edge of the canvas
  let top = Math.floor(offset.top);
  let row = Math.floor((x - left) / board.tileWidth);
  let col = Math.floor((y - top) / board.tileHeight);
  return { x: row, y: col };
}

function findBlankIndex() {
  //searches for index of blank tile
  for (
    let i = 0;
    i < shuffledIds.length;
    i++ //iterates through the elements of the shuffledIds array
  )
    if (shuffledIds[i] == -1) return i;
}

function hasBlankNeighbour(tileX, tileY, blankX, blankY) {
  // checks if neighbor is a blank tile
  if (tileX != blankX && tileY != blankY) return false;
  if (Math.abs(tileX - blankX) == 1 || Math.abs(tileY - blankY) == 1)
    return true;
  return false;
}

function getIndexFromCoords(x, y) {
  return x + y * board.rowCols;
}

function swapIndex(imgIdx, blankIdx) {
  shuffledIds[blankIdx] = shuffledIds[imgIdx]; //swaps the positions of the clicked tile and the blank tile
  shuffledIds[imgIdx] = -1;
}

function isSolved() {
  for (let i = 0; i < shuffledIds.length; i++) {
    if (shuffledIds[i] == -1) continue;
    if (shuffledIds[i] != tileIds[i]) return false;
  }
  return true;
}

function drawLastTile() {
  let blank = findBlankIndex();
  let coords = getRowColFromIndex(blank); //converts 1D index of blank tile into its corresponding 2D coordinates
  let x = coords.x; //extract the row (x) and column (y) coordinates from the coords object
  let y = coords.y;
  let imgURL = tileImgs[tileIds[blank]]; //retrieves the URL of the image for the blank tile from the tileImgs array
  const imgObj = new Image(); //objectused to load the image of the blank tile
  imgObj.onload = function () {
    ctx.drawImage(
      this,
      0,
      0,
      this.width,
      this.height,
      x * board.tileWidth,
      y * board.tileHeight,
      board.tileWidth,
      board.tileHeight
    );
  };
  imgObj.src = imgURL;
}
