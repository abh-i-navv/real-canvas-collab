import { cn } from "@/lib/utils";
import { CanvasMode, CanvasState, LayerType } from "@/types/canvas";
import { Circle, Minus, MousePointer2, Square, Type, Pencil, Brush, Trash2, Eraser } from "lucide-react";
import { useDrawingContext } from "../context/drawing-context";
import { Socket } from "socket.io-client";

interface ToolBarProps {
    canvasState: CanvasState;
    setCanvasState: (state: CanvasState) => void;
    Clear: () => void;
    socket?: Socket<any, any>;
    boardId?: string | string[];
}

export const Sidebar = ({canvasState,setCanvasState, Clear,socket,boardId}: ToolBarProps) => {

    const {selectedTool, setSelectedTool, setSelection} = useDrawingContext()

    const handlePointerDown = (e: any, tool: string, canvasState: CanvasState) => {
        e.preventDefault()
        setCanvasState(canvasState)
        setSelectedTool(tool)
        setSelection(undefined)
    }

    return(
        <div className="flex border-[#322560] border-2 mt-2 shadow-md rounded-lg lg:hidden shadow:md absolute left-0 h-auto w-16 ">
            <div className="h-full flex flex-col justify-center items-center">
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
    )

}