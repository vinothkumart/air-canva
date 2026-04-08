import React from 'react';
import { Camera, CameraOff, Download, Hand, Activity, Palette, Pause, Paintbrush, RefreshCcw } from 'lucide-react';
import { Gesture } from '../utils/gestureDetection';

interface ControlsOverlayProps {
  currentColor: string;
  currentSize: number;
  currentGesture: Gesture;
  isCameraActive: boolean;
  toggleCamera: () => void;
  downloadImage: () => void;
  availableColors: string[];
}

export const ControlsOverlay: React.FC<ControlsOverlayProps> = ({
  currentColor,
  currentSize,
  currentGesture,
  isCameraActive,
  toggleCamera,
  downloadImage,
  availableColors
}) => {
  
  const getGestureIcon = () => {
    switch(currentGesture) {
      case 'Index': return <Paintbrush className="w-5 h-5 text-blue-400" />;
      case 'OpenPalm': return <RefreshCcw className="w-5 h-5 text-red-400" />;
      case 'TwoFingers': return <Palette className="w-5 h-5 text-purple-400" />;
      case 'ThreeFingers': return <Activity className="w-5 h-5 text-green-400" />;
      case 'Fist': return <Pause className="w-5 h-5 text-yellow-400" />;
      default: return <Hand className="w-5 h-5 text-slate-400 opacity-50" />;
    }
  };

  const getGestureLabel = () => {
    switch(currentGesture) {
      case 'Index': return 'Drawing';
      case 'OpenPalm': return 'Clearing';
      case 'TwoFingers': return 'Changing Color';
      case 'ThreeFingers': return 'Changing Size';
      case 'Fist': return 'Paused';
      default: return 'Waiting...';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-20">
      <div className="flex justify-between items-start">
        {/* Status Indicator */}
        <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700/50 shadow-xl flex items-center space-x-4 pointer-events-auto transition-all">
          <div className="bg-slate-800 p-3 rounded-xl shadow-inner">
            {getGestureIcon()}
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Current State</p>
            <p className="text-white font-medium text-lg leading-tight">{getGestureLabel()}</p>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="flex flex-col space-y-3 pointer-events-auto">
          <button 
            onClick={toggleCamera}
            className={`p-4 rounded-xl shadow-lg border transition-all flex items-center justify-center
              ${isCameraActive 
                ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-600/50 text-white' 
                : 'bg-red-500/90 hover:bg-red-400 border-red-400 text-white shadow-red-500/20'}`}
            title="Toggle Camera"
          >
            {isCameraActive ? <Camera className="w-6 h-6" /> : <CameraOff className="w-6 h-6" />}
          </button>
          <button 
            onClick={downloadImage}
            className="p-4 rounded-xl shadow-lg border border-indigo-500/50 bg-indigo-600/90 hover:bg-indigo-500 text-white transition-all flex items-center justify-center"
            title="Download Canvas"
          >
            <Download className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex justify-center mb-4">
        {/* Quick Toolbar (Colors & Brush Size) */}
        <div className="bg-slate-900/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-700/50 shadow-2xl flex items-center space-x-8 pointer-events-auto">
          
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Colors</span>
            <div className="flex space-x-2">
              {availableColors.map(c => (
                <div 
                  key={c}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${c === currentColor ? 'scale-125 shadow-lg relative z-10' : 'opacity-60 hover:opacity-100 scale-90 border-transparent'} border-white`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Gest: ✌️</span>
          </div>

          <div className="w-px h-12 bg-slate-700/50"></div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Brush Size</span>
            <div className="h-8 flex items-center justify-center w-24 bg-slate-800 rounded-full px-4 overflow-hidden relative">
              {/* Progress bar style for size */}
              <div 
                className="absolute left-0 top-0 bottom-0 bg-blue-500/40 rounded-full transition-all" 
                style={{ width: `${(currentSize / 20) * 100}%` }}
              />
              <span className="text-white font-mono font-medium z-10">{currentSize}px</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Gest: 🤟</span>
          </div>

        </div>
      </div>
    </div>
  );
};
