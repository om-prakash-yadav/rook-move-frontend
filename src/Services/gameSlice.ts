// gameSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GameStateType } from "../hooks/game";

type optionsGamesType = {
  gameId?: string;
  rookRow?: number;
  rookCol?: number;
  timeLeft?: number;
  player1?: {
    socketId: string;
    playerName: string;
  };
  player2?: {
    socketId: string;
    playerName: string;
  };
  playerTurn?: boolean;
  isGameStarted?: boolean;
  isGameOver?: boolean;
  winner?: string;
  reason?: string;
};

const initialState: GameStateType = {
  gameId: undefined,
  rookCol: 7,
  rookRow: 0,
  timeLeft: 0,
  playerTurn: false,
  player1: {
    socketId: "",
    playerName: "",
  },
  player2: {
    socketId: "",
    playerName: "",
  },
  isGameStarted: false,
  isGameOver: false,
  winner: undefined,
  reason: undefined,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    updateGameState: (state, action: PayloadAction<optionsGamesType>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { updateGameState } = gameSlice.actions;
export default gameSlice.reducer;
