import React, { useEffect, useState } from "react";
import "../styles/css/game.css";
import useGameState, { GameStateType } from "../hooks/game";
import * as io from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, Form } from "react-bootstrap";
import { updateGameState } from "../Services/gameSlice";
import { CircularProgressbar } from "react-circular-progressbar";
import { DECISION_TIMEOUT, SERVER_URL } from "../constants";
import GameComponent from "../game";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SpinnerDotted } from 'spinners-react';
import CopyToClipboard from "react-copy-to-clipboard";

// Connect to socketio server
const socket = io.connect(`${SERVER_URL}`);

const GameBoard = () => {
  const {
    formModal,
    waitingForOtherPlayerModal,
    updateWaitingModal,
    updateFormModal,
  } = useGameState();

  const gameState = useSelector((state: { game: GameStateType }) => state.game);
  const dispatch = useDispatch();
  const urlParams = new URLSearchParams(window.location.search);
  const gameIdParam = urlParams.get("gameId");
  const player2NameParam = urlParams.get("player2Name");
  const [gameId, setGameId] = useState(gameIdParam);
  const [timerSelf, setTimerSelf] = useState(DECISION_TIMEOUT);
  const [timerOther, setTimerOther] = useState(DECISION_TIMEOUT);
  const [btnLoading, setBtnLoading] = useState(false);
  function redirectToHomePage() {
    window.location.href = "/";
  }

  // To deal with form modal changes
  useEffect(() => {
    if (!gameId) {
      updateFormModal({
        ...formModal,
        show: true,
      });
    }
  }, []);

  useEffect(() => {
    if (timerSelf === 0) {
      socket.emit(
        "timer-ended",
        JSON.stringify({ gameId: gameId, socketId: socket.id })
      );
      toast.info("You Lose You did not move on time !")
      redirectToHomePage();

    }
    return () => { };
  }, [timerSelf]);

  // Timout useEffect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameState.isGameStarted && gameState.playerTurn) {
      interval = setInterval(() => {
        setTimerSelf((prevTimerSelf) => {
          return prevTimerSelf - 1;
        });
      }, 1000);
    } else if (gameState.isGameStarted && !gameState.playerTurn) {
      interval = setInterval(() => {
        setTimerOther((prevTimerOther) => {
          return prevTimerOther - 1;
        });
      }, 1000);
    } else {
      // Reset timers if the game is not started or it's not player's turn
      setTimerSelf(DECISION_TIMEOUT);
      setTimerOther(DECISION_TIMEOUT);
    }

    // Cleanup function
    return () => {
      clearInterval(interval);
      setTimerSelf(DECISION_TIMEOUT);
      setTimerOther(DECISION_TIMEOUT);
    };
  }, [gameState.isGameStarted, gameState.playerTurn]);

  // Movement of rook socket
  useEffect(() => {
    if (gameState.isGameStarted) {
      console.log("rook-moved");
      socket.emit(
        "rook-moved",
        JSON.stringify({
          gameId,
          rookRow: gameState.rookRow,
          rookCol: gameState.rookCol,
          socketId: socket.id,
        })
      );
    }
  }, [gameState.playerTurn]);

  // Socket useEffect
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server with socketid : ", socket.id);
      // For the 2nd player
      if (gameId && player2NameParam) {
        dispatch(
          updateGameState({
            player2: {
              playerName: player2NameParam,
              socketId: socket.id,
            },
          })
        );
        console.log("emittingSocketWvent");
        socket.emit(
          "join-game",
          JSON.stringify({
            gameId,
            player2Name: player2NameParam,
            socketId: socket.id,
          })
        );
      }
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      if (gameState.isGameStarted) {
        toast.error("Game Over, Disconnected from server");
        redirectToHomePage();

      } else {
        toast.error(

          "Disconnected from server",

        );
        redirectToHomePage();
      }
    });

    socket.on("start-game", (data: any) => {
      console.log("start-game");
      console.log(data);
      updateWaitingModal(false);
      updateFormModal({
        ...formModal,
        show: false,
      });
      let players: { _id: string; playerName: string; socketId: string }[] =
        data.players;
      // Set data for player 1
      if (player2NameParam) {
        players.map((item) => {
          if (item.playerName !== player2NameParam) {
            dispatch(
              updateGameState({
                player1: {
                  playerName: item.playerName,
                  socketId: item.socketId,
                },
              })
            );
          }
        });
      } else {
        // Set data for player 2
        players.map((item) => {
          if (item.playerName !== formModal.inputText) {
            dispatch(
              updateGameState({
                player2: {
                  playerName: item.playerName,
                  socketId: item.socketId,
                },
              })
            );
          }
        });
      }
      // If the player is the one who has created the game is here
      // He will get to make the first move
      if (gameIdParam && player2NameParam) {
        dispatch(
          updateGameState({
            playerTurn: false,
          })
        );
      } else {
        dispatch(
          updateGameState({
            playerTurn: true,
          })
        );
      }
      dispatch(
        updateGameState({
          isGameStarted: true,
        })
      );
    });

    socket.on("game-ended", (data: any) => {
      console.log("game-ended");
      console.log(data);
      toast.error(

        `Game Ended, Winner : ${data?.gameState?.winner ?? ""}\nResults : ${data?.gameState?.reason ?? ""
        }`,

      );
      redirectToHomePage();
    });

    socket.on("game-not-found", () => {
      console.log("game-not-found");
      toast.error("Game not found, Please check the game id");
      redirectToHomePage();

    });

    socket.on("already-busy", () => {
      console.log("already-busy");
      toast.error(
        "Game is Busy, Already two players have joined, join/create another game instead",
      );
      redirectToHomePage();
    });

    socket.on("update-rook-position", (data: any) => {
      console.log("update-rook-position");
      console.log({
        data,
        rookRow: gameState.rookRow,
        rookCol: gameState.rookCol,
      });
      if (
        data.rookRow !== gameState.rookRow ||
        data.rookCol !== gameState.rookCol
      ) {
        dispatch(
          updateGameState({
            rookRow: data.rookRow,
            rookCol: data.rookCol,
            playerTurn: true,
          })
        );
      }
    });

    socket.on("you-win", (data: any) => {
      console.log("you-win");
      console.log(data);
      dispatch(
        updateGameState({
          isGameOver: true,
          winner: data.gameState.winner,
          reason: data.gameState.reason,
        })
      );
      toast.info("You Win, Your opponent did not move on time");
      redirectToHomePage();

    });

    socket.on("you-lose", (data: any) => {
      console.log("you-lose");
      console.log(JSON.stringify(data, null, 4));
      dispatch(
        updateGameState({
          isGameOver: true,
          winner: data.gameState.winner,
          reason: data.gameState.reason,
        })
      );
      toast.info("You Lose, You did not move on time !");
      redirectToHomePage();

    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("start-game");
      socket.off("game-ended");
      socket.off("game-not-found");
      socket.off("already-busy");
      socket.off("update-rook-position");
      socket.off("you-lose");
      socket.off("you-win");
      console.log("Socket disconnected useEffect");
    };
  }, [gameState.rookCol, gameState.rookRow, gameState.playerTurn]);

  const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = formModal.inputText;
    if (name.length === 0) {
      toast.warn(
        "Empty name, Please enter a name before proceeding");
      return;
    }
    if (name.length >= 50) {
      toast.warn(
        "Name cannot be more than 50 characters",
      );
      return;
    }
    setBtnLoading(true);
    // fetch request to create a new game
    fetch(`${SERVER_URL}/api/games/createNewGame`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ playerName: name, socketId: socket.id }),
    })
      .then((response) => response.json())
      .then((data) => {
        setBtnLoading(false);
        setGameId(data.game._id);
        dispatch(
          updateGameState({
            player1: {
              playerName: name,
              socketId: socket.id,
            },
          })
        );
        toast.success(
          "Game created successfully, Please wait for the other player to join...");
        updateFormModal({
          ...formModal,
          show: false,
        });
        updateWaitingModal(true);

      })
      .catch((error) => {
        setBtnLoading(false);
        toast.error(
          "Server Error, Please refresh the page or try again later",
        );
        redirectToHomePage();
        console.log(error);
      });
  };

  return (
    <>

      <div className="game">
        <ToastContainer
          position="top-center"
          autoClose={2000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        {waitingForOtherPlayerModal.show && (
          <Card id="waiting">
            <Card.Body>
              <div className="text-center">
                <h4>Waiting for other player to join...</h4>
              </div>
              <div>
                <SpinnerDotted className="mx-auto my-4 d-block" />
              </div>
              <div className="d-flex flex-column align-items-center justify-content-center">
                <p className="text-center">Game Id : {gameId}</p>

                <CopyToClipboard
                  text={`${gameId}`}
                  onCopy={() => toast.success("Game Id Copied to Clipboard")}
                >
                  <Button >
                    Copy
                  </Button>
                </CopyToClipboard>
              </div>
            </Card.Body>
          </Card>
        )}
        {formModal.show && (
          <Card id="create-game">
            <Card.Body className="p-4">
              <Form onSubmit={(e) => submitForm(e)}>
              <Form.Label className="fw-medium">Name</Form.Label>
                <Form.Control
                  placeholder="Enter your name"
                  autoFocus
                  onChange={(e: any) => {
                    updateFormModal({
                      ...formModal,
                      inputText: e.target.value,
                    });
                  }}
                />
                <div>
                  <div className="d-flex align-items-center justify-content-center">
                    {btnLoading ?
                      <div className="mt-4 d-flex flex-column align-items-center justify-content-center">
                        <SpinnerDotted />
                        <p className="mt-4">
                          Connecting to server
                        </p>
                      </div>
                      :
                      <Button
                        type="submit"
                        variant="success"
                        className="btn-lg mt-5 "
                        disabled={btnLoading}
                      >
                        Create
                      </Button>
                    }
                  </div>
                </div>
              </Form>
            </Card.Body>
          </Card>
        )}
        {gameState.isGameStarted && (
          <div className="game-area">
            <div className="playerSection player-top">
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgressbar
                  styles={{
                    root: {
                      height: "78px",
                      width: "78px",
                      position: "absolute",
                      top: "20px",
                      zIndex: "1",
                    },
                    path: {
                      stroke: "#3DD771",
                    },
                    trail: {
                      stroke: "#2B2B2B",
                    },
                  }}
                  value={timerOther / DECISION_TIMEOUT}
                  maxValue={1}
                  counterClockwise
                />
              </div>
              <img
                className="profileIcon"
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${gameIdParam
                  ? gameState.player1.playerName
                  : gameState.player2.playerName
                  }`}
                alt=""
              />
              <div className="text top">
                {`${gameIdParam
                  ? gameState.player1.playerName
                  : gameState.player2.playerName
                  }`}{" "}
              </div>
              <div className="turn">
                {gameState.playerTurn ? "" : "Opponents Turn"}
              </div>
            </div>

            <GameComponent />

            <div className="playerSection player-bottom">
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgressbar
                  styles={{
                    root: {
                      height: "78px",
                      width: "78px",
                      position: "absolute",
                      top: "20px",
                      zIndex: "1",
                    },
                    path: {
                      stroke: "#3DD771",
                    },
                    trail: {
                      stroke: "#2B2B2B",
                    },
                  }}
                  value={timerSelf / DECISION_TIMEOUT}
                  maxValue={1}
                  counterClockwise
                />
              </div>
              <img
                className="profileIcon z-100"
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${gameIdParam
                  ? gameState.player2.playerName
                  : gameState.player1.playerName
                  }`}
                alt=""
              />
              <div className="text bottom">
                {`${gameIdParam
                  ? gameState.player2.playerName
                  : gameState.player1.playerName
                  } (You)`}{" "}
              </div>
              <div className="turn  ">
                {gameState.playerTurn ? "Your Turn" : ""}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GameBoard;
