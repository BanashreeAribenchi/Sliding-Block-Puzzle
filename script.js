class Board {
  constructor(originalImageWidth, originalImageHeight, rowCols) {
    this.rowCols = rowCols;
    this.width = 600; //Puzzle width size
    this.height = 600; //Puzzle height size

    // stores the width and height of each puzzle piece in pixels
    this.widthImagePiece = Math.floor(originalImageWidth / this.rowCols);
    this.heightImagePiece = Math.floor(originalImageHeight / this.rowCols);

    // size of each tile of the puzzle
    this.tileWidth = Math.floor(this.width / this.rowCols);
    this.tileHeight = Math.floor(this.height / this.rowCols);
  }
}

const canvas = document.querySelector("#canvas");
const context = canvas.getContext("2d");
let board;
const tileImages = [];
const tileIds = [];
const shuffledIds = [];
const img = new Image();
img.onload = cutImageIntoPieces;
img.src = "./dogs.png";

function cutImageIntoPieces() {
  //Create Base for Canvas properties
  board = new Board(this.originalWidth, this.originalHeight, 3);

  canvas.width = board.width; //canvas.width = 600
  canvas.height = board.height; //canvas.height = 600
  canvas.style.position = "absolute";
  canvas.style.border = "red 2px solid";

  // logic to cut images into multiple pieces
  let tempCanvas = document.createElement("canvas"); // create new HTML element <canvas> and assigs to the variable tempCanvas
  tempCanvas.width = board.tileWidth; //tempCanvas.width = 600
  tempCanvas.height = board.tileHeight; //tempCanvas.height = 600
  let tempContext = tempCanvas.getContext("2d"); //It's a way to work with the drawing surface of the canvas in your JavaScript code.

  for (let row = 0; row < board.rowCols; row++) {
    //board.rowCols = 3
    for (let col = 0; col < board.rowCols; col++) {
      tempContext.drawImage(
        this,
        row * board.widthImagePiece,
        col * board.heightImagePiece,
        this.widthImagePiece,
        this.heightImagePiece,
        0,
        0,
        tempCanvas.width,
        tempCanvas.height
      );
      tileImages.push(tempCanvas.toDataURL());
      let id = row + col * board.rowCols;
      tileIds.push(id);
    }
  }
}
