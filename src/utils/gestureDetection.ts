export type Gesture = 'OpenPalm' | 'Index' | 'TwoFingers' | 'ThreeFingers' | 'Fist' | 'None';

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export function detectGesture(landmarks: Landmark[]): Gesture {
  if (!landmarks || landmarks.length < 21) return 'None';

  // We check extension by comparing distance from wrist to tip vs wrist to PIP
  const isThumbExtended = () => {
    const pinkyMcp = landmarks[17];
    const thumbTip = landmarks[4];
    const thumbIp = landmarks[3];
    
    // For the thumb, calculate distance from pinky mcp
    // It's a simplistic heuristic for "is the thumb sticking out"
    const distTip = Math.hypot(pinkyMcp.x - thumbTip.x, pinkyMcp.y - thumbTip.y);
    const distIp = Math.hypot(pinkyMcp.x - thumbIp.x, pinkyMcp.y - thumbIp.y);
    return distTip > distIp * 1.1; 
  };

  const isFingerExtended = (tipIdx: number, pipIdx: number) => {
    const wrist = landmarks[0];
    const tip = landmarks[tipIdx];
    const pip = landmarks[pipIdx];

    const distTip = Math.hypot(wrist.x - tip.x, wrist.y - tip.y, wrist.z - tip.z);
    const distPip = Math.hypot(wrist.x - pip.x, wrist.y - pip.y, wrist.z - pip.z);
    
    return distTip > distPip * 1.1; // Add a small margin
  };

  const extendedFingers = {
    thumb: isThumbExtended(),
    index: isFingerExtended(8, 6),
    middle: isFingerExtended(12, 10),
    ring: isFingerExtended(16, 14),
    pinky: isFingerExtended(20, 18),
  };

  const extendedCount = [
    extendedFingers.index, 
    extendedFingers.middle, 
    extendedFingers.ring, 
    extendedFingers.pinky
  ].filter(Boolean).length;

  if (extendedCount >= 3 && extendedFingers.thumb) {
    return 'OpenPalm'; // ✋ Open Palm -> Clear canvas
  } else if (extendedFingers.index && !extendedFingers.middle && !extendedFingers.ring && !extendedFingers.pinky) {
    return 'Index'; // ☝️ Index finger only -> Draw mode
  } else if (extendedFingers.index && extendedFingers.middle && !extendedFingers.ring && !extendedFingers.pinky) {
    return 'TwoFingers'; // ✌️ Two fingers -> Change color
  } else if (extendedFingers.index && extendedFingers.middle && extendedFingers.ring && !extendedFingers.pinky) {
    return 'ThreeFingers'; // 🤟 Three fingers -> Change brush size
  } else if (extendedCount === 0 && !extendedFingers.thumb) {
    return 'Fist'; // ✊ Fist -> Pause drawing
  }

  return 'None';
}
