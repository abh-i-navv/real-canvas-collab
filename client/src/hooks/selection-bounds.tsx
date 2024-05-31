import { DrawingElement } from "@/app/context/drawing-context"

export const selectionBounds = (selection: DrawingElement[]) => {
    const first = selection[0]

    if(!first || !selection){
        return null
    }

    let left = first.dimensions.x
    let top = first.dimensions.y    
    let right = first.dimensions.x + first.dimensions.w
    let bottom = first.dimensions.y + first.dimensions.h

    
    

    for(let i =1; i<selection.length; i++){
        let {x,y,w,h} = selection[i].dimensions

        if(left > x){
            left = x
        }
        if(right < x+w){
            right = x+w
        }
        if(top >y){
            top = y;
        }
        if(bottom < y+h){
            bottom = y+h
        }
    }

    return {
        x:left,
        y: top,
        w: right-left,
        h: bottom-top
    }

}