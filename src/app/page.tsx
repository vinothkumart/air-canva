"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { CameraFeed } from "@/components/CameraFeed";
import { DrawingCanvas, DrawingCanvasRef } from "@/components/DrawingCanvas";
import { HandTracker } from "@/components/HandTracker";
import { ControlsOverlay } from "@/components/ControlsOverlay";
import { Gesture, Landmark } from "@/utils/gestureDetection";

const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#1e293b", "#a855f7"];
const SIZES = [2, 5, 10, 15, 20];
const ACTION_DEBOUNCE_MS = 800;

export default function Home() {
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [dimensions, setDimensions] = useState({ width: 1280, height: 720 });
  const [currentGesture, setCurrentGesture] = useState<Gesture>("None");
  
  const [colorIndex, setColorIndex] = useState(0);
  const [sizeIndex, setSizeIndex] = useState(2); // 10px default
  
  const lastActionTime = useRef<number>(0);

  // Measure container for canvas scaling
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    window.addEventListener("resize", updateDimensions);
    updateDimensions();
    
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const handleGesture = useCallback((gesture: Gesture, indexTip: Landmark | null) => {
    setCurrentGesture(gesture);
    const now = performance.now();

    switch (gesture) {
      case "Index":
        if (indexTip) {
          canvasRef.current?.drawPoint(
            indexTip.x, 
            indexTip.y, 
            COLORS[colorIndex], 
            SIZES[sizeIndex]
          );
        }
        break;
      case "OpenPalm":
        if (now - lastActionTime.current > ACTION_DEBOUNCE_MS) {
          canvasRef.current?.clearCanvas();
          lastActionTime.current = now;
        }
        break;
      case "Fist":
        canvasRef.current?.stopDrawing();
        break;
      case "TwoFingers":
        canvasRef.current?.stopDrawing();
        if (now - lastActionTime.current > ACTION_DEBOUNCE_MS) {
          setColorIndex((prev) => (prev + 1) % COLORS.length);
          lastActionTime.current = now;
        }
        break;
      case "ThreeFingers":
        canvasRef.current?.stopDrawing();
        if (now - lastActionTime.current > ACTION_DEBOUNCE_MS) {
          setSizeIndex((prev) => (prev + 1) % SIZES.length);
          lastActionTime.current = now;
        }
        break;
      case "None":
      default:
        canvasRef.current?.stopDrawing();
        break;
    }
  }, [colorIndex, sizeIndex]);

  const toggleCamera = () => {
    setIsCameraActive(!isCameraActive);
    if (isCameraActive) {
      canvasRef.current?.stopDrawing();
      setCurrentGesture("None");
    }
  };

  const downloadImage = () => {
    const dataUrl = canvasRef.current?.getCanvasImage();
    if (dataUrl) {
      const link = document.createElement("a");
      link.download = "hand-drawing.png";
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-7xl mx-auto space-y-4">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Air Drawing
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto font-medium">
            Draw in thin air using hand gestures. Powered by Next.js, MediaPipe, and Tailwind CSS.
          </p>
        </div>

        {/* Main Interface */}
        <div 
          ref={containerRef}
          className="relative w-full aspect-video max-h-[75vh] bg-black rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10"
        >
          <CameraFeed 
            isActive={isCameraActive} 
            onVideoReady={setVideoElement} 
          />
          
          <DrawingCanvas 
            ref={canvasRef}
            width={dimensions.width}
            height={dimensions.height}
          />
          
          <HandTracker 
            isActive={isCameraActive} 
            videoElement={videoElement} 
            onGesture={handleGesture} 
          />
          
          <ControlsOverlay 
            currentColor={COLORS[colorIndex]}
            currentSize={SIZES[sizeIndex]}
            currentGesture={currentGesture}
            isCameraActive={isCameraActive}
            toggleCamera={toggleCamera}
            downloadImage={downloadImage}
            availableColors={COLORS}
          />
        </div>

        {/* Gesture Guide */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4 text-sm">
          <div className="bg-slate-900 border border-slate-800/60 shadow-lg rounded-xl p-3 flex items-center space-x-3 transition-transform hover:scale-105">
            <span className="text-2xl drop-shadow-md">✋</span>
            <span className="text-slate-300 font-medium">Clear Canvas</span>
          </div>
          <div className="bg-slate-900 border border-slate-800/60 shadow-lg rounded-xl p-3 flex items-center space-x-3 transition-transform hover:scale-105">
            <span className="text-2xl drop-shadow-md">☝️</span>
            <span className="text-slate-300 font-medium">Draw</span>
          </div>
          <div className="bg-slate-900 border border-slate-800/60 shadow-lg rounded-xl p-3 flex items-center space-x-3 transition-transform hover:scale-105">
            <span className="text-2xl drop-shadow-md">✌️</span>
            <span className="text-slate-300 font-medium">Change Color</span>
          </div>
          <div className="bg-slate-900 border border-slate-800/60 shadow-lg rounded-xl p-3 flex items-center space-x-3 transition-transform hover:scale-105">
            <span className="text-2xl drop-shadow-md">🤟</span>
            <span className="text-slate-300 font-medium">Brush Size</span>
          </div>
          <div className="bg-slate-900 border border-slate-800/60 shadow-lg rounded-xl p-3 flex items-center space-x-3 md:col-span-1 col-span-2 justify-center md:justify-start transition-transform hover:scale-105">
            <span className="text-2xl drop-shadow-md">✊</span>
            <span className="text-slate-300 font-medium">Pause</span>
          </div>
        </div>
      </div>
    </main>
  );
}
