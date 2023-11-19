import "phaser";
import store from "../Services/store";
import { updateGameState } from "../Services/gameSlice";
import {  toast } from 'react-toastify';

export class Game extends Phaser.Scene {
  // @ts-ignore
  private vortex: Phaser.GameObjects.Image;
  // @ts-ignore
  private rook: Phaser.GameObjects.Image;
  private squareSize: number = 60;
  private boardSize: number = 8;
  private isRookMoving: boolean = false;
  private rookCol: number = 7;
  private rookRow: number = 0;
  private squares: Array<Array<Phaser.GameObjects.Graphics>> = [];
  private highlightedPaths: Array<Phaser.GameObjects.Image> = [];


  preload() {
    this.load.image("vortex", "./assets/images/vortex.png");
    this.load.image("rook", "./assets/images/rook.png");
    this.load.image("highlight", "./assets/images/highlight.png");
  }

  create() {
    for (let row = 0; row < this.boardSize; row++) {
      this.squares[row] = [];
      for (let col = 0; col < this.boardSize; col++) {
        const x = col * this.squareSize;
        const y = row * this.squareSize;
        const color = (row + col) % 2 === 0 ? 0x262626 : 0x000000;

        const square = this.add.graphics();
        square.fillStyle(color, 1);
        square.fillRect(x, y, this.squareSize, this.squareSize);
        square.setInteractive(
          new Phaser.Geom.Rectangle(x, y, this.squareSize, this.squareSize),
          Phaser.Geom.Rectangle.Contains
        );

        square.on("pointerdown", (pointer: any) => {
          const clickedRow = Math.floor(pointer.y / this.squareSize);
          const clickedCol = Math.floor(pointer.x / this.squareSize);
          if (this.isRookMoving === false) {
            this.handleClick({ rowNo: clickedRow, colNo: clickedCol });
          }
        });
        this.squares[row][col] = square;
      }
    }
    this.rook = this.add.image(
      this.rookCol * 60 + 30,
      this.rookRow * 0 + 28,
      "rook"
    );
    this.vortex = this.add.image(30, 455, "vortex");
    this.highlightValidPaths();
    store.subscribe(this.stateUpdate);
  }
  private highlightValidPaths() {
    this.clearHighlights();
    // Highlight the valid paths to the left of the rook
    for (let col = this.rookCol - 1; col >= 0; col--) {
      const x = col * this.squareSize;
      const y = this.rookRow * this.squareSize;
      const highlight = this.add.image(
        x + this.squareSize / 2,
        y + this.squareSize / 2,
        "highlight"
      );
      highlight.setOrigin(0.5);
      this.highlightedPaths.push(highlight);
    }

    // Highlight the valid paths below the rook
    for (let row = this.rookRow + 1; row < this.boardSize; row++) {
      const x = this.rookCol * this.squareSize;
      const y = row * this.squareSize;
      const highlight = this.add.image(
        x + this.squareSize / 2,
        y + this.squareSize / 2,
        "highlight"
      );
      highlight.setOrigin(0.5);
      this.highlightedPaths.push(highlight);
    }
  }

  private clearHighlights() {
    this.highlightedPaths.forEach((highlight) => {
      highlight.destroy();
    });
    this.highlightedPaths = [];
  }
  private stateUpdate = () => {
    const currState = store.getState().game;
    if (
      currState.rookRow !== this.rookRow ||
      currState.rookCol !== this.rookCol
    ) {
      const rowNo = currState.rookRow;
      const colNo = currState.rookCol;
      const x = colNo * this.squareSize + 28;
      const y = rowNo * this.squareSize + 30;
      this.tweens.add({
        targets: this.rook,
        x: x,
        y: y,
        duration: 400,
        ease: "Linear",
        onStart: () => {
          this.isRookMoving = true;
        },
        onComplete: () => {
          this.isRookMoving = false;
          this.rookRow = rowNo;
          this.rookCol = colNo;
          this.highlightValidPaths();
          // If rook hits the vortex then winner is declared whichever user did it
          if (rowNo === 7 && colNo === 0) {
            if (currState.playerTurn) {
           toast.warn("You Lose !, The other player made the rook reach vortex before you");
               setInterval(() => {
             window.location.href = "/";
                }
                , 3000);
              }
            return;
          }
        },
      });
    }
  };
  private handleClick(params: { rowNo: number; colNo: number }) {
    const { rowNo, colNo } = params;
    const x = colNo * this.squareSize + 28;
    const y = rowNo * this.squareSize + 30;
    let currState = store.getState().game;

    console.log("handleClick called");

    // If it is not player's turn then don't do anything
    if (currState.playerTurn === false) {
      console.log("Not users turn");
      return;
    }
    // If rook clicks on itself
    if (rowNo === this.rookRow && colNo === this.rookCol) {
      return;
    }
    // Rook cannot go backwards
    if (rowNo < this.rookRow || colNo > this.rookCol) {
      return;
    }

    // Rook cannot move diagnolly
    if (rowNo !== this.rookRow && colNo !== this.rookCol) {
      return;
    }

    store.dispatch(
      updateGameState({
        rookRow: rowNo,
        rookCol: colNo,
        playerTurn: false,
      })
    );

    this.tweens.add({
      targets: this.rook,
      x: x,
      y: y,
      duration: 400,
      ease: "Linear",
      onStart: () => {
        this.isRookMoving = true;
      },
      onComplete: () => {
        this.isRookMoving = false;
        this.rookRow = rowNo;
        this.rookCol = colNo;
        this.highlightValidPaths();
        // If rook hits the vortex then winner is declared whichever user did it
        if (rowNo === 7 && colNo === 0) {
          toast.success("You Win !, You made the rook reach vortex before other player",
          );
          setInterval(() => {
            window.location.href = "/";
               }
               , 3000);
             
          return;
        }
      },
    });
  }
}
