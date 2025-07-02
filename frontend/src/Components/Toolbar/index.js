import React, { useContext } from "react";

import classes from "./index.module.css";

import cx from "classnames"; // to conditionally give class names

import {
  FaArrowRight,
  FaPaintBrush,
  FaSlash,
  FaRegCircle,
  FaEraser,
  FaFont,
  FaRedoAlt,
  FaUndoAlt,
  FaDownload,
} from "react-icons/fa";
import { LuRectangleHorizontal } from "react-icons/lu";
import boardContext from "../../store/board-context";
import { TOOL_ITEMS } from "../../constants";

function Toolbar() {
  const {
    activeToolItem,
    changeToolHandler,
    boardUndoHandler,
    boardRedoHandler,
  } = useContext(boardContext); // now ye dono boardContext mei define hone chaiye and in function ka implementaion BoardProvider.js mei hone chaiye and pass them in value field then jaha bhi mujhe use karna hai wrap it's component (e.g toolbar ) in BoardProvider and use these function inside that component

  const handleDownloadClick = () => {
    //exact yahi tarika hai download karne ka
    const canvas = document.getElementsByTagName("canvas")[0];
    if (!canvas) {
      console.error("Canvas element not found.");
      return;
    }
    const data = canvas.toDataURL("image/jpeg"); //get the data
    const anchor = document.createElement("a"); // make an anchor tag
    anchor.href = data; // give data as href
    anchor.download = "board.jpeg";
    anchor.click();
  };

  return (
    <div className={classes.container}>
      <div
        className={cx(classes.toolItem, {
          [classes.active]: activeToolItem === TOOL_ITEMS.BRUSH,
        })}
        onClick={() => changeToolHandler(TOOL_ITEMS.BRUSH)}
      >
        <FaPaintBrush />
      </div>
      <div
        className={cx(classes.toolItem, {
          [classes.active]: activeToolItem === TOOL_ITEMS.LINE, // here if activeToolitem is A then only add active class
        })}
        onClick={() => changeToolHandler(TOOL_ITEMS.LINE)}
      >
        <FaSlash />
      </div>
      <div
        className={cx(classes.toolItem, {
          [classes.active]: activeToolItem === TOOL_ITEMS.RECTANGLE,
        })}
        onClick={() => changeToolHandler(TOOL_ITEMS.RECTANGLE)}
      >
        <LuRectangleHorizontal />
      </div>
      <div
        className={cx(classes.toolItem, {
          [classes.active]: activeToolItem === TOOL_ITEMS.CIRCLE,
        })}
        onClick={() => changeToolHandler(TOOL_ITEMS.CIRCLE)}
      >
        <FaRegCircle />
      </div>
      <div
        className={cx(classes.toolItem, {
          [classes.active]: activeToolItem === TOOL_ITEMS.ARROW,
        })}
        onClick={() => changeToolHandler(TOOL_ITEMS.ARROW)}
      >
        <FaArrowRight />
      </div>
      <div
        className={cx(classes.toolItem, {
          [classes.active]: activeToolItem === TOOL_ITEMS.ERASER,
        })}
        onClick={() => changeToolHandler(TOOL_ITEMS.ERASER)}
      >
        <FaEraser />
      </div>
      <div
        className={cx(classes.toolItem, {
          [classes.active]: activeToolItem === TOOL_ITEMS.TEXT,
        })}
        onClick={() => changeToolHandler(TOOL_ITEMS.TEXT)}
      >
        <FaFont />
      </div>
      <div className={classes.toolItem} onClick={boardUndoHandler}>
        <FaUndoAlt />
      </div>
      <div className={classes.toolItem} onClick={boardRedoHandler}>
        <FaRedoAlt />
      </div>
      <div className={classes.toolItem} onClick={handleDownloadClick}>
        <FaDownload />
      </div>
    </div>
  );
}

export default Toolbar;
