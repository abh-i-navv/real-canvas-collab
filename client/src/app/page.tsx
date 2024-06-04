"use client"
import { Canvas } from "./components/canvas";

export default function Home() {
  

  return (
    <main>
      <div className="h-full w-full flex justify-center items-center overflow-y-scroll no-scrollbar overflow-hidden">
        <Canvas />
        
      </div>
    </main>
  );
}
