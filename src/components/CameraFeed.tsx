import React, { forwardRef, useEffect, useState } from 'react';

interface CameraFeedProps {
  onVideoReady: (videoElement: HTMLVideoElement) => void;
  isActive: boolean;
}

export const CameraFeed = forwardRef<HTMLVideoElement, CameraFeedProps>(
  ({ onVideoReady, isActive }, ref) => {
    const [error, setError] = useState<string | null>(null);
    const internalRef = React.useRef<HTMLVideoElement>(null);

    // Sync refs
    const setRefs = React.useCallback(
      (node: HTMLVideoElement) => {
        internalRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLVideoElement>).current = node;
        }
      },
      [ref]
    );

    useEffect(() => {
      let stream: MediaStream | null = null;

      const startCamera = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user',
            },
          });
          
          if (internalRef.current) {
            internalRef.current.srcObject = stream;
            // Wait for metadata to load to ensure dimensions are set
            internalRef.current.onloadedmetadata = () => {
              internalRef.current?.play();
              onVideoReady(internalRef.current!);
            };
          }
        } catch (err: unknown) {
          if (err instanceof Error) {
            setError(err.message || 'Failed to access camera');
          } else {
            setError('Failed to access camera');
          }
        }
      };

      if (isActive) {
        startCamera();
      }

      return () => {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      };
    }, [isActive, onVideoReady]);

    if (!isActive) {
      return (
        <div className="w-full h-full bg-slate-900 flex items-center justify-center rounded-xl border border-slate-800">
          <p className="text-slate-400 font-medium">Camera is paused</p>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full flex items-center justify-center bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
        {error ? (
          <p className="text-red-500 font-medium">{error}</p>
        ) : (
          <video
            ref={setRefs}
            className="w-full h-full object-cover transform -scale-x-100"
            playsInline
            muted
          />
        )}
      </div>
    );
  }
);

CameraFeed.displayName = 'CameraFeed';
