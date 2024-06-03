"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {Shape} from "../../shape"
import { DrawingElement, useDrawingContext } from '../context/drawing-context';
import { CanvasMode, LayerType, Point, XYWH } from '@/types/canvas';
import { ToolBar } from './toolbar';
import { deserializeMap, elementFinder, getPathData, pointerEventToCanvasPoint, serializeMap } from '@/lib/utils';
import { SelectionBox } from './selection-box';
import { RenderCanvas } from './render';
import { Socket } from 'socket.io-client';

export const Canvas = ({socket, boardId}: {socket?: Socket<any, any>, boardId?: string | string[]}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const { elements,setElements, addElement, removeElement, pause, resume,updateElement,setCanvasState,canvasState, selection, setSelection,color, strokeWidth,backgroundColor } = useDrawingContext();
    const [camera, setCamera] = useState<Point>({x:0, y:0})
    const [currEle, setCurrEle] = useState<DrawingElement>()
    const [imageDimensions, setImageDimensions] = useState({w:0, h:0})
    const inputRef = useRef<HTMLInputElement>(null)
    const [currText, setCurrText] = useState<string>('')

    useEffect(() => {
        const canvas = canvasRef.current;
        
        if(!canvas) return
        
        const ctx = canvas.getContext("2d")
        const options = {
            lineWidth: strokeWidth,
            strokeStyle: color,
            lineJoin: "bevel"
          } 

          const  localEle = localStorage.getItem('elements')
          if(localEle){
            const storageEle = deserializeMap(localEle)
            if(storageEle){
              setElements(storageEle)
              localStorage.clear()
            }
            
          }
          

          setTimeout(() => {
            if(socket){
              socket.on('draw-data', (data: any) => {
                addElement(data)
              });
              socket.on('update-data', (data: any) => {
                updateElement(data.id,data)
                RenderCanvas(canvas, options,elements, camera, selection)
              });
            }
          },50)
          

          const generator = new Shape(ctx,options)

          RenderCanvas(canvas, options,elements, camera, selection)
          
        const onPointerDown = (e: any) => {
          e.preventDefault()
            if(!e || !ctx){
                return
            }
            const point = pointerEventToCanvasPoint(e,camera)
            
            if(canvasState.mode === CanvasMode.None && canvasState.layerType === LayerType.None){
              const selectedEle = elementFinder({x:point.x, y:point.y}, elements)
              setSelection(undefined)
              
              setCanvasState({mode: CanvasMode.None, layerType: LayerType.None, current: {x:point.x, y:point.y}})
              
              if(!selectedEle){
                setSelection(undefined)
                return
              }
              const type = selectedEle.type

              if(type === 'eraser'){
                return
              }
              let newDimensions = {x:point.x, y:point.y}
              const {dimensions} = selectedEle
              

              if(dimensions.offsetX ){
                newDimensions.x -= dimensions.offsetX
              }
              if(dimensions.offsetY){
                newDimensions.y -= dimensions.offsetY
              }

              if(type === 'line'){
                const bounds = {
                  x: selectedEle.x1!,
                  y: selectedEle.y1!,
                  a: selectedEle.x2! + (dimensions.offsetX || 0),
                  b: selectedEle.y2! + (dimensions.offsetY || 0),
                  width: selectedEle.dimensions.w,
                  height: selectedEle.dimensions.h
                }
                SelectionBox(ctx,selectedEle.type, bounds, setSelection)
                
              }

              else{
                const bounds = {
                  x: selectedEle.dimensions.x +(selectedEle.dimensions.offsetX || 0),
                  y:selectedEle.dimensions.y + (selectedEle.dimensions.offsetY || 0),
                  width: selectedEle.dimensions.w,
                  height: selectedEle.dimensions.h
                }
  
                SelectionBox(ctx,selectedEle.type, bounds, setSelection)

              }
              let cloneEle
              setCurrEle(selectedEle)
             
              if(selectedEle.type === "image"){
                const w = selectedEle.dimensions.w
                const h = selectedEle.dimensions.h
                setImageDimensions({w: w, h: h})
              }
              else{
                cloneEle = structuredClone(selectedEle)
              }

              setCanvasState({mode: CanvasMode.Translating, current: newDimensions, id: selectedEle?.id,element: cloneEle || selectedEle})
              
            }


            else if(canvasState.mode === CanvasMode.None && canvasState.layerType === LayerType.Line){
              setSelection(undefined)
              setCanvasState({mode: CanvasMode.Inserting, layerType: LayerType.Line})
              const line:any = generator.line(point.x,point.y,point.x,point.y,options)
              if(socket && boardId){
                socket.emit("draw", {boardId,line})
              }

              setCurrEle(line)
              addElement(line)
              
            }else if(canvasState.mode === CanvasMode.None && canvasState.layerType === LayerType.Rectangle){
              setSelection(undefined)
              setCanvasState({mode: CanvasMode.Inserting, layerType: LayerType.Rectangle})
              const rect:any = generator.rectangle(point.x,point.y,0,0)
              setCurrEle(rect)
              addElement(rect)

              if(socket && boardId){
                socket.emit("draw", {boardId,rect})
              }
              
            }
            else if(canvasState.mode === CanvasMode.None && canvasState.layerType === LayerType.Ellipse){
              setSelection(undefined)
              setCanvasState({mode: CanvasMode.Inserting, layerType: LayerType.Ellipse})
              const ellipse:any = generator.ellipse(point.x,point.y,0,0)
              setCurrEle(ellipse)
              addElement(ellipse)

              if(socket && boardId){
                socket.emit("draw", {boardId,ellipse})
              }
              
            }
            else if(canvasState.mode === CanvasMode.None && canvasState.layerType === LayerType.Text){
              setSelection(undefined)
              const pt = {x:e.clientX, y: e.clientY} as Point
              setCanvasState({mode: CanvasMode.Inserting, layerType: LayerType.Text, current: pt})
              const text:any = generator.textBox(point.x,point.y,0,0,currText,options)
              setCurrEle(text)
              addElement(text)
              if(socket && boardId){
                socket.emit("draw", {boardId,text})
              }

              setTimeout(() => {
                inputRef.current?.focus();
              }, 0)
              
            }
            else if(canvasState.mode === CanvasMode.None && canvasState.layerType === LayerType.Brush){
              setSelection(undefined)
              const points=  [{x:point.x, y: point.y}]

              setCanvasState({mode: CanvasMode.Inserting, layerType: LayerType.Brush, current: points})
              const brush:any = generator.brush(point.x,point.y,5,5,points,options)
              setCurrEle(brush)
              addElement(brush)
              if(socket && boardId){
                socket.emit("draw", {boardId,brush})
              }
              
            }
            else if(canvasState.mode === CanvasMode.None && canvasState.layerType === LayerType.Eraser){
              setSelection(undefined)
              const points=  [{x:point.x, y: point.y}]

              setCanvasState({mode: CanvasMode.Inserting, layerType: LayerType.Eraser, current: points})
              options.strokeStyle = backgroundColor
              const brush:any = generator.eraser(point.x,point.y,5,5,points,options)
              setCurrEle(brush)
              addElement(brush)

              if(socket && boardId){
                socket.emit("draw", {boardId,brush})
              }
              
            }
            
            
        }

        const onPointerUp = (e: any) => {
          e.preventDefault()
            if(!currEle){
                return
            }
            
            if(canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Rectangle){
              
              setCurrEle(undefined)

              setCanvasState({mode: CanvasMode.None, layerType: LayerType.Rectangle})
            }else if(canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Line){
              setCurrEle(undefined)

              setCanvasState({mode: CanvasMode.None, layerType: LayerType.Line})
            }else if(canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Ellipse){
              setCurrEle(undefined)

              setCanvasState({mode: CanvasMode.None, layerType: LayerType.Ellipse})
            }
            else if(canvasState.mode === CanvasMode.Translating) {
              RenderCanvas(canvas,options,elements,camera)

              setCanvasState({mode: CanvasMode.None, layerType: LayerType.None})
            }
            else if(canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Text){
            }
            else if(canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Brush){
              
              setCurrEle(undefined)
              setCanvasState({mode: CanvasMode.None, layerType: LayerType.Brush})
            }
            else if(canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Eraser){
              setCurrEle(undefined)
              setCanvasState({mode: CanvasMode.None, layerType: LayerType.Eraser})
            }
            // else{

            //   setCanvasState({mode: CanvasMode.None, layerType: LayerType.None})
            // }

        }

        const onPointerMove = (e: any) => {
          e.preventDefault()
          if(!currEle || !ctx){
            return
          }

          const point = pointerEventToCanvasPoint(e,camera)
          const type = currEle.type

          if(canvasState.mode === CanvasMode.None){

            const threshold = 5

            let offsetX = 0
            let offsetY = 0

            if(currEle.dimensions.offsetX){
              offsetX = currEle.dimensions.offsetX
            }

            if(currEle.dimensions.offsetY){
              offsetY = currEle.dimensions.offsetY
            }
            
            if( (type !== 'line') && Math.abs(point.y - currEle.dimensions.y - offsetY - currEle.dimensions.h ) <= threshold && point.x >= currEle.dimensions.x + offsetX && point.x <= currEle.dimensions.w + currEle.dimensions.x +offsetX){
              if(type === 'text' || type === 'brush'){
                return
              }
              e.target.style.cursor = "ns-resize"

            }
            else if(type !== 'line' && Math.abs(point.x - (currEle.dimensions.w + currEle.dimensions.x + offsetX)) <= threshold && point.y >= currEle.dimensions.y + offsetY && point.y <= currEle.dimensions.y + offsetY + currEle.dimensions.h){
              if(type === 'text' || type === 'brush'){
                return
              }
              e.target.style.cursor = "ew-resize"
            }
            else if(type !== 'line' && Math.abs(point.x - (currEle.dimensions.w + currEle.dimensions.x + offsetX)) <= threshold && Math.abs(point.y - (currEle.dimensions.h + currEle.dimensions.y + offsetY)) <= threshold){
              if(type === 'text' || type === 'brush'){
                return
              }
              e.target.style.cursor = "nwse-resize"
            }
            // else if(type !== 'line' && Math.abs(point.x - (currEle.dimensions.x + offsetX)) <= threshold && Math.abs(point.y - (currEle.dimensions.y + offsetY)) <= threshold){
            //   if(type === 'text' || type === 'brush'){
            //     return
            //   }
            //   e.target.style.cursor = "nw-resize"
            // }




            else if(type === 'line' && Math.abs(point.x - (currEle.x2! + offsetX)) <= threshold && Math.abs(point.y - (currEle.y2! + offsetY)) <= threshold){
              e.target.style.cursor = "ew-resize"
            }
            else if(type === 'line' && Math.abs(point.x - (currEle.x1! + offsetX)) <= threshold && Math.abs(point.y - (currEle.y1! + offsetY)) <= threshold){
              e.target.style.cursor = "e-resize"
            }
            else{
              e.target.style.cursor = "context-menu"
            }
            

          }

          if(canvasState.mode === CanvasMode.Translating){

            if(e.target.style.cursor === 'ew-resize' || e.target.style.cursor === 'ns-resize' || e.target.style.cursor === 'e-resize' || e.target.style.cursor === "nwse-resize"){
              let diffX = (point.x - canvasState.current.x )
              let diffY = point.y - canvasState.current.y 
              
              if(currEle.dimensions.offsetX){
                diffX -= currEle.dimensions.offsetX
              }
              if(currEle.dimensions.offsetY){
                diffY -= currEle.dimensions.offsetY
              }

              if(e.target.style.cursor === 'ew-resize'){
                
                if((type === 'rectangle' || type === 'ellipse' || type === 'image') && point.x > currEle.dimensions.x + (currEle.dimensions.offsetX ? currEle.dimensions.offsetX : 0)){
                  if(type === 'ellipse' && canvasState.element.dimensions.w + diffX <= 5){
                    return
                  }
                  else if(type === "image"){
                    currEle.dimensions.w = imageDimensions.w + diffX
                  }
                  else{
                    currEle.dimensions.w = canvasState.element.dimensions.w + diffX
                  }
                  
                }
                if(type === 'line'){
                  currEle.x2 = canvasState.element.x2! + diffX
                  currEle.y2 = canvasState.element.y2! + diffY
                  currEle.dimensions.x = Math.min(currEle.x1!,currEle.x2) 
                  currEle.dimensions.y = Math.min(currEle.y1!,currEle.y2) 
                  currEle.dimensions.w = Math.abs(currEle.x2-currEle.x1!)
                  currEle.dimensions.h = Math.abs(currEle.y2-currEle.y1!)
                }

              }

              if(e.target.style.cursor === 'ns-resize'){
                
                if((type === 'rectangle' || type === 'ellipse' || type === "image") && point.y > currEle.dimensions.y + (currEle.dimensions.offsetY ? currEle.dimensions.offsetY : 0)){
                  if(type === 'ellipse' && canvasState.element.dimensions.h + diffY <= 5){
                    return
                  }
                  else if(type === "image"){
                    currEle.dimensions.h = imageDimensions.h+ diffY
                  }
                  else{
                    currEle.dimensions.h = canvasState.element.dimensions.h + diffY
                  }
                }

              }
              if(e.target.style.cursor === 'e-resize'){
                
                if(type === 'line'){
                  currEle.x1 = canvasState.element.x1! + diffX
                  currEle.y1 = canvasState.element.y1! + diffY
                  currEle.dimensions.x = Math.min(currEle.x1,currEle.x2!) 
                  currEle.dimensions.y = Math.min(currEle.y1,currEle.y2!) 
                  currEle.dimensions.w = Math.abs(currEle.x2!-currEle.x1)
                  currEle.dimensions.h = Math.abs(currEle.y2!-currEle.y1)
                }
              }
              if(e.target.style.cursor === 'nwse-resize'){
                
                if((type === 'rectangle' || type === 'ellipse' || type === 'image') && point.x > currEle.dimensions.x + (currEle.dimensions.offsetX ? currEle.dimensions.offsetX : 0) && point.y > currEle.dimensions.y + (currEle.dimensions.offsetY ? currEle.dimensions.offsetY : 0)){
                  if(type === 'ellipse' && (canvasState.element.dimensions.w + diffX <= 5 || canvasState.element.dimensions.h + diffY <= 5)){
                    return
                  }
                  else if(type === "image"){
                    currEle.dimensions.w = imageDimensions.w + diffX
                    currEle.dimensions.h = imageDimensions.h+ diffY
                  }
                  else{
                    currEle.dimensions.w = canvasState.element.dimensions.w + diffX
                    currEle.dimensions.h = canvasState.element.dimensions.h + diffY
                  }
                  
                }
              }
                



              if(type === 'line'){
                const bounds = {
                  x: currEle.x1! + (currEle.dimensions.offsetX || 0),
                  y: currEle.y1! + (currEle.dimensions.offsetY || 0),
                  a: currEle.x2! + (currEle.dimensions.offsetX || 0),
                  b:currEle.y2! + (currEle.dimensions.offsetY || 0),
                  width: currEle.dimensions.w,
                  height: currEle.dimensions.h
                }
              
                const selectRect = SelectionBox(ctx,currEle.type ,bounds,setSelection)

                RenderCanvas(canvas, options,elements, camera,selectRect)

              }
              else{

                const bounds = {
                  x: currEle.dimensions.x + (currEle.dimensions.offsetX || 0),
                  y: currEle.dimensions.y + (currEle.dimensions.offsetY || 0),
                  width: currEle.dimensions.w,
                  height: currEle.dimensions.h
                }
              
              const selectRect = SelectionBox(ctx,currEle.type ,bounds,setSelection)
            
              RenderCanvas(canvas, options,elements, camera, selectRect)

            }
              
            }

            else{

              let offsetX = point.x - currEle.dimensions.x - ( canvasState.current.x - currEle.dimensions.x)
              let offsetY = point.y - currEle.dimensions.y - ( canvasState.current.y - currEle.dimensions.y)
              
              const temp = {...currEle}
              
              temp.dimensions.offsetX = offsetX
              temp.dimensions.offsetY = offsetY

              const bounds = {
                x: currEle.dimensions.x + offsetX,
                y: currEle.dimensions.y + offsetY,
                width: currEle.dimensions.w,
                height: currEle.dimensions.h
              }

              const selectRect = SelectionBox(ctx,currEle.type ,bounds,setSelection)

              ctx.restore()
              
              RenderCanvas(canvas, options,elements, camera,selectRect)
            }
            if(socket && boardId){
              socket.emit("update-board", {data: currEle,boardId})
            }

          }

          if(canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Line) {
            const newLine: any = generator.line(currEle.dimensions.x,currEle.dimensions.y, point.x,  point.y,currEle.options,null,currEle.id)
            updateElement(currEle.id, newLine)

            if(socket && boardId){
              socket.emit("update-board", {data: newLine,boardId})
            }

            RenderCanvas(canvas, options,elements, camera)

          }
          else if(canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Rectangle){
            const newRect: any = generator.rectangle(Math.min(currEle.dimensions.x, point.x),Math.min(currEle.dimensions.y, point.y), Math.abs(currEle.dimensions.x - point.x), Math.abs(currEle.dimensions.y - point.y),currEle.options,null,currEle.id)
            updateElement(currEle.id, newRect)
            RenderCanvas(canvas, options,elements, camera)

            if(socket && boardId){
              socket.emit("update-board", {data: newRect,boardId})
            }
          }
          else if(canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Ellipse) {
            const newEllipse: any = generator.ellipse(Math.min(currEle.dimensions.x, point.x),Math.min(currEle.dimensions.y, point.y), Math.abs(currEle.dimensions.x - point.x), Math.abs(currEle.dimensions.y - point.y), currEle.options, null, currEle.id)
            updateElement(currEle.id, newEllipse)

            RenderCanvas(canvas, options,elements, camera)

            if(socket && boardId){
              socket.emit("update-board", {data: newEllipse,boardId})
            }
          }
          else if(canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Brush){
            
            let newPts = canvasState.current as Point[]
            const currPt = {x:point.x, y: point.y}

            newPts = [...newPts, currPt]
            canvasState.current = newPts

            let minX = Number.MAX_SAFE_INTEGER
            let minY = Number.MAX_SAFE_INTEGER
            let maxX = Number.MIN_SAFE_INTEGER
            let maxY = Number.MIN_SAFE_INTEGER

            for(let i =0; i<newPts.length; i++){
              minX = Math.min(newPts[i].x, minX)
              maxX = Math.max(newPts[i].x, maxX)
              minY = Math.min(newPts[i].y, minY)
              maxY = Math.max(newPts[i].y, maxY)
            }

            currEle.dimensions.w = Math.abs(minX-maxX)
            currEle.dimensions.h = Math.abs(minY-maxY)

            currEle.dimensions.x = Math.min(currEle.dimensions.x, point.x)
            currEle.dimensions.y = Math.min(currEle.dimensions.y, point.y)

            const newSvg = generator.brush(currEle.dimensions.x, currEle.dimensions.y, currEle.dimensions.w, currEle.dimensions.h, canvasState.current, currEle.options, null, currEle.id)
            updateElement(currEle.id, newSvg)

            if(socket && boardId){
              socket.emit("update-board", {data: newSvg,boardId})
            }

            RenderCanvas(canvas, options,elements, camera)
          }
          else if(canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Eraser){
            
            let newPts = canvasState.current as Point[]
            const currPt = {x:point.x, y: point.y}

            newPts = [...newPts, currPt]
            canvasState.current = newPts

            let minX = Number.MAX_SAFE_INTEGER
            let minY = Number.MAX_SAFE_INTEGER
            let maxX = Number.MIN_SAFE_INTEGER
            let maxY = Number.MIN_SAFE_INTEGER

            for(let i =0; i<newPts.length; i++){
              minX = Math.min(newPts[i].x, minX)
              maxX = Math.max(newPts[i].x, maxX)
              minY = Math.min(newPts[i].y, minY)
              maxY = Math.max(newPts[i].y, maxY)
            }

            currEle.dimensions.w = Math.abs(minX-maxX)
            currEle.dimensions.h = Math.abs(minY-maxY)

            currEle.dimensions.x = Math.min(currEle.dimensions.x, point.x)
            currEle.dimensions.y = Math.min(currEle.dimensions.y, point.y)

            const newSvg = generator.eraser(currEle.dimensions.x, currEle.dimensions.y, currEle.dimensions.w, currEle.dimensions.h, canvasState.current, currEle.options, null, currEle.id)
            updateElement(currEle.id, newSvg)

            if(socket && boardId){
              socket.emit("update-board", {data: newSvg,boardId})
            }

            RenderCanvas(canvas, options,elements, camera)
          }
        }

        const onKeyDown = (e: any) => {
          
          if(!(canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Text && currEle)){
            return
          }

          if(e.key === 'Enter'){            
            currEle.text = currText
            const metrics = ctx?.measureText(currText)
            
            if(metrics?.width){
              currEle.dimensions.w = (Math.round(metrics?.width)*4)
            }
            if(socket && boardId){
              socket.emit("update-board", {data: currEle,boardId})
            }

            setCanvasState({mode: CanvasMode.None, layerType: LayerType.Text})
            setCurrText('')
            setCurrEle(undefined)
          }
        }
        
        const onPaste = (event: ClipboardEvent) => {
          if(!ctx){
            return
          }
          if (event.clipboardData) {
            const items = event.clipboardData.items;
            for (const item of items) {
              
              if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                  const imageUrl = URL.createObjectURL(file);
                  const image = new Image();
                  image.src = imageUrl;
                  image.onload = () => {
                    if (ctx && canvasState.mode === CanvasMode.None && canvasState.layerType === LayerType.None) {
                      const newImg = generator.img( canvasState.current?.x || 100,canvasState.current?.y || 100,image.width,image.height,image)
                      if(newImg){
                        addElement(newImg)
                      }
                      
                    }
                    URL.revokeObjectURL(imageUrl)
                  };
                }
              }
            }
          }
        }

        canvas.addEventListener("pointerdown", onPointerDown)
        document.addEventListener("pointerup", onPointerUp)
        canvas.addEventListener("pointermove", onPointerMove)
        document.addEventListener('keydown', onKeyDown)
        document.addEventListener("paste",onPaste)

        return () => {
            canvas.removeEventListener("pointerdown", onPointerDown)
            document.removeEventListener("pointerup", onPointerUp)
            canvas.removeEventListener("pointermove", onPointerMove)
            document.removeEventListener('keydown', onKeyDown)
            document.removeEventListener("paste",onPaste)
            if(socket ){
              socket.off("draw-data")
              socket.off("update-data")
            }
        }
        
    }, [elements, dimensions,canvasState,camera,currText,color,strokeWidth,selection,backgroundColor,socket]);

    const onWheel = useCallback((e: React.WheelEvent) => {
        setCamera((camera) => ({
            x: camera.x -e.deltaX,
            y: camera.y -e.deltaY
        }))
    },[])

    useEffect(() => {
        if (typeof window !== 'undefined') {
          const handleResize = () => {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
          };
    
          handleResize(); // Set initial dimensions
          window.addEventListener('resize', handleResize);
    
          return () => {
            window.removeEventListener('resize', handleResize);
          };
        }
      }, [camera]);

    useEffect(() => {
      const saveElementToLocal = (e: any) => {
        localStorage.setItem('elements', serializeMap(elements))
      };
      
      window.addEventListener("beforeunload", saveElementToLocal);
      
      
      return () => {
        window.removeEventListener("beforeunload", saveElementToLocal);
      };

    }, [elements]);
    

    return (
        <>
            <ToolBar canvasState={canvasState} setCanvasState={setCanvasState}/>
            {
            canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Text && currEle && canvasState.current as Point &&
              <input autoComplete='off' ref={inputRef} id='text-box' className={`bg-transparent w-auto fixed h-10 focus:outline-none font-serif text-4xl`}
              style={{color: color, top: canvasState.current!.y, left:canvasState.current!.x , width: currText.length > 21 ? currText.length*20 : '394px'}}
              onChange={(e) => {setCurrText(e.target.value)}} />

            }

            <canvas className='touch-none'
              style={{background: backgroundColor}}
              height={ dimensions.height} width={dimensions.width} ref={canvasRef} onWheel={onWheel}/>
        </>
    );
};