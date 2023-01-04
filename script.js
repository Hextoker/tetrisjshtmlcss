const canvas = document.getElementById("game-screen");
const ctx = canvas.getContext("2d");
let previousTime = 0;
const blockSize = 25; // Tamaño del bloque en pixels
let gameState = createGameState(); // Inicializa el estado del juego

function gameLoop(time) {
  // Calculamos el tiempo transcurrido desde la última iteración del bucle
  const deltaTime = time - previousTime;

  // Actualizamos el estado del juego
  updateGameState(gameState.grid, gameState.piece, deltaTime);

  // Dibujamos el juego en su estado actual
  drawGameScreen(gameState.grid, gameState.piece);

  // Guardamos el tiempo actual para calcular el deltaTime en la próxima iteración
  previousTime = time;

  // Establecemos un temporizador para ejecutar la función gameLoop de nuevo en el futuro
  requestAnimationFrame(gameLoop);
}

// Iniciamos el bucle del juego
requestAnimationFrame(gameLoop);

document.addEventListener("keydown", (event) => {
  handleKeyDown(event, gameState); // Maneja los eventos de teclado
});

function createGameState() {
  // Inicializar la matriz del juego
  const grid = [];
  for (let i = 0; i < 20; i++) {
    grid[i] = new Array(10).fill(0);
  }
  // Crear la pieza actual y la pieza siguiente
  const piece = createPiece();
  const nextPiece = createPiece();

  // Establecer la puntuación inicial y la bandera de fin de juego
  const score = 0;
  const gameOver = false;

  return { grid, piece, nextPiece, score, gameOver };
}

function updateGameState(grid, piece, deltaTime) {
  // Convertimos el deltaTime a segundos
  const deltaTimeInSeconds = deltaTime / 1000;

  // Calculamos la cantidad de filas que debemos mover la pieza en cada iteración
  // para que el juego se actualice a una tasa de 60 fotogramas por segundo
  const rowsToMove = deltaTimeInSeconds * 60;

  // Actualizamos la posición de la pieza
  piece.row += rowsToMove;
  // Dibujamos la pieza en su nueva posición
  drawPiece(piece);

  //   // Comprobar si la pieza puede moverse
  //   if (canPieceMoveDown(grid, piece)) {
  //     // Incrementar la fila de la pieza en uno
  //     piece.row += 1;

  //     // Añadir la pieza a la matriz del juego en su nueva posición
  //     addPieceToGrid(grid, piece);
  //   } else {
  //     // Añadir la pieza a la matriz del juego
  //     addPieceToGrid(grid, piece);

  //     // Generar una nueva pieza
  //     piece = createPiece();
  //   }

  //   // Comprobamos si hay líneas completas en la matriz del juego y Eliminamos las líneas completas
  //   const lines = getCompletedLines(grid);
  //   if (lines.length > 0) {
  //     // Actualizamos la puntuación del juego
  //     updateScore(lines.length);
  //   }
}

function drawPiece(piece) {
  // Recorremos la matriz de bloques de la pieza
  for (const block of piece.blocks) {
    // Calculamos la posición del bloque en la matriz del juego
    const row = piece.row + block.row;
    const column = piece.column + block.column;

    // Dibujamos el bloque en su posición correspondiente en la matriz del juego
    drawBlock(row, column);
  }

  // Establecemos el color de relleno de los bloques
  ctx.fillStyle = piece.color;
  // Rellenamos los bloques dibujados con el color especificado
  ctx.fill();
}

function drawBlock(row, column) {
  // Calculamos la posición del bloque en pixels
  const x = column * blockSize;
  const y = row * blockSize;

  // Dibujamos un rectángulo en el canvas
  ctx.beginPath();
  ctx.rect(x, y, blockSize, blockSize);
}


function getCompletedLines(grid) {
  // Comprobar si hay filas completas
  let rowsCompleted = 0;
  for (let row = 0; row < grid.length; row++) {
    if (grid[row].every((cell) => cell !== 0)) {
      // Eliminar la fila
      grid.splice(row, 1);
      grid.unshift(new Array(grid[0].length).fill(0));

      // Sumar puntos al marcador
      rowsCompleted += 1;
    }
  }
}

function addPieceToGrid(grid, piece) {
  for (const block of piece.blocks) {
    const row = piece.row + block.row;
    const column = piece.column + block.column;
    grid[row][column] = piece.color;
  }
}

function clearCompletedLines(grid) {
  let linesCleared = 0;
  for (let row = grid.length - 1; row >= 0; row--) {
    let complete = true;
    for (let column = 0; column < grid[row].length; column++) {
      if (grid[row][column] === 0) {
        complete = false;
        break;
      }
    }
    if (complete) {
      linesCleared++;
      grid.splice(row, 1);
      grid.unshift(Array(10).fill(0));
    }
  }
  return linesCleared;
}

function canPieceMoveDown(grid, piece) {
  console.log(grid);
  for (const block of piece.blocks) {
    const row = piece.row + block.row + 1;
    const column = piece.column + block.column;
    if (row >= grid.length || grid[row][column] > 0) {
      return false;
    }
  }
  return true;
}

function drawGameScreen(ctx, gameState) {

  const { grid, piece } = gameState;
  console.log(gameState);  
  // Dibuja la matriz del juego
  for (let row = 0; row < gameState.grid.length; row++) {
    for (let column = 0; column < grid[row].length; column++) {
      if (grid[row][column] > 0) {
        drawSquare(ctx, column, row, grid[row][column]);
      }
    }
  }

  // Dibuja la pieza actual
  for (const block of gameState.blocks) {
    drawSquare(
      ctx,
      gameState.column,
      gameState.row,
      gameState.color
    );
  }
  
}

function drawSquare(ctx, column, row, color) {
  ctx.fillStyle = color;
  ctx.fillRect(column * 30, row * 30, 30, 30);
  ctx.strokeRect(column * 30, row * 30, 30, 30);
}

function createPiece() {
  const grid = [];

  const PIECES = [
    // Forma en L
    [
      { row: 0, column: 1 },
      { row: 1, column: 1 },
      { row: 2, column: 1 },
      { row: 2, column: 0 },
    ],
    // Forma en S
    [
      { row: 0, column: 0 },
      { row: 0, column: 1 },
      { row: 1, column: 1 },
      { row: 1, column: 2 },
    ],
    // Forma en T
    [
      { row: 0, column: 1 },
      { row: 1, column: 0 },
      { row: 1, column: 1 },
      { row: 1, column: 2 },
    ],
    // Forma en I
    [
      { row: 0, column: 0 },
      { row: 0, column: 1 },
      { row: 0, column: 2 },
      { row: 0, column: 3 },
    ],
    // Forma en O
    [
      { row: 0, column: 0 },
      { row: 0, column: 1 },
      { row: 1, column: 0 },
      { row: 1, column: 1 },
    ],
  ];

  for (let row = 0; row < 20; row++) {
    grid[row] = [];
    for (let column = 0; column < 10; column++) {
      grid[row][column] = 0;
    }
  }

  // Elegimos una forma al azar
  const blocks = PIECES[Math.floor(Math.random() * PIECES.length)];

  // Elegir un color aleatorio
  const colors = ["red", "orange", "yellow", "green", "blue", "purple"];
  const colorIndex = Math.floor(Math.random() * colors.length);
  const color = colors[colorIndex];

  // Establecer la posición de inicio de la pieza en la matriz del juego
  const column = Math.floor(grid.length / 2) - 1;
  const row = 0;

  const piece = {
    column: column,
    row: 0,
    grid:blocks[0],
    blocks: blocks,
    color: color,
  };

  return piece; //{ column, row, blocks, color };
}

gameLoop(); // Inicia el bucle de juego
