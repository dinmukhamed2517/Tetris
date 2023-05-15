import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent{

}
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.grid') as HTMLElement;
  let blocks = Array.from(document.querySelectorAll('.grid div')) as HTMLElement[];
  const scoreDisplay = document.querySelector('#score') as HTMLElement;
  const startBtn = document.querySelector('#start-btn') as HTMLElement;
  const width = 10;
  const gameOverSound = new Audio("/assets/sounds/Gameover.wav")
  const lineClearSound = new Audio("/assets/sounds/Lineclear.wav")
  const DropSound = new Audio("/assets/sounds/Drop.wav")
  let nextRandom = 0;
  let timerId: number;
  let score = 0;
  let isGameOver = false;
  const colors = [
    'red',
    'orange',
    'blue',
    'purple',
    'green'
  ];

  const lShape = [
    [1, width + 1, width * 2 + 1, 2],
    [width, width + 1, width + 2, width * 2 + 2],
    [1, width + 1, width * 2 + 1, width * 2],
    [width, width * 2, width * 2 + 1, width * 2 + 2]
  ];

  const zShape = [
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1]
  ];

  const tShape = [
    [1, width, width + 1, width + 2],
    [1, width + 1, width + 2, width * 2 + 1],
    [width, width + 1, width + 2, width * 2 + 1],
    [1, width, width + 1, width * 2 + 1]
  ];

  const oShape = [
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1]
  ];

  const iShape = [
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3]
  ];

  const theTetrominoes = [lShape, zShape, tShape, oShape, iShape];

  let currentPos = 4;
  let currentRot = 0;

  console.log(theTetrominoes[0][0]);

  let random = Math.floor(Math.random() * theTetrominoes.length);
  let current = theTetrominoes[random][currentRot];

  function draw() {
    current.forEach(index => {
      blocks[currentPos + index].classList.add('shapes');
      blocks[currentPos + index].style.backgroundColor = colors[random];
    });
  }
  function remove() {
    current.forEach(index => {
      blocks[currentPos + index].classList.remove('shapes');
      blocks[currentPos + index].style.backgroundColor = '';
    });
  }

  function control(e: KeyboardEvent) {
    if (e.keyCode === 37) {
      moveLeft();
    } else if (e.keyCode === 38) {
      rotate();
    } else if (e.keyCode === 39) {
      moveRight();
    } else if (e.keyCode === 40) {
      moveDown();
    }
  }
  document.addEventListener('keyup', control);

  function moveDown() {
    remove();
    currentPos += width;
    draw();
    freeze();
  }

  function freeze() {
    if (current.some(index => blocks[currentPos + index + width].classList.contains('taken'))) {
      current.forEach(index => blocks[currentPos + index].classList.add('taken'));
      random = nextRandom;
      nextRandom = Math.floor(Math.random() * theTetrominoes.length);
      current = theTetrominoes[random][currentRot];
      currentPos = 4;
      draw();
      displayShape();
      addScore();
      gameOver();
      DropSound.play()
    }
  }

  function moveLeft() {
    remove();
    const isLeftEdge = current.some(index => (currentPos + index) % width === 0);
    if (!isLeftEdge) currentPos -= 1;
    if (current.some(index => blocks[currentPos + index].classList.contains('taken'))) {
      currentPos += 1;
    }
    draw();
  }

  function moveRight() {
    remove();
    const isRightEdge = current.some(index => (currentPos + index) % width === width - 1);
    if (!isRightEdge) currentPos += 1;
    if (current.some(index => blocks[currentPos + index].classList.contains('taken'))) {
      currentPos -= 1;
    }
    draw();
  }

  function isRight() {
    return current.some(index => (currentPos + index + 1) % width === 0);
  }

  function isLeft() {
    return current.some(index => (currentPos + index) % width === 0);
  }

  function checkRotatedPosition(P: number) {
    P = P || currentPos;
    if ((P + 1) % width < 4) {
      if (isRight()) {
        currentPos += 1;
        checkRotatedPosition(P);
      }
    } else if (P % width > 5) {
      if (isLeft()) {
        currentPos -= 1;
        checkRotatedPosition(P);
      }
    }
  }
  function rotate() {
    remove();
    currentRot++;
    if (currentRot === current.length) {
      currentRot = 0;
    }
    current = theTetrominoes[random][currentRot];
    checkRotatedPosition(currentPos);
    draw();
  }

  const displaySquares = document.querySelectorAll('.mini-grid div');
  const displayWidth = 4;
  const displayIndex = 0;


  const nextBlocks = [
    [1, displayWidth + 1, displayWidth * 2 + 1, 2],
    [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1],
    [1, displayWidth, displayWidth + 1, displayWidth + 2],
    [0, 1, displayWidth, displayWidth + 1],
    [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1],
  ];

  function displayShape() {
    displaySquares.forEach((square) => {
      square.classList.remove('shapes');

    });
    nextBlocks[nextRandom].forEach((index) => {
      displaySquares[displayIndex + index].classList.add('shapes');

    });
  }

  startBtn.addEventListener('click', () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = 0;
    } else {
      draw();
      timerId = setInterval(moveDown, 1000);
      nextRandom = Math.floor(Math.random() * theTetrominoes.length);
      displayShape();
    }
  });

  function addScore() {
    for (let i = 0; i < 199; i += width) {
      const row = [
        i,
        i + 1,
        i + 2,
        i + 3,
        i + 4,
        i + 5,
        i + 6,
        i + 7,
        i + 8,
        i + 9,
      ];

      if (row.every((index) => blocks[index].classList.contains('taken'))) {
        score += 10;
        scoreDisplay.innerHTML = score.toString();
        row.forEach((index) => {
          blocks[index].classList.remove('taken');
          blocks[index].classList.remove('shapes');
          blocks[index].style.backgroundColor = '';
        });
        const blocksRemoved = blocks.splice(i, width);
        blocks = blocksRemoved.concat(blocks);
        blocks.forEach((cell) => grid.appendChild(cell));
        lineClearSound.play();
      }
    }
  }

  function gameOver() {
    if (current.some((index) => blocks[currentPos + index].classList.contains('taken'))) {
      clearInterval(timerId);
      gameOverSound.play();
    }
  }
});


