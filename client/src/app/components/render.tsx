import { Shape } from "@/shape"
import { DrawingElement } from "../context/drawing-context"
import { Point } from "@/types/canvas"

export const RenderCanvas = (canvas: HTMLCanvasElement, options: any, elements: Map<string, DrawingElement>, camera: Point, selectedEle?: DrawingElement[] | DrawingElement) => {

    const ctx = canvas.getContext("2d")
    const generator = new Shape(ctx,options)

    if(!ctx){
        return
    }

    ctx?.clearRect(0,0,canvas.width,canvas.height)
                
    ctx?.save()
    ctx?.translate(camera.x,camera.y)
    generator.draw(elements)
    if(selectedEle){
        generator.draw([selectedEle])
    }
    ctx?.restore()

}