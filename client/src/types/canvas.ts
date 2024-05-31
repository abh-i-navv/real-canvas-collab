import { DrawingElement } from "@/app/context/drawing-context";

export interface Point{
    x: number;
    y:number
}

export enum LayerType {
    Text,
    Note,
    Rectangle,
    Ellipse,
    Path,
    None,
    Translate,
    Line,
    Brush,
    Eraser
  }

export enum CanvasMode {
    None,
    Pressing,
    SelectionNet,
    Translating,
    Inserting,
    Resizing,
    Brush,
}

export type XYWH = {
    x: number;
    y: number;
    a?: number;
    b?: number;
    width: number;
    height: number;
  };

  export enum Side {
    Top = 1,
    Bottom = 2,
    Left = 4,
    Right = 8,
  }

export type CanvasState =
    | {
        mode: CanvasMode.None;
        layerType?:
          | LayerType.Ellipse
          | LayerType.Rectangle
          | LayerType.Text
          | LayerType.Note
          | LayerType.None
          | LayerType.Translate
          | LayerType.Line
          | LayerType.Brush
          | LayerType.Eraser;
        current? : Point
      }
    | {
        mode: CanvasMode.Pressing;
        origin: Point;
      }
    | {
        mode: CanvasMode.SelectionNet;
        origin: Point;
        current?: Point;
      }
    | {
        mode: CanvasMode.Translating;
        current: Point | XYWH;
        id?: string;
        element: DrawingElement;
      }
    | {
        mode: CanvasMode.Inserting;
        layerType:
          | LayerType.Ellipse
          | LayerType.Rectangle
          | LayerType.Text
          | LayerType.Note
          | LayerType.Line
          | LayerType.Brush
          | LayerType.Eraser;
        current?: Point | Point[] | any;
      }
    | {
        mode: CanvasMode.Resizing;
        initialBounds: XYWH;
        corner: Side;
      }
    | {
        mode: CanvasMode.Brush;
      };

export type shapeType = "rectangle" | "line" | "ellipse"