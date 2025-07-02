import { createContext } from "react";

// yaha mujhe toolbar ke items chaiye
const boardContext = createContext({
  initialCanvas: {},
  activeToolItem: "",
  toolActionType: "",
  elements: [],
  history: [[]],
  index: 0,
  changeToolHandler: () => {},
  boardMouseDownHandler: () => {},
  boardMouseMoveHandler: () => {},
  boardMouseUpHandler: () => {},
});

export default boardContext;
