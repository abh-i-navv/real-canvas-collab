import { DrawingElement } from "@/app/context/drawing-context";
import { Shape } from "@/shape";
import { Point } from "@/types/canvas";
import { type ClassValue, clsx } from "clsx"
import getStroke from "perfect-freehand";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface Camera {
  x:number;
  y:number;
}

export function pointerEventToCanvasPoint(e: React.PointerEvent, camera: Camera){
  return{
    x: Math.round(e.clientX) - camera.x,
    y: Math.round(e.clientY) - camera.y
  }
}

export const elementFinder = (point: Point, elements: Map<string, DrawingElement>): DrawingElement | null => {
  if(!elements){
    return null
  }
  console.log(elements)
  
  const entries = Array.from(elements.entries());
  
  for (let i = 0; i < entries.length; i++) {
    const [key, el] = entries[i];
    const { x, y, w, h,offsetX,offsetY } = el.dimensions;

    if (x+(offsetX ? offsetX : 0) <= point.x + 5 && y+(offsetY ? offsetY : 0) <= point.y + 5 && x + w + (offsetX ? offsetX : 0) >= point.x - 5 && y + h + (offsetY ? offsetY : 0) >= point.y - 5) {
      return el;
    }
  }

  return null;
};

const average = (a: number, b:number) => (a + b) / 2

export function getSvgPathFromStroke(points: any, closed = true) {
  const len = points.length

  if (len < 4) {
    return ``
  }

  let a = points[0]
  let b = points[1]
  const c = points[2]

  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(
    2
  )},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(
    b[1],
    c[1]
  ).toFixed(2)} T`

  for (let i = 2, max = len - 1; i < max; i++) {
    a = points[i]
    b = points[i + 1]
    result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(
      2
    )} `
  }

  if (closed) {
    result += 'Z'
  }

  return result
}

export const getPathData = (pts: Point[],options: any) => {
  if(!pts){
    return
  }
  const thickness=  options.lineWidth >5 ? options.lineWidth : 5
  
  const outlinePoints = getStroke(pts,{size: thickness})
  const pathData = getSvgPathFromStroke(outlinePoints)

  return pathData
}

export const serializeMap = (map: Map<string, DrawingElement>): string => {
  const obj: Record<string, DrawingElement> = {};
  map.forEach((value, key) => {
    if(value.type !== "image"){
      obj[key] = value;
    }
  });
  return JSON.stringify(obj);
};

export const deserializeMap = (str: string): Map<string, DrawingElement> => {
  const obj = JSON.parse(str);
  const map = new Map<string, DrawingElement>();
  Object.keys(obj).forEach(key => {
    map.set(key, obj[key]);
  });
  return map;
};