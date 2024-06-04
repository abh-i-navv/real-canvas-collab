"use client"

import { CanvasMode, CanvasState, LayerType, Point } from "@/types/canvas";
import { createContext, useContext, useState } from "react";

export interface DrawingElement {
    id: string;
    type: string;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    points?: Point[];
    options?: any;
    image?: any;
    text?: string;
    dimensions: {
        x: number;
        y: number;
        h: number;
        w: number;
        offsetX?: number;
        offsetY?: number;
        options?: any
    }
  }

export interface DrawingContextType {
    elements: Map<string, DrawingElement>;
    setElements: (el: any) => void;
    addElement: (element: DrawingElement) => void;
    removeElement: (id: string) => void;
    pause: () => void;
    resume: () => void;
    updateElement: (e: string, element:DrawingElement) => void;
    canvasState: CanvasState;
    setCanvasState: (newState: CanvasState) => void;
    selection: DrawingElement | DrawingElement[] | undefined;
    setSelection: (elements: any) => void;
    selectedTool: string;
    setSelectedTool: (tool :string) => void;
    color: string;
    setColor: (color: string) => void
    strokeWidth: number;
    setStrokeWidth: (width: number) => void
    backgroundColor: string;
    setBackgroundColor: (color: string) => void
  }

const DrawingContext = createContext<DrawingContextType | undefined>(undefined)

const DrawingProvider = ({children} : Readonly<{
    children: React.ReactNode;
  }>) => {
    const [elements, setElements] = useState(new Map())
    const [isPaused,setIsPaused] = useState(false)
    const [canvasState,setCanvasState] = useState<CanvasState>({mode: CanvasMode.None, layerType: LayerType.None})
    const [selection, setSelection] = useState<DrawingElement[]>([])
    const [selectedTool, setSelectedTool] = useState('none')
    const [color, setColor] = useState("#000000")
    const [strokeWidth, setStrokeWidth] = useState(3)
    const [backgroundColor, setBackgroundColor] = useState("#ffffff")

    const addElement = (element: DrawingElement | undefined) => {
        if(isPaused){
            return
        }
        if(!element){
            return
        }
        setElements((prevElements) => {
          const newElements = new Map(prevElements);
          newElements.set(element.id, element);
          return newElements;
        });
      };
    
      const removeElement = (id: string) => {
        setElements((prevElements) => {
          const newElements = new Map(prevElements);
          newElements.delete(id);
          return newElements;
        });
      };

      const updateElement = (id: string, element: DrawingElement) => {
        if(!element || !id){
          return
        }
        elements.set(id, element)
      }

      const pause = () => {
        setIsPaused(true)
      }

      const resume = () => {
        setIsPaused(false)
      }

      return (
        <DrawingContext.Provider value={{ elements,setElements, addElement, removeElement,pause , resume,updateElement,canvasState,
        setCanvasState,setSelection, selection, selectedTool, setSelectedTool, color, setColor,strokeWidth, setStrokeWidth, backgroundColor, setBackgroundColor }}>
          {children}
        </DrawingContext.Provider>
      );

}   

const useDrawingContext = () => {
    const context = useContext(DrawingContext);
    if (context === undefined) {
      throw new Error('useDrawingContext must be used within a DrawingProvider');
    }
    return context;
  };
  
  export { DrawingProvider, useDrawingContext };