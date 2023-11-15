import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Provider } from "react-redux";
import store from "./Services/store";
import Home from "./pages/home";
import GameBoard from "./pages/board";

function App() {
  return (
    <>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/" Component={Home} />
            <Route path="/game" Component={GameBoard} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </>
  );
}

export default App;
