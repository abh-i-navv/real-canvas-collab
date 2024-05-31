import { getPathData } from "./lib/utils";

export class Shape {

    idGen(){
      var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      return randLetter + Date.now();
    }

    constructor(ctx,options) {
      this.ctx = ctx;
      this.options = options
      this.elements = new Map()
      this.m = [1,0,0,1,0,0]
      // this.ctx.transform(this.m[0],this.m[1],this.m[2],this.m[3],this.m[4],this.m[5])
    }

    getElements(){
      return this.elements
    }

    setElements(elements){
      this.elements = elements
    }

    style(options){
      if(!this.ctx){
        return
      }
      if(options){
        for (let [key, value] of Object.entries(options)) {
          if(key in this.ctx){
            this.ctx[key] = value
          }
        }
      }
    }

    line(x1,y1,x2,y2,options,dimensions,id){
      
      if(!this.ctx){
        return
      }
      this.x1 = x1
      this.x2 = x2
      this.y1 = y1
      this.y2 = y2

      this.type = "line"
      this.style(options)

      let config= {
        x: Math.min(x1,x2),
        y: Math.min(y1,y2),
        w: Math.abs(x2-x1),
        h: Math.abs(y2-y1)
      }

      this.ctx.save()

      if(dimensions && (dimensions.offsetX || dimensions.offsetY)){
        this.ctx.translate(dimensions.offsetX,dimensions.offsetY)
        config.x += dimensions.offsetX
        config.y += dimensions.offsetY

      }

      
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.closePath()
      this.ctx.stroke()

      this.ctx.restore()

      const ele =  {
        id: id || this.idGen(),
        x1:this.x1,
        y1: this.y1,
        x2:this.x2,
        y2:this.y2,
        type: this.type,
        dimensions: config,
        options: (options ? options : this.options)
      }

      return ele
      
    }

    rectangle(x,y,w,h,options,dimensions, id){
      if(!this.ctx || !x || !y){
        return;
      }

      let config= {
        x: x,
        y: y,
        w: w,
        h: h          
      }

      this.style(options)

      this.ctx.save()
      if(dimensions && (dimensions.offsetX || dimensions.offsetY)){
        this.ctx.translate(dimensions.offsetX,dimensions.offsetY)
        config.x += dimensions.offsetX
        config.y += dimensions.offsetY

      }

      this.type = "rectangle"
      
      this.ctx.beginPath()
      this.ctx.strokeRect(x,y,w,h)

      this.ctx.restore()

      const ele = {
        id: id || this.idGen(),
        type: this.type,
        dimensions: config,
        options: (options ? options : this.options),
      }
    
      return ele
    }

   
    ellipse(x,y,w,h,options,dimensions,id){

      if(!this.ctx || !x || !y){
        return;
      }

      let config= {
        x: x,
        y: y,
        w: w,
        h: h          
      }

      this.type = "ellipse"
      this.ctx.save()
      
      if(dimensions && (dimensions.offsetX || dimensions.offsetY)){
        this.ctx.translate(dimensions.offsetX,dimensions.offsetY)
        config.x += dimensions.offsetX
        config.y += dimensions.offsetY

      }

      this.style(options)


      this.ctx.beginPath()
      this.ctx.ellipse((x+ (x+w))/2, (y+(y+h))/2, w/2, h/2, 0, 0,2 * Math.PI,)
      this.ctx.stroke()

      this.ctx.restore()
      const ele = {
        id: id || this.idGen(),
        type: this.type,
        dimensions: config,
        options: (options ? options : this.options)
      }

      return ele

    }

    textBox(x,y,w,h,text,options,dimensions,id){
      this.type = "text"
      this.text = text
      this.x = x
      this.y = y

      w = w ? w : text.length*100

      let config= {
        x: x,
        y: y,
        w: w ,
        h: h || 40       
      }

      this.ctx.save()
      if(options){
        this.ctx.fillStyle = options.strokeStyle
      }

      if(dimensions && (dimensions.offsetX || dimensions.offsetY)){
        this.ctx.translate(dimensions.offsetX,dimensions.offsetY)
        config.x += dimensions.offsetX
        config.y += dimensions.offsetY

      }

      this.ctx.textBaseLine = "top"
      this.ctx.font = "48px serif"
      
      this.ctx.fillText(text,x,y+40,w)
      
      this.ctx.restore()

      const ele = {
        id: id || this.idGen(),
        text: this.text,
        type : this.type,
        dimensions: config,
        options: (options ? options : this.options)
      }

      return ele
    }

    brush(x,y,w,h,points,options,dimensions,id){

      let config= {
        x: x,
        y: y,
        w: w,
        h: h          
      }
      
      this.type = "brush"
      const path = getPathData(points,options)

      let p = new Path2D(path)
      this.ctx.save()

      if(dimensions && (dimensions.offsetX || dimensions.offsetY)){
        this.ctx.translate(dimensions.offsetX,dimensions.offsetY)
        config.x += dimensions.offsetX
        config.y += dimensions.offsetY

      }

      // this.style(options)
      if(options){
        this.ctx.fillStyle = options.strokeStyle
      }
      

      this.ctx.fill(p)

      const ele ={
        id: id || this.idGen(),
        points: points,
        type: this.type,
        dimensions: config,
        options: (options ? options : this.options)
      }
      this.ctx.restore()
      
      return ele
    }
    eraser(x,y,w,h,points,options,dimensions,id){

      let config= {
        x: x,
        y: y,
        w: w,
        h: h          
      }
      
      this.type = "eraser"
      const path = getPathData(points,options)

      let p = new Path2D(path)
      this.ctx.save()

      if(dimensions && (dimensions.offsetX || dimensions.offsetY)){
        this.ctx.translate(dimensions.offsetX,dimensions.offsetY)
        config.x += dimensions.offsetX
        config.y += dimensions.offsetY

      }

      // this.style(options)
      if(options){
        this.ctx.fillStyle = options.strokeStyle
      }
      

      this.ctx.fill(p)

      const ele ={
        id: id || this.idGen(),
        points: points,
        type: this.type,
        dimensions: config,
        options: (options ? options : this.options)
      }
      this.ctx.restore()
      
      return ele
    }

    img(x,y,w,h,image,dimensions,id){
      if(!this.ctx || !x || !y){
        return;
      }

      let config= {
        x: x,
        y: y,
        w: w,
        h: h          
      }

      this.ctx.save()
      if(dimensions && (dimensions.offsetX || dimensions.offsetY)){
        this.ctx.translate(dimensions.offsetX,dimensions.offsetY)
        config.x += dimensions.offsetX
        config.y += dimensions.offsetY

      }

      this.type = "image"
      
      this.ctx.drawImage(image, x, y,w,h);

      this.ctx.restore()

      const ele = {
        id: id || this.idGen(),
        type: this.type,
        dimensions: config,
        image: image
      }
    
      return ele
    }

    draw(elements){
      if(!elements || elements.size <=0 ){
        return
      }

      elements.forEach((el, key) => {
        if(!el){
              return
            }
            const shape = el.type
    
            switch(shape){
              case "rectangle":
                const rect = this.rectangle(el.dimensions.x,el.dimensions.y,el.dimensions.w,el.dimensions.h,el.options,el.dimensions,el.id)
                return rect
              case "line":
                const line = this.line(el.x1,el.y1,el.x2,el.y2,el.options,el.dimensions, el.id)
                return line  
              case "ellipse":
                const ellipse = this.ellipse(el.dimensions.x,el.dimensions.y,el.dimensions.w,el.dimensions.h,el.options,el.dimensions,el.id)
                return ellipse
              case "text":
                const text = this.textBox(el.dimensions.x,el.dimensions.y,el.dimensions.w,el.dimensions.h,el.text,el.options,el.dimensions,el.id)
                return text
              case "brush":
                const brush = this.brush(el.dimensions.x, el.dimensions.y, el.dimensions.w, el.dimensions.h, el.points, el.options,el.dimensions,el.id)
                return brush
              case "eraser":
                const eraser = this.eraser(el.dimensions.x, el.dimensions.y, el.dimensions.w, el.dimensions.h, el.points, el.options,el.dimensions,el.id)
              return eraser
              case "image":
                const image = this.img(el.dimensions.x, el.dimensions.y, el.dimensions.w, el.dimensions.h, el.image,el.dimensions,el.id)
              return image
              
              default:
                return
            }


      });
    }

    move(element, x, y){

      this.ctx.save()
      this.draw([element])
      this.ctx.restore()

    }

    scale(element,x,y){
      this.ctx.save()

      this.ctx.transform(0.5,0,0,1,0,0)

      const temp = this.draw([element])

      this.ctx.restore()
    }


}