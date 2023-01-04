const canvas = document.getElementById("game-screen");
const ctx = canvas.getContext("2d");
canvas.height = 500;
canvas.width = 500;
const rows = 20;
const cols = 20;
const blockSize = canvas.width * 0.05; // Tamaño del bloque en pixels
const gridWidth = Math.floor(canvas.width / blockSize);
const gridHeight = Math.floor(canvas.height / blockSize);
let timeSinceLastRotation = 0;
let timeSinceLastMoveLeft = 0;
let timeSinceLastMoveRight = 0;
let previousTime = 0;
let timestamp = 0;
let gameSpeed = 5; // Velocidad inicial del juego (1 es la velocidad normal)
let leftKeyPressed = false;
let rightKeyPressed = false;
let upKeyPressed = false;

let game = createGameState(); // Inicializa el estado del juego

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

function createGameState() {
  // Inicializar la matriz del juego
  const grid = [];
  for (let i = 0; i < rows; i++) {
    grid[i] = new Array(cols).fill(0);
  }
  // Crear la pieza actual y la pieza siguiente
  const block = createPiece();
  const nextPiece = createPiece();

  // Establecer la puntuación inicial y la bandera de fin de juego
  const score = 0;
  const level = 1;
  const started = false;
  const over = false;

  return { grid, block, nextPiece, score, started, over, level };
}

// Función que se encarga de ejecutar el bucle principal del juego
function gameLoop(time) {
  // Calculamos el tiempo transcurrido desde la última iteración del bucle
  const deltaTime = time - previousTime;

  if (game.started && !game.over) {
    // Actualizamos el estado del juego
    updateGameState(game.grid, game.block, deltaTime);
  }
  // Dibujamos el juego en su estado actual
  drawGameScreen(game, ctx);

  previousTime = time;
  // Establecemos un temporizador para ejecutar la función gameLoop de nuevo en el futuro
  requestAnimationFrame(gameLoop);
}

// Función que se encarga de actualizar el estado del juego
function updateGameState(grid, block, deltaTime) {
  // Convertimos el deltaTime a segundos
  const deltaTimeInSeconds = deltaTime / 1000;
  // Calculamos la cantidad de filas que debemos mover la pieza en cada iteración
  // para que el juego se actualice a una tasa de 60 fotogramas por segundo
  const rowsToMove = deltaTimeInSeconds * gameSpeed;

  // Actualizamos la posición de la pieza
  block.row += rowsToMove;

  // Comprobamos si la pieza ha tocado el fondo o una pieza ya colocada en la matriz del juego
  if (checkCollision(grid, block)) {
    // Reseteamos la posición de la pieza siguiente
    game.nextPiece.column = Math.floor(gridWidth / 2) - 1;
    // Añadimos la pieza a la matriz del juego y eliminamos las filas completas
    game.block = game.nextPiece;
    // Creamos la siguiente pieza
    game.nextPiece = createPiece();
    // Alineamos la posicion de la siguiente pieza a la derecha
    game.nextPiece.column = 15;
  }

  timeSinceLastMoveLeft += deltaTime;
  // Si el usuario ha presionado la tecla de movimiento a la izquierda, movemos la pieza a la izquierda
  if (leftKeyPressed) {
    if (timeSinceLastMoveLeft > 100) {
      block.column--;
      // Comprobamos si la pieza se sale de los límites de la matriz o choca con otra pieza
      if (checkCollision(grid, block)) {
        // Si es así, volvemos a la posición anterior
        block.column++;
      }
      timeSinceLastMoveLeft = 0;
    }
  }

  timeSinceLastMoveRight += deltaTime;
  // Si el usuario ha presionado la tecla de movimiento a la derecha, movemos la pieza a la derecha
  if (rightKeyPressed) {
    if (timeSinceLastMoveRight > 100) {
      block.column++;
      // Comprobamos si la pieza se sale de los límites de la matriz o choca con otra pieza
      if (checkCollision(grid, block)) {
        // Si es así, volvemos a la posición anterior
        block.column--;
      }
      timeSinceLastMoveRight = 0;
    }
  }

  timeSinceLastRotation += deltaTime;
  // Si el usuario ha presionado la tecla de rotación, rotamos la pieza
  if (upKeyPressed) {
    if (timeSinceLastRotation > 150) {
      // Rotación cada medio segundo
      // Rotamos la pieza
      rotatePiece(block);
      // Comprobamos si la pieza se sale de los límites de la matriz o choca con otra pieza
      if (checkCollision(grid, block)) {
        // Si es así, volvemos a la posición anterior
        rotatePiece(block);
      }
      timeSinceLastRotation = 0; // Reinicia el tiempo transcurrido
    }
  }

  // Chequea el fin del juego
  if (checkGameOver(game.block, game.grid)) {
    game.over = true; // El juego ha terminado
    // Aquí puedes poner el código que quieres ejecutar en ese caso
    // ...
    alert("Game Over");
  }
}

function checkGameOver(piece, grid) {
  // Crea una copia de la pieza para probar si colisiona al moverse hacia abajo
  let testPiece = {
    row: piece.row,
    column: piece.column,
    blocks: piece.blocks,
  };
  let status = checkCollision(grid, testPiece);
  // console.log(`row:${testPiece.row} column:${testPiece.column} status:${status}`);
  // console.log(testPiece);
  // alert("asdas");
  return status;
}

function handleKeyDown(event) {
  switch (event.keyCode) {
    case 32: // Tecla izquierda
      game.started = true;
      break;
    case 37: // Tecla izquierda
      leftKeyPressed = true;
      break;
    case 38: // Tecla arriba
      upKeyPressed = true;
      break;
    case 39: // Tecla derecha
      rightKeyPressed = true;
      break;
    case 40: // Tecla abajo
      break;
  }
}

function handleKeyUp(event) {
  switch (event.keyCode) {
    case 37: // Tecla izquierda
      leftKeyPressed = false;
      break;
    case 38: // Tecla derecha
      upKeyPressed = false;
      break;
    case 39: // Tecla derecha
      rightKeyPressed = false;
      break;
  }
}

function rotatePiece(block, grid) {
  // Creamos una copia de la pieza
  let rotatedPiece = {
    column: block.column,
    row: block.row,
    blocks: block.blocks,
  };

  // Rotamos la copia de la pieza
  rotatedPiece.blocks = rotatedPiece.blocks.reverse();
  rotatedPiece.blocks = rotatedPiece.blocks[0].map((_, index) =>
    rotatedPiece.blocks.map((row) => row[index])
  );

  // Comprobamos si la pieza rotada colisiona
  if (checkCollision(grid, rotatedPiece)) {
    return;
  }

  // Si no hay colisión, asignamos la pieza rotada a la pieza original
  block.blocks = rotatedPiece.blocks;
}

function checkCollision(grid, piece) {
  // Recorremos los bloques de la pieza
  for (let row = 0; row < piece.blocks.length; row++) {
    for (let column = 0; column < piece.blocks[row].length; column++) {
      // Si el bloque es un 1, comprobamos si hay colisión
      if (piece.blocks[row][column] === 1) {
        // Calculamos la posición del bloque en el tablero
        let x = Math.floor(piece.column + column);
        let y = Math.floor(piece.row + row);
        // Si el bloque está fuera del tablero, hay colisión
        if (x < 0 || x >= gridWidth) {
          // console.log("colisionador verdadero");
          return true;
        }
        if (y + 1 >= gridHeight || y < 0) {
          registerPiece(piece);
          console.log("Fin del tablero");
          return true;
        }
        // Si el bloque está ocupado, hay colisión
        if (game.grid[y][x] === 1) {
          console.log("Colisiono con otro bloke sin llegar al final");
          return true;
        }
        if (game.grid[y + 1][x] === 1) {
          console.log("y:" + y + " x:" + x);
          console.log("Colisiono con otro bloke");
          registerPiece(piece);
          // console.log("colisionador verdadero");
          return true;
        }
      }
    }
  }

  // Si no hemos encontrado ninguna colisión, devolvemos false
  // console.log("colisionador falso");
  return false;
}

// Función para dfeterminar si una linea esta completa
function isRowComplete(row, grid) {
  // Comprueba si todos los bloques de la fila están ocupados
  return row.every((block) => block !== 0);
}

// Función que se encarga de añadir la pieza actual a la matriz del juego y eliminar las filas completas
function addPieceToGrid(grid, block) {
  block.blocks.forEach((row, rowIndex) => {
    row.forEach((column, blockIndex) => {});
  });
}

function registerPiece(piece) {
  for (let i = 0; i < piece.blocks.length; i++) {
    for (let j = 0; j < piece.blocks[i].length; j++) {
      if (piece.blocks[i][j] === 1) {
        let x = Math.floor(piece.column + j);
        let y = Math.floor(piece.row + i);
        game.grid[y][x] = 1;
      }
    }
  }

  return;
}

// Función que se encarga de dibujar el juego en su estado actual
function drawGameScreen(game, context) {
  // Si el juego no ha empezado, mostramos la pantalla de inicio
  if (!game.started) {
    drawStartScreen(context);
    return;
  }

  // Si el juego ha terminado, mostramos la pantalla de fin de juego
  if (game.over) {
    drawGameOverScreen(context);
    return;
  }

  // Borramos el canvas
  context.clearRect(0, 0, canvas.width, canvas.height);
  let html = "<table><tbody>";
  // Dibujamos el tablero
  for (let row = 0; row < game.grid.length; row++) {
    html += "<tr>";
    for (let column = 0; column < game.grid[row].length; column++) {
      if (isRowComplete(game.grid[row], game.grid)) {
        // La fila está completa
        // Aquí puedes poner el código que quieres ejecutar en ese caso
        game.grid.splice(row, 1); // Elimina la fila completa del tablero
        // game.grid.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); // Añade una fila vacía al principio del tablero
        game.grid.unshift(new Array(cols).fill(0)); // Añade una fila vacía al principio del tablero
        game.score++; // Incrementa la puntuación
        game.block = createPiece();
      }
      html += `<td>${game.grid[row][column]}</td>`;
      if (game.grid[row][column] === 1) {
        drawBlock(row, column, "gray");
      }
    }
    html += "</tr>";
  }
  html += "</tbody></table>";
  let tabla = document.getElementById("screen");
  tabla.innerHTML = html;

  if (game.started && !game.over) {
    // Dibujamos la pieza actual
    drawPiece(game.block);
    // Dibugamos la pieza que sigue a continuación
    game.nextPiece.column = 7;
    drawPiece(game.nextPiece);

    // Mostramos la puntuación y el nivel actual
    context.font = "30px Arial";
    context.fillText(`Puntuación: ${game.score}`, 10, 30);
    context.fillText(`Nivel: ${game.level}`, 10, 60);
  }
}

function drawStartScreen(context) {
  context.font = "40px Arial";
  context.fillText("Tetris", canvas.width / 2 - 50, canvas.height / 2 - 50);
  context.font = "20px Arial";
  context.fillText(
    "Pulsa espacio para empezar",
    canvas.width / 2 - 100,
    canvas.height / 2
  );
}

function drawGameOverScreen(context) {
  context.font = "40px Arial";
  context.fillText(
    "Fin de juego",
    canvas.width / 2 - 80,
    canvas.height / 2 - 50
  );
  context.font = "20px Arial";
  context.fillText(
    `Puntuación final: ${game.score}`,
    canvas.width / 2 - 100,
    canvas.height / 2
  );
}

function drawPiece(block) {
  // Recorremos cada bloque de la pieza
  for (let row = 0; row < block.blocks.length; row++) {
    for (let column = 0; column < block.blocks[row].length; column++) {
      // Si el bloque es un 1, dibujamos un cuadro en su posición correspondiente
      if (block.blocks[row][column] === 1) {
        drawBlock(block.row + row, block.column + column, block.color);
      }
    }
  }
}

// Función que se encarga de dibujar un bloque en el canvas
function drawBlock(row, column, color) {
  // Calculamos la posición del bloque en pixels
  const x = column * blockSize;
  const y = row * blockSize;
  // Dibujamos un rectángulo en el canvas
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.rect(x, y, blockSize, blockSize);
  ctx.fill();
  ctx.stroke();
}

// Función que se encarga de crear una nueva pieza
function createPiece() {
  // Generamos un número aleatorio entre 0 y 6 para determinar qué tipo de pieza se va a crear
  const type = Math.floor(Math.random() * 7);

  // Elegir un color aleatorio
  const colors = [
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "purple",
    "brown",
    "magenta",
    "cyan",
  ];
  const colorIndex = Math.floor(Math.random() * colors.length);
  const color = colors[colorIndex];
  const gridWidth = Math.floor(canvas.width / blockSize);
  const column = Math.floor(gridWidth / 2) - 1;
  const row = 0; //Math.floor(gridHeight / 2) - 1;

  // Creamos una pieza en función del tipo generado aleatoriamente
  switch (type) {
    case 0:
      // Pieza en forma de "I"
      return {
        row: row,
        column: column,
        color: color,
        blocks: [
          [0, 0, 0, 0],
          [1, 1, 1, 1],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
      };
    case 1:
      // Pieza en forma de "O"
      return {
        row: row,
        column: column,
        color: color,
        blocks: [
          [1, 1],
          [1, 1],
        ],
      };
    case 2:
      // Pieza en forma de "T"
      return {
        row: row,
        column: column,
        color: color,
        blocks: [
          [0, 1, 0],
          [1, 1, 1],
          [0, 0, 0],
        ],
      };
    case 3:
      // Pieza en forma de "S"
      return {
        row: row,
        column: column,
        color: color,
        blocks: [
          [0, 1, 1],
          [1, 1, 0],
          [0, 0, 0],
        ],
      };
    case 4:
      // Pieza en forma de "Z"
      return {
        row: row,
        column: column,
        color: color,
        blocks: [
          [1, 1, 0],
          [0, 1, 1],
          [0, 0, 0],
        ],
      };
    case 5:
      // Pieza en forma de "L"
      return {
        row: row,
        column: column,
        color: color,
        blocks: [
          [0, 0, 1],
          [1, 1, 1],
          [0, 0, 0],
        ],
      };
    case 6:
      // Pieza en forma de "J"
      return {
        row: row,
        column: column,
        color: color,
        blocks: [
          [1, 0, 0],
          [1, 1, 1],
          [0, 0, 0],
        ],
      };
    case 7:
      // Pieza en forma de "cruz"
      return {
        row: row,
        column: column,
        color: color,
        blocks: [
          [0, 1, 0],
          [1, 1, 1],
          [0, 1, 0],
        ],
      };
  }
}
gameLoop(1000);
