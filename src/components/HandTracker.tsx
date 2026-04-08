import React, { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver, Landmark as MPLandmark } from '@mediapipe/tasks-vision';
import { detectGesture, Gesture, Landmark } from '../utils/gestureDetection';

interface HandTrackerProps {
  videoElement: HTMLVideoElement | null;
  isActive: boolean;
  onGesture: (gesture: Gesture, indexTip: Landmark | null) => void;
}

export const HandTracker: React.FC<HandTrackerProps> = ({ videoElement, isActive, onGesture }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const lastVideoTime = useRef<number>(-1);

  // Initialize MediaPipe HandLandmarker
  useEffect(() => {
    let active = true;

    const initLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
        });

        if (active) {
          landmarkerRef.current = landmarker;
          setIsLoaded(true);
          console.log('Hand landmarker loaded successfully');
        }
      } catch (error) {
        console.error('Error loading HandLandmarker:', error);
      }
    };

    initLandmarker();

    return () => {
      active = false;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
    };
  }, []);

  // Frame processing loop
  useEffect(() => {
    if (!isActive || !isLoaded || !videoElement || !landmarkerRef.current) {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      return;
    }

    const processFrame = () => {
      if (videoElement.readyState >= 2) {
        const startTimeMs = performance.now();
        if (videoElement.currentTime !== lastVideoTime.current) {
          lastVideoTime.current = videoElement.currentTime;
          
          try {
            const results = landmarkerRef.current!.detectForVideo(videoElement, startTimeMs);
            
            if (results.landmarks && results.landmarks.length > 0) {
              const landmarks = results.landmarks[0] as MPLandmark[];
              const gesture = detectGesture(landmarks);
              
              const indexTip = landmarks[8]; // Index finger tip
              onGesture(gesture, indexTip);
            } else {
              onGesture('None', null);
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
      requestRef.current = requestAnimationFrame(processFrame);
    };

    requestRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isActive, isLoaded, videoElement, onGesture]);

  return <></>; // Purely logic component
};
