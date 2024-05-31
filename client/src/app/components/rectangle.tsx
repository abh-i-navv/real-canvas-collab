"use client";
import React, { useEffect, useRef } from 'react';

interface RectangleLayer {
    x: number;
    y: number;
    width: number;
    height: number;
    fill?: string;
    stroke?: string;
    onPointerDown?: (e: React.PointerEvent<HTMLCanvasElement>) => void;
}

export const Rectangle = ({
    x,
    y,
    width,
    height,
    fill = "#000000",
    stroke = "#000000",
    onPointerDown
}: RectangleLayer) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.save();
                ctx.translate(x, y);

                // Draw the rectangle
                ctx.fillStyle = fill;
                ctx.fillRect(0, 0, width, height);

                ctx.lineWidth = 1;
                ctx.strokeStyle = stroke;
                ctx.strokeRect(0, 0, width, height);

                ctx.restore();
            }
        }
    }, [x, y, width, height, fill, stroke]);

    return (
        <canvas
            className='absolute'
            ref={canvasRef}
            width={width + x} // Canvas size must accommodate the position and dimensions
            height={height + y}
            style={{
                position: 'absolute',
                left: 0,
                top: 0,
            }}
            onPointerDown={onPointerDown}
        />
    );
}
