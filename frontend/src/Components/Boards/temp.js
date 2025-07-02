import { useContext, useEffect, useLayoutEffect, useRef } from "react";
import rough from "roughjs";
import boardContext from "../../store/board-context";
import { TOOL_ACTION_TYPES, TOOL_ITEMS } from "../../constants";
import toolboxContext from "../../store/toolbox-context";
import updateCanvas from "../../utils/api";
import classes from "./index.module.css";

function Board() {
  const canvasRef = useRef();
  const textAreaRef = useRef();

  // and now i will take elements array from context
  const {
    elements,
    boardMouseDownHandler,
    boardMouseMoveHandler,
    boardMouseUpHandler,
    toolActionType,
    textAreaBlurHandler,
  } = useContext(boardContext);

  //we are sending the toolbox state from here so that i can get the fill and stroke to cretate the roughEle

  const { toolboxState } = useContext(toolboxContext);

  // this use effect will simply set the height and width of the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  // METHOD TO DRAW ON CANVAS
  // sare elements ko draw karne ke liye we will make another useEffect
  // every time elements array chnage we will clean the board first and then rerender and draw each item in elements again
  // useLayouutEffect is same as useEffect -> bass dom interaaction mei useLayoutEffect is better
  useLayoutEffect(() => {
    const canvas = canvasRef.current;

    // so that we can clear it in useEffect before rerendring the new items in elements array
    const context = canvas.getContext("2d");
    context.save();

    const roughCanvas = rough.canvas(canvas);

    // and now jab elements change honge i will draw the items of element array based on the roughtEle ( basically i have given the co-ordinates in roughEle)

    elements.forEach((element) => {
      //now here for brush we won't draw with rough.js

      switch (element.type) {
        case TOOL_ITEMS.LINE:
        case TOOL_ITEMS.RECTANGLE:
        case TOOL_ITEMS.CIRCLE:
        case TOOL_ITEMS.ARROW:
          roughCanvas.draw(element.roughEle);
          break;

        case TOOL_ITEMS.BRUSH:
          context.fillStyle = element.stroke;
          context.fill(element.path);
          context.restore();
          break;

        case TOOL_ITEMS.TEXT: // do this if the current tool is a text
          // if we want the textare content to save on canvas
          context.textBaseline = "top";
          context.font = `${element.size}px Caveat`;
          context.fillStyle = element.stroke;
          context.fillText(element.text, element.x1, element.y1);
          context.restore();
          break;
        default:
          throw new Error("Type Not Recognised");
      }
    });

    return () => {
      // jab bhi elements change ho, clear kar de pure canvas ko and then rerender them again
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [elements]);

  useEffect(() => {
    const textArea = textAreaRef.current;

    if (toolActionType === TOOL_ACTION_TYPES.WRITING) {
      setTimeout(() => {
        textArea.focus(); // agar tool writing mei change hua hai then uss tool ko focus kar do
      }, 0);
    }
  }, [toolActionType]);

  // jaise hi mouse click hoga
  const handleMouseDown = (event) => {
    boardMouseDownHandler(event, toolboxState); // isme se bascially i will get the co-ordinates ( clientX, clientY)
    // and we are also sending the toolBoxState to get the stroke and fill state of a tool
  };

  // continuously fires as the mouse cursor moves, providing real-time updates on the cursor’s position.
  const handleMouseMove = (event) => {
    boardMouseMoveHandler(event); // isme se bascially i will get the co-ordinates ( clientX, clientY)
    // agar abhi tak button click hi nahi hua hai then don't keep track of the cursor movement
  };

  // when we relaese the mouse cursor
  const handleMouseUp = () => {
    boardMouseUpHandler();
    const canvasId = window.location.pathname.split("/").pop(); // get the canvas id
    updateCanvas(canvasId, elements);
  };

  return (
    <>
      {toolActionType === TOOL_ACTION_TYPES.WRITING && (
        <textarea
          type="text"
          ref={textAreaRef}
          className={classes.textElementBox}
          style={{
            top: elements[elements.length - 1].y1,
            left: elements[elements.length - 1].x1,
            fontSize: `${elements[elements.length - 1]?.size}px`,
            color: elements[elements.length - 1]?.stroke,
          }} // ye based on maine kaha click kiya tha
          onBlur={(event) => textAreaBlurHandler(event.target.value)}
        />
      )}
      <canvas
        ref={canvasRef}
        id="canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </>
  );
}

export default Board;
