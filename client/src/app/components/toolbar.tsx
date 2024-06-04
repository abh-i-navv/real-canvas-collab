import { cn } from "@/lib/utils";
import { CanvasMode, CanvasState, LayerType } from "@/types/canvas";
import { Circle, Minus, MousePointer2, Square, Type, Pencil, Undo2, Redo2, Brush, Cross, Trash2, Eraser, Menu, Settings } from "lucide-react";
import { DrawingElement, useDrawingContext } from "../context/drawing-context";
import { Sidebar } from "./sidebar";
import { useEffect, useState } from "react";
import { ColorPicker } from "./color-picker";
import { ContextMenu } from "./context-menu";
import { Socket } from "socket.io-client";

interface ToolBarProps {
    canvasState: CanvasState;
    setCanvasState: (state: CanvasState) => void;
    socket?: Socket<any, any>;
    boardId?: string | string[];
}

export const ToolBar = ({canvasState,setCanvasState, socket,boardId}: ToolBarProps) => {

    const {selectedTool, setSelectedTool,elements,removeElement,addElement, setSelection, setElements} = useDrawingContext()
    const [history, setHistory] = useState<any>([])
    const [color, setColor] = useState("#000")

    const Undo = () => {
        if(!elements){
            return
        }
        const n = elements.size

        if(n <=0 ){
            return
        }
        const getLastValueInMap = (elements: any) => {
            return [...elements][n-1][1]}
        getLastValueInMap(elements)
        const lastEle = getLastValueInMap(elements);
        setSelection(undefined)
        
        setHistory((history: any) => [...history, lastEle])
        removeElement(lastEle.id)        
        if(socket && boardId){
            socket.emit("board-actions", {boardId,elements})
        }
        
    }

    const Redo = () => {
        if(history.length){
            const lastEle = history.pop()
            addElement(lastEle!)
            if(socket && boardId){
                socket.emit("draw", {boardId,data: lastEle})
            }
        }
    }

    const Clear = () => {
        if(!elements){
            return
        }
        let array = Array.from(elements, ([name, value]) => (value))
        setHistory(array)
        setElements(new Map())
        setSelection(undefined)
        if(socket && boardId){
            socket.emit("clear-board", {boardId,elements: new Map()})
        }

    }

    const handlePointerDown = (e: any, tool: string, canvasState: CanvasState) => {
        e.preventDefault()
        setCanvasState(canvasState)
        setSelectedTool(tool)
        setSelection(undefined)
    }

    return(
        <>
        <Sidebar canvasState={canvasState} setCanvasState={setCanvasState} Clear={Clear}/>
        <div className="hidden lg:flex absolute top-0 border-2 border-[#322560] z-10 bg-[#fafafa] rounded-xl mt-2 shadow-md">
            <div className="h-full flex justify-center items-center">
                <div className={cn("m-2 p-2 hover:bg-[#b3aad5]", ( selectedTool === 'none' || (canvasState.mode === CanvasMode.None && canvasState.layerType === LayerType.None)) && "bg-[#b3aad5]")}
                    onPointerDown={(e) => {
                        handlePointerDown(e,"none", {mode: CanvasMode.None, layerType: LayerType.None})
                }}
                >
                    <MousePointer2 />
                </div>

            <div className={cn("m-2 p-2 hover:bg-[#b3aad5]", ((canvasState.mode === CanvasMode.None && canvasState.layerType === LayerType.Brush) || selectedTool === 'brush') &&  "bg-[#b3aad5]")}
                onPointerDown={(e) => {
                    handlePointerDown(e,"brush", {mode: CanvasMode.None, layerType: LayerType.Brush})
                }}
            >
                <Brush />
                {/* <ContextMenu Icon={Brush}/> */}
            </div>

            <div className={cn("m-2 p-2 hover:bg-[#b3aad5]", ((canvasState.mode === CanvasMode.None && canvasState.layerType === LayerType.Eraser) || selectedTool === 'eraser') &&  "bg-[#b3aad5]")}
                onPointerDown={(e) => {
                    handlePointerDown(e,"eraser", {mode: CanvasMode.None, layerType: LayerType.Eraser})
                }}
            >
                <Eraser />
                {/* <ContextMenu Icon={Eraser}/> */}
            </div>

            <div onPointerDown={(e) => {
                e.preventDefault()
                setCanvasState({mode: CanvasMode.None, layerType: LayerType.Line})
                    setSelectedTool('line')
                }}
                className={cn("m-2 p-2 hover:bg-[#b3aad5]", ((canvasState.mode === CanvasMode.None && canvasState.layerType === LayerType.Line) || selectedTool === 'line') && "bg-[#b3aad5]")}>
                
                <Minus />
                {/* <ContextMenu Icon={Minus}/> */}
            </div>

            <div onPointerDown={(e) => {
                e.preventDefault()
                setCanvasState({mode: CanvasMode.None, layerType: LayerType.Rectangle})
                    setSelectedTool('rectangle')
                }} 
                className={cn("m-2 p-2 hover:bg-[#b3aad5]", ((canvasState.mode === CanvasMode.None && canvasState.layerType === LayerType.Rectangle) || selectedTool === 'rectangle') && "bg-[#b3aad5]")} >
                
                <Square />
                {/* <ContextMenu Icon={Square}/> */}
            </div>

            <div onPointerDown={(e) => {
                e.preventDefault()
                setCanvasState({mode: CanvasMode.None, layerType: LayerType.Ellipse})
                    setSelectedTool('ellipse')
                }}
                className={cn("m-2 p-2 hover:bg-[#b3aad5]", ((canvasState.mode === CanvasMode.None && canvasState.layerType === LayerType.Ellipse) || selectedTool === 'ellipse') && "bg-[#b3aad5]")} >
                
                <Circle />
                {/* <ContextMenu Icon={Circle}/> */}
            </div>

            <div onPointerDown={(e) => {
                e.preventDefault()
                setCanvasState({mode: CanvasMode.None, layerType: LayerType.Text})
                    setSelectedTool('text')
                }} 
                className={cn("m-2 p-2 hover:bg-[#b3aad5]", ((canvasState.mode === CanvasMode.None && canvasState.layerType === LayerType.Text) || selectedTool === 'text') && "bg-[#b3aad5]")}>

                <Type />
            </div>
            <div  onPointerDown={Clear}
                className={"m-2 p-2 hover:bg-[#b3aad5]"}
            >
            <Trash2/>
            </div>
            {/* <div className="border-none" 
                onPointerDown={(e) => {
                e.preventDefault()
            }}>
                <ColorPicker />
            </div> */}

            </div>

        </div>
        <div className='flex absolute top-0 right-0 ' >
        <div className='m-2 border-[#322560] border-2 cursor-pointer rounded-lg hover:bg-[#b3aad5] z-10' onPointerDown={Undo} >
            <Undo2 className='' size={30}/>
        </div>

        <div className='m-2 cursor-pointer border-[#322560] border-2 rounded-lg hover:bg-[#b3aad5] z-10' onPointerDown={Redo}>
            <Redo2 className='' size={30}/>
        </div>
        </div>

        <div className="top-2 left-2 m-2 p-2 absolute">
            <ContextMenu Icon={Settings}/>
        </div>
        
        </>
    )

}