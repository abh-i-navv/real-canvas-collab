"use client"
import { useEffect, useState } from "react";
import { Canvas } from "../components/canvas";
import { io } from "socket.io-client";
import { MousePointer2 } from "lucide-react";
import { useParams } from "next/navigation";
const socket = io("http://localhost:5000")

export default function Home() {
  const {boardId} = useParams()
  socket.emit("join-room", boardId)

  const [cursorPositions, setCursorPositions] = useState<Map<string,any>>();
  const map = new Map<string,any>()

  useEffect(() => {
    socket.on('cursor-data', (data) => {
      map.set(data.id,data)
      setCursorPositions(new Map(map))
    });

    socket.on('cursor-leave', (data) => {
      map.delete(data.id)
      setCursorPositions(new Map(map))      
    });

    return () => {
      socket.off('cursor-data');
      socket.off('cursor-leave');
    };
  }, []);

  const onMouseMove = (e:any) => {
    const data = { x: e.clientX, y: e.clientY, id: socket.id, };
    socket.emit('cursor-presence', {data, boardId});
  }; 

  const onMouseLeave = () => {
    socket.emit('cursor-leave', {boardId});
  };

  return (
    <main>
      <div className="h-full w-full flex justify-center items-center overflow-y-scroll no-scrollbar overflow-hidden" onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
        <Canvas socket={socket} boardId={boardId}/>

        {cursorPositions && 
          Array.from(cursorPositions.values()).map((cursor,index) => (
            <div 
              key={cursor.id}
              style={{
                position: 'absolute',
                top: cursor.y,
                left: cursor.x,
                pointerEvents: 'none'
            }}
            >
              {cursor.id !== socket.id &&
                <MousePointer2 className=" text-purple-500"/>}
            </div>
          ))
        }
      </div>
    </main>
  );
}
