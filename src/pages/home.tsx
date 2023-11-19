import React from "react";
import { Button, Form, Modal, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../styles/css/home.css";
import { SERVER_URL } from "../constants";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SpinnerInfinity } from "spinners-react";

const Home = () => {
  const [show, setShow] = React.useState(false);
  const [gameCode, setGameCode] = React.useState("");
  const [name, setName] = React.useState("");
  const [isBtnLoading, setIsBtnLoading] = React.useState(false);
  const navigate = useNavigate();
  const checkGameAndJoin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (gameCode === "") {
      toast.error("Game code cannot be empty");
      return;
    }
    if (name === "") {
      toast.error("Name cannot be empty");
      return;
    }
    if (name.length >= 50) {
      toast.error("Name cannot be more than 50 characters",);
      return;
    }
    setIsBtnLoading(true);
    fetch(`${SERVER_URL}/api/games/gameExists`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gameId: gameCode }),
    })
      .then((response) => response.json())
      .then((data) => {
        setIsBtnLoading(false);
        if (data.error) {
          toast.error(`${data?.error}`);
          return;
        }
        toast.error(`${data?.message}` + "Click Ok to join the game")
        window.location.href = `/game?gameId=${gameCode}&player2Name=${name}`;

      })
      .catch((error: any) => {
        setIsBtnLoading(false);
        toast.error(`${error?.error}`);
        console.error({ error });
      });
  };
  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <Modal   centered show={show} onHide={() => setShow(false)}>
        <Card id="modalCard" >
          <Form onSubmit={(e) => checkGameAndJoin(e)}>
            <Modal.Body >
            <Form.Label className="fw-medium ">Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Name"
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Form.Label className="fw-medium mt-3">Game Code</Form.Label>
              <Form.Control
                type="text"
                autoFocus
                placeholder="Enter Game Code"
                onChange={(e) => setGameCode(e.target.value)}
                required
              />
             
            </Modal.Body>
           <div className="d-flex m-2  align-items-center justify-content-center">
              
           <Button className="m-2" variant="success" type="submit" disabled={isBtnLoading}>
                {isBtnLoading ? <SpinnerInfinity /> : "Join Game"}
              </Button>
              <Button className="m-2" variant="secondary" onClick={() => setShow(false)}>
                Close
              </Button>
             
           </div>
          </Form>
        </Card>

      </Modal>

      <div className="home">
        <div className="row content-area">
          <div className="col-12 d-flex flex-column align-items-center justify-content-center mt-5">

            {/* Responsive Image */}
            <img
              src="assets/banner.svg" // Replace with the path to your image
              alt="Game Image"
              className=" mb-4"
              style={{ maxWidth: "100%", height: '40vh' }}
            />

            {/* Responsive Buttons */}
            <div className="d-flex flex-column flex-sm-row">
              <Button

              className="mb-2 me-sm-4 mb-sm-0"
                onClick={() => setShow(true)}
                variant="success"
              >
                Join a game
              </Button>
              <Button
             
                onClick={() => navigate("/game")}
                variant="success"
              >
                Create new game
              </Button>
            </div>

          </div>
        </div>
      </div>


    </>
  );
};

export default Home;
