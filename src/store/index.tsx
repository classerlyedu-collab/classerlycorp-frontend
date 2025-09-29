import { createStore, combineReducers } from "redux";
import image from "./reducers/image.reducer";
import board from "./reducers/board.reducer";
import game from "./reducers/game.reducer";

const store = createStore(
  combineReducers({
    image,
    board,
    game
  }),
);

export default store;
