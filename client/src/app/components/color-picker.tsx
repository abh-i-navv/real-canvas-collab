"use client"

import { useState } from "react"
import { useDrawingContext } from "../context/drawing-context"

export const ColorPicker = ({type} :{type: string}) => {
    const {color, setColor,setBackgroundColor, backgroundColor} = useDrawingContext()

    const handleOnChange = (e:any) => {
      if(type === "color"){
        setColor(e.target.value)
      }
      else if(type ==="bg"){
        setBackgroundColor(e.target.value)
      }
    }

    return(
        <div className='flex justify-center items-center m-2 w-8'>
        <input type='color' value={type === "bg" ? backgroundColor : color} onChange={handleOnChange}></input>
      </div>
    )

}