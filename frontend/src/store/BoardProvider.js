import React, { useCallback, useReducer } from "react";

import boardContext from "./board-context";
import { BOARD_ACTIONS, TOOL_ACTION_TYPES, TOOL_ITEMS } from "../constants";
import {
  createRoughElement,
  getSvgPathFromStroke,
  isPointNearElement,
} from "../utils/element";
import getStroke from "perfect-freehand";

// useReducer ->
const boardReducer = (state, action) => {
  // ab yaha mei switch mei harr type ke liye uska particular action define kar lunga
  switch (action.type) {
    // load_canvas action will be used to load the initial canvas from the backend
    // it will take the elements from the payload and map through them to convert the brush points
    // to a Path2D object so that it can be drawn on the canvas
    // it will also convert the points of the brush to a Path2D object so that
    // it can be drawn on the canvas
    case BOARD_ACTIONS.LOAD_CANVAS: {
      return {
        ...state,
        elements: action.payload.elements.map((element) => {
          if (element.type === "BRUSH") {
            return {
              ...element,
              path: new Path2D(getSvgPathFromStroke(getStroke(element.points))),
            };
          }
          return element;
        }),
      };
    }
    // change_tool action pe sabkuch same rakha and return the new state with changing the activetoolitem
    case BOARD_ACTIONS.CHANGE_TOOL: {
      return {
        // return the new state with changed value
        ...state,
        activeToolItem: action.payload.tool, // new value se update kar de
      };
    }

    case BOARD_ACTIONS.CHANGE_ACTION_TYPE: {
      // it will simply change the action type

      return {
        ...state,
        toolActionType: action.payload.actionType,
      };
    }

    // to add new item object in the elment array with the coordinate of the clientX, clientY
    case BOARD_ACTIONS.DRAW_DOWN: {
      const { clientX, clientY, stroke, fill, size } = action.payload;

      //new coordinates se ek new item bana ke push in elements array ( made a particular function for it to make element base on tool_item type)
      const newElements = createRoughElement(
        state.elements.length,
        clientX,
        clientY,
        clientX,
        clientY,
        { type: state.activeToolItem, stroke, fill, size }
      );

      // yaha mai new elment ko previouse elments ke saath elements array mei daal dunga

      // if current tool is eraser then change the state to ERASING
      const prevElements = state.elements;
      return {
        ...state,
        toolActionType:
          state.activeToolItem === TOOL_ITEMS.TEXT
            ? TOOL_ACTION_TYPES.WRITING
            : TOOL_ACTION_TYPES.DRAWING, // so that now when the button is clicked i can keep track of onMouseMove
        elements: [...prevElements, newElements],
      };
    }
    // for mouse move
    case BOARD_ACTIONS.DRAW_MOVE: {
      const { clientX, clientY } = action.payload;

      const updatedElements = [...state.elements]; // get all the elements

      const index = updatedElements.length - 1; // get the last index

      // abb kyuki maine mouse down pe stroke and fill le liye that from toolbox context by passing through a handler , and i wanted that while i was moving my cursor so instead of passing it again i will keep those value while i am creating the element so that i can get those values from element only
      const { type } = updatedElements[index]; // isme type bhi lele to make different elements based on tool

      switch (type) {
        case TOOL_ITEMS.LINE:
        case TOOL_ITEMS.RECTANGLE:
        case TOOL_ITEMS.CIRCLE:
        case TOOL_ITEMS.ARROW:
          const { x1, y1, stroke, fill, size } = updatedElements[index]; // isme type bhi lele to make different elements based on tool
          // ye mere paas new Element bann ke aa gaya with the update co-ordinates in all the above 4 types of tools
          const newElements = createRoughElement(
            index,
            x1,
            y1,
            clientX,
            clientY,
            {
              type: state.activeToolItem,
              stroke,
              fill,
              size,
            }
          );

          updatedElements[index] = newElements;

          return {
            ...state,
            elements: updatedElements,
          };

        case TOOL_ITEMS.BRUSH:
          // brush ke case mei we will push all the points in the POINTS array of the element.
          // yaha points as well as path dono update kar de
          updatedElements[index].points = [
            ...updatedElements[index].points,
            { x: clientX, y: clientY },
          ];
          updatedElements[index].path = new Path2D(
            getSvgPathFromStroke(getStroke(updatedElements[index].points))
          );

          return {
            ...state,
            elements: updatedElements,
          };

        default:
          return state;
      }
    }

    case BOARD_ACTIONS.DRAW_UP: {
      // const elementsCopy = [...state.elements]; // ye ho gaye element ki copy
      const newHistory = state.history.slice(0, state.index + 1); // so that when i am coming back and drawing new stuff -> remove uske aage ke sare state

      // now push it into the history
      newHistory.push(state.elements);

      return {
        ...state,
        history: newHistory,
        index: state.index + 1,
      };
    }

    //eraser case handle
    case BOARD_ACTIONS.ERASE: {
      const { clientX, clientY } = action.payload;

      let newElements = [...state.elements];
      let isErased = false;
      newElements = newElements.filter((element) => {
        // define in element.js
        const isNear = !isPointNearElement(element, clientX, clientY); // agar wo hamare eraser ke point ke paas hai then we have to delete it
        isErased ||= !isNear;
        return isNear;
      });

      const newHistory = state.history.slice(0, state.index + 1);
      if (isErased) newHistory.push(newElements);
      const newIndex = isErased ? state.index + 1 : state.index;
      return {
        ...state,
        elements: newElements,
        history: newHistory,
        index: newIndex,
      };
    }

    case BOARD_ACTIONS.CHANGE_TEXT: {
      const index = state.elements.length - 1;
      const newElements = [...state.elements];
      newElements[index].text = action.payload.text;
      const newHistory = state.history.slice(0, state.index + 1);
      newHistory.push(newElements);

      return {
        ...state,
        toolActionType: TOOL_ACTION_TYPES.NONE,
        elements: newElements,
        history: newHistory, // history ko update kar de
        index: state.index + 1,
      };
    }

    case BOARD_ACTIONS.UNDO: {
      if (state.index <= 0) return state;
      return {
        ...state,
        elements: state.history[state.index - 1],
        index: state.index - 1,
      };
    }

    case BOARD_ACTIONS.REDO: {
      if (state.index >= state.history.length - 1) return state;
      return {
        ...state,
        elements: state.history[state.index + 1],
        index: state.index + 1,
      };
    }

    default:
      return state;
  }
};

const initialBoardState = {
  activeToolItem: TOOL_ITEMS.BRUSH,
  toolActionType: TOOL_ACTION_TYPES.NONE,
  elements: [],
  history: [[]],
  index: 0,
};
// children prop always chaiye hoga provider mei
const BoardProvider = ({ children }) => {
  // takes a reducer function and an initial state, returning the current state and a dispatch function.

  // initialcanvas is the initial state of the board, which will be passed from the CanvasPage component backend
  // it will be used to set the initial elements and history of the board
  const [boardState, dispatchBoardAction] = useReducer(
    boardReducer,
    initialBoardState
  );

  // console.log("Board State: ", initialBoardState);

  const loadCanvas = useCallback((updatedElements) => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.LOAD_CANVAS,
      payload: {
        elements: updatedElements,
      },
    });
  }, []);

  // now instead of making both these state i will handle them with useReducer
  // const [activeToolItem, setActiveToolItem] = useState(TOOL_ITEMS.LINE);
  // const [elements, setElements] = useState([]);
  const changeToolHandler = (tool) => {
    // setActiveToolItem(tool); // now instead of directly changing this we have to dipatch an action

    dispatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_TOOL,
      payload: { tool },
    });
  };

  // handler for jab mouse click hoga
  const boardMouseDownHandler = (event, toolboxState) => {
    if (boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) return;
    const { clientX, clientY } = event;
    // if out current item is eraser then we will dispatch different function
    if (boardState.activeToolItem === TOOL_ITEMS.ERASER) {
      dispatchBoardAction({
        type: BOARD_ACTIONS.CHANGE_ACTION_TYPE,
        payload: {
          actionType: TOOL_ACTION_TYPES.ERASING,
        },
      });
      return; // aur kuch mat kar ( now we have the eraser clicked )
    }

    //toolboxState -> so that we can get the stroke, fill property of the tool
    // isko dispatchaction se handle karke iss coordinate ka ek rough object bana ke usko elements array mei push kar de
    dispatchBoardAction({
      type: BOARD_ACTIONS.DRAW_DOWN,
      payload: {
        clientX,
        clientY,
        stroke: toolboxState[boardState.activeToolItem]?.stroke,
        fill: toolboxState[boardState.activeToolItem]?.fill,
        size: toolboxState[boardState.activeToolItem]?.size,
      },
    });
  };

  // handler for jab mouser cursor ko move kareenge fro real time position of cursor
  const boardMouseMoveHandler = (event) => {
    if (boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) return; // agar writing state mei hai toh move se koi fark nahi padega

    const { clientX, clientY } = event;

    if (boardState.toolActionType === TOOL_ACTION_TYPES.DRAWING) {
      // isko dispatchaction se handle karke iss coordinate ka ek rough object bana ke usko elements array mei push kar de
      dispatchBoardAction({
        type: BOARD_ACTIONS.DRAW_MOVE,
        payload: {
          clientX,
          clientY,
        },
      });
    } else if (boardState.toolActionType === TOOL_ACTION_TYPES.ERASING) {
      // for erase we will dispatch different action and handle it in reducer
      dispatchBoardAction({
        type: BOARD_ACTIONS.ERASE,
        payload: {
          clientX,
          clientY,
        },
      });
    }
  };

  // the moment i leave the mouse cursor it should stop updating
  const boardMouseUpHandler = () => {
    if (boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) return;
    if (boardState.toolActionType === TOOL_ACTION_TYPES.DRAWING) {
      dispatchBoardAction({
        type: BOARD_ACTIONS.DRAW_UP,
      });
    }
    dispatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_ACTION_TYPE,
      payload: {
        actionType: TOOL_ACTION_TYPES.NONE,
      },
    });
  };

  const textAreaBlurHandler = (text) => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_TEXT,
      payload: {
        text,
      },
    });
  };

  const boardUndoHandler = useCallback(() => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.UNDO,
    });
  }, []);

  const boardRedoHandler = useCallback(() => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.REDO,
    });
  }, []);

  const boardContextValue = {
    activeToolItem: boardState.activeToolItem,
    elements: boardState.elements,
    toolActionType: boardState.toolActionType,
    changeToolHandler,
    boardMouseDownHandler,
    boardMouseMoveHandler,
    boardMouseUpHandler,
    textAreaBlurHandler,
    boardUndoHandler,
    boardRedoHandler,
    loadCanvas,
  };

  return (
    <boardContext.Provider
      value={boardContextValue} // now boardContextValue ke dono variable, methods ko har jagah use kar sakta hu
    >
      {children}
    </boardContext.Provider>
  );
};

export default BoardProvider;
