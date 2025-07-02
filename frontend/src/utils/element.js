// this will return the rough element based on the tool item type

import { ARROW_LENGTH, TOOL_ITEMS } from "../constants";
import { getArrowHeadsCoordinates, isPointCloseToLine } from "./math";
import getStroke from "perfect-freehand"; // to make the stroke to pass in canvas of html to draw the brush
import rough from "roughjs/bin/rough"; // to import gen
//import rough generator so that yahi se direct rough ka element create kar de based on the parameter it take ( different parameter for each type of tool (line , rectangle ))
const gen = rough.generator();

export const createRoughElement = (
  id,
  x1,
  y1,
  x2,
  y2,
  { type, stroke, fill, size }
) => {
  const element = {
    id,
    x1,
    y1,
    x2,
    y2,
    type,
    stroke,
    fill,
    size,
  };

  // here we can give options jo ham generator ko denge in order to implement the tool with stoke, fill, color
  let options = {
    seed: id + 1, // here id can never be zero
    fillStyle: "solid", // so that solid color aaye those rough default fill nahi with the transparent linings
  };

  // agar stroke null nahi aaya hai
  if (stroke) {
    options.stroke = stroke;
  }

  if (fill) {
    options.fill = fill;
  }

  if (size) {
    options.strokeWidth = size;
  }

  switch (type) {
    case TOOL_ITEMS.BRUSH: {
      const brushElement = {
        id,
        points: [{ x: x1, y: y1 }],
        path: new Path2D(getSvgPathFromStroke(getStroke([{ x: x1, y: y1 }]))),
        type,
        stroke,
      };
      return brushElement;
    }

    case TOOL_ITEMS.LINE: {
      element.roughEle = gen.line(x1, y1, x2, y2, options);
      return element;
    }

    case TOOL_ITEMS.RECTANGLE: {
      element.roughEle = gen.rectangle(x1, y1, x2 - x1, y2 - y1, options); // kyuki isme width, height dena hai
      return element;
    }

    //case for circle
    case TOOL_ITEMS.CIRCLE: {
      const center_x = (x1 + x2) / 2,
        center_y = (y1 + y2) / 2;
      const width = x2 - x1,
        height = y2 - y1;
      element.roughEle = gen.ellipse(
        center_x,
        center_y,
        width,
        height,
        options
      ); // kyuki isme width, height dena hai
      return element;
    }

    // case for arrow
    case TOOL_ITEMS.ARROW: {
      const { x3, y3, x4, y4 } = getArrowHeadsCoordinates(
        x1,
        y1,
        x2,
        y2,
        ARROW_LENGTH
      );

      // TO generate the arrows we have to assign an array of co-ordinates of how we will move
      //So to make points pehle ham (x1, y1 ) se (x2, y2 ) tak then (x2, y2) se (x3, y3) tak and then back to (x2, y2) and then from there (x4, y4)
      const points = [
        [x1, y1],
        [x2, y2],
        [x3, y3],
        [x2, y2],
        [x4, y4],
      ];
      element.roughEle = gen.linearPath(points, options);
      return element;
    }

    case TOOL_ITEMS.TEXT: {
      element.text = ""; // kyuki starting mei toh empty rahega
      return element; // aur ye jo element ham create kar rahe hai that we will return
    }

    default:
      throw new Error("Tool type not Recognised");
  }
};

export const isPointNearElement = (element, pointX, pointY) => {
  const { x1, y1, x2, y2, type } = element;
  const context = document.getElementsByTagName("canvas")[0].getContext("2d");

  switch (type) {
    case TOOL_ITEMS.LINE:
    case TOOL_ITEMS.ARROW: {
      return isPointCloseToLine(x1, y1, x2, y2, pointX, pointY);
    }

    case TOOL_ITEMS.RECTANGLE:
    case TOOL_ITEMS.CIRCLE: {
      return (
        isPointCloseToLine(x1, y1, x2, y1, pointX, pointY) ||
        isPointCloseToLine(x2, y1, x2, y2, pointX, pointY) ||
        isPointCloseToLine(x1, y2, x2, y2, pointX, pointY) ||
        isPointCloseToLine(x1, y1, x1, y2, pointX, pointY)
      );
    }

    case TOOL_ITEMS.BRUSH: {
      // yaha mujhe canvas ka context chaiye hoga to use a predefine function isPointPath(path, x, y) -> return true if (x, y) is in the path
      // context i can get by id of canvas and make the context here only
      return context.isPointInPath(element.path, pointX, pointY);
    }

    case TOOL_ITEMS.TEXT: {
      context.save();
      context.font = `${element.size}px Caveat`;
      context.fillStyle = element.stroke;
      const textWidth = context.measureText(element.text).width;
      const textHeight = parseInt(element.size);
      context.restore(); //is used to restore the drawing context to a previously saved state.
      const x2 = x1 + textWidth,
        y2 = y1 + textHeight;

      //delete the text if the erase goes on any of this point
      return (
        isPointCloseToLine(x1, y1, x2, y1, pointX, pointY) ||
        isPointCloseToLine(x2, y1, x2, y2, pointX, pointY) ||
        isPointCloseToLine(x2, y2, x1, y2, pointX, pointY) ||
        isPointCloseToLine(x1, y2, x1, y1, pointX, pointY)
      );
    }
    default:
      throw new Error("Tool Not Recognised");
  }
};

// get from perfect-freehand documentation to draw on given path
// we will also need this in BoardProvider to update the path
export const getSvgPathFromStroke = (stroke) => {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );

  d.push("Z");
  return d.join(" ");
};
