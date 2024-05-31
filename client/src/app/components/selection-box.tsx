import { CanvasState, XYWH, shapeType } from "@/types/canvas";
import { DrawingElement, useDrawingContext } from "../context/drawing-context"
import { useEffect } from "react";
import { selectionBounds } from "@/hooks/selection-bounds";
import { Shape } from "@/shape";

interface SelectionBoxProps{
    element: DrawingElement;
    ctx: CanvasRenderingContext2D;
}

export const SelectionBox = (ctx:CanvasRenderingContext2D,type: string,  bounds: XYWH, setSelection : (element: DrawingElement) => void ) => {

    const selectionGen = new Shape(ctx)
    const threshold = 5

    if(type === 'line'){
        
        ctx.save()
        const box1: any = selectionGen.rectangle(bounds.a! - threshold , bounds.b! - threshold , 2*threshold ,2*threshold, {
            strokeStyle:'blue',
            lineWidth : 2,
            })
        setSelection(box1)

        ctx.restore()
    }

    else{

        ctx.save()
        const selectRect: any = selectionGen.rectangle(bounds.x - threshold , bounds.y - threshold , bounds.width + 2*threshold , bounds.height + 2*threshold, {
            strokeStyle:'blue',
            lineWidth : 2,
            })
        setSelection(selectRect)

        ctx.restore()

        return selectRect
}

}