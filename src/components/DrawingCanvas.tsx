import React, { forwardRef, useImperativeHandle, useRef } from 'react';

export interface DrawingCanvasRef {
  drawPoint: (x: number, y: number, color: string, size: number) => void;
  clearCanvas: () => void;
  stopDrawing: () => void;
  getCanvasImage: () => string | null;
}

interface DrawingCanvasProps {
  width: number;
  height: number;
}

export const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  ({ width, height }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const lastPoint = useRef<{ x: number; y: number } | null>(null);

    useImperativeHandle(ref, () => ({
      drawPoint: (x: number, y: number, color: string, size: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (!contextRef.current) {
          contextRef.current = canvas.getContext('2d');
          if (contextRef.current) {
            contextRef.current.lineCap = 'round';
            contextRef.current.lineJoin = 'round';
          }
        }

        const ctx = contextRef.current;
        if (!ctx) return;

        ctx.strokeStyle = color;
        ctx.lineWidth = size;

        // X and Y are normalized [0, 1]. Multiply by canvas dimensions.
        const pixelX = x * width;
        const pixelY = y * height;

        ctx.beginPath();
        if (lastPoint.current) {
          ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
        } else {
          ctx.moveTo(pixelX, pixelY); // Fallback to just a dot
        }
        ctx.lineTo(pixelX, pixelY);
        ctx.stroke();

        lastPoint.current = { x: pixelX, y: pixelY };
      },
      clearCanvas: () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx && canvas) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        lastPoint.current = null;
      },
      stopDrawing: () => {
        // Break the current line segment
        lastPoint.current = null;
      },
      getCanvasImage: () => {
        return canvasRef.current?.toDataURL('image/png') || null;
      }
    }));

    // Re-adjust canvas internal resolution to match container size
    React.useEffect(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
      }
      
      // Keep drawn data if resized? For simplicity, we just set the res
    }, [width, height]);

    return (
      <canvas
        ref={canvasRef}
        // Applying -scale-x-100 mirrors the canvas visually, aligning it with the mirrored camera.
        className="absolute top-0 left-0 w-full h-full pointer-events-none transform -scale-x-100"
        style={{ zIndex: 10 }}
      />
    );
  }
);

DrawingCanvas.displayName = 'DrawingCanvas';
