import { useState, useRef, useCallback, useEffect } from 'react';

// Finger landmark indices
const FINGER_TIPS = [4, 8, 12, 16, 20];
const FINGER_PIPS = [3, 6, 10, 14, 18];

export function useGesture({ onSwipeLeft, onSwipeRight, onPause }) {
  const [isActive, setIsActive] = useState(false);
  const [gesture, setGesture] = useState({
    name: 'WAITING',
    fingerCount: 0,
    confidence: 0,
  });
  const [pointer, setPointer] = useState({ x: 0, y: 0, isActive: false });
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const animationRef = useRef(null);
  const isActiveRef = useRef(false);
  const isInitializingRef = useRef(false);

  const pointerRef = useRef({ x: 0.5, y: 0.5, isActive: false });
  const pointerDropoutRef = useRef(0);
  const pointerGraceRef = useRef(0); // For keeping "READY" state during minor glitches

  // PERFORMANCE TUNING:
  const SMOOTHING = 0.5; // Balanced for premium smooth feeling
  const SNAP_THRESHOLD = 0.15;
  const MOVEMENT_THRESHOLD = 0.0005; // Slightly higher to filter out minor hand tremors

  const consecutiveFistRef = useRef(0);
  const consecutiveReadyRef = useRef(0);
  const consecutiveSwipeRef = useRef(0);

  const swipeRef = useRef({ startX: null, startTime: 0, lastSwipeTime: 0 });
  const lastFistTimeRef = useRef(0);
  const lastOpenTimeRef = useRef(0);

  const callbacksRef = useRef({ onSwipeLeft, onSwipeRight, onPause });
  const onResultsRef = useRef(null);

  useEffect(() => {
    callbacksRef.current = { onSwipeLeft, onSwipeRight, onPause };
  }, [onSwipeLeft, onSwipeRight, onPause]);

  const countFingers = useCallback((landmarks, isRightHand) => {
    const fingers = [0, 0, 0, 0, 0];
    const thumbTip = landmarks[4];
    const mcpIndex = landmarks[5];
    if (isRightHand) {
      fingers[0] = thumbTip.x < mcpIndex.x - 0.03 ? 1 : 0;
    } else {
      fingers[0] = thumbTip.x > mcpIndex.x + 0.03 ? 1 : 0;
    }
    for (let i = 1; i < 5; i++) {
      const tip = landmarks[FINGER_TIPS[i]];
      const pip = landmarks[FINGER_PIPS[i]];
      const mcp = landmarks[i * 4 + 1];
      fingers[i] = (tip.y < pip.y && tip.y < mcp.y) ? 1 : 0;
    }
    return fingers;
  }, []);

  const detectSwipe = useCallback((palmX) => {
    const now = Date.now();
    const swipe = swipeRef.current;
    if (swipe.startX === null) {
      swipe.startX = palmX;
      swipe.startTime = now;
      return null;
    }
    const dx = palmX - swipe.startX;
    const dt = now - swipe.startTime;
    if (dt > 500) { swipe.startX = palmX; swipe.startTime = now; return null; }
    if (now - swipe.lastSwipeTime < 600) return null;
    if (Math.abs(dx) > 0.15) {
      swipe.lastSwipeTime = now;
      swipe.startX = null;
      return dx > 0 ? 'right' : 'left';
    }
    return null;
  }, []);

  const onResults = useCallback((results) => {
    const now = Date.now();
    if (!isActiveRef.current) return;

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      if (pointerDropoutRef.current > 0) {
        pointerDropoutRef.current--;
      } else {
        setGesture(prev => prev.name === 'SCANNING' ? prev : { name: 'SCANNING', fingerCount: 0, confidence: 0 });
        setPointer(prev => prev.isActive ? { ...prev, isActive: false } : prev);
      }
      consecutiveFistRef.current = 0;
      consecutiveReadyRef.current = 0;
      consecutiveSwipeRef.current = 0;
      return;
    }

    const landmarks = results.multiHandLandmarks[0];
    const handedness = results.multiHandedness?.[0];
    const isRightHand = handedness?.label === 'Right';
    const confidence = handedness?.score || 0;

    const fingers = countFingers(landmarks, isRightHand);
    const totalFingers = fingers.reduce((a, b) => a + b, 0);
    const palmX = landmarks[9].x;

    // 1. FIST / PAUSE
    if (totalFingers === 0) {
      consecutiveFistRef.current++;

      // Reduce pointer grace quickly when a definitive fist is made
      if (pointerRef.current.isActive) {
        pointerGraceRef.current = Math.max(0, pointerGraceRef.current - 2);
        if (pointerGraceRef.current === 0) {
          pointerRef.current.isActive = false;
          setPointer(prev => ({ ...prev, isActive: false }));
        }
      }

      setGesture(prev => prev.name === 'PAUSED' ? prev : { name: 'PAUSED', fingerCount: 0, confidence });
      if (consecutiveFistRef.current >= 4) {
        lastFistTimeRef.current = now;
        callbacksRef.current.onPause?.();
        consecutiveFistRef.current = 0;
      }
    }
    // 2. SWIPE
    else if (totalFingers >= 4) {
      consecutiveSwipeRef.current++;
      if (consecutiveSwipeRef.current >= 4) {
        lastOpenTimeRef.current = now;
        const dir = detectSwipe(palmX);
        if (dir === 'left') {
          callbacksRef.current.onSwipeRight?.();
          setGesture({ name: 'SWIPE_RIGHT', fingerCount: totalFingers, confidence });
        } else if (dir === 'right') {
          callbacksRef.current.onSwipeLeft?.();
          setGesture({ name: 'SWIPE_LEFT', fingerCount: totalFingers, confidence });
        } else {
          setGesture(prev => prev.name === 'SWIPE_READY' ? prev : { name: 'SWIPE_READY', fingerCount: totalFingers, confidence });
        }
        pointerRef.current.isActive = false;
        setPointer(prev => ({ ...prev, isActive: false }));
      }
    }
    // 3. POINTER (Index only)
    else {
      const isPointer = fingers[1] === 1 && fingers[2] === 0 && fingers[3] === 0 && fingers[4] === 0;
      const cooldownOk = (now - lastFistTimeRef.current > 600) && (now - lastOpenTimeRef.current > 600);

      if (isPointer && cooldownOk) {
        consecutiveReadyRef.current++;
        if (consecutiveReadyRef.current >= 2) {
          const rawX = 1 - landmarks[8].x;
          const rawY = landmarks[8].y;

          // ROI Mapping (0.1 to 0.9)
          const mapCoord = (v) => Math.max(0, Math.min(1, (v - 0.1) / 0.8));
          const targetX = mapCoord(rawX);
          const targetY = mapCoord(rawY);

          // Snapping vs Smoothing
          const dist = Math.sqrt(Math.pow(targetX - pointerRef.current.x, 2) + Math.pow(targetY - pointerRef.current.y, 2));
          let nextX, nextY;

          if (dist > SNAP_THRESHOLD || !pointerRef.current.isActive) {
            // SNAP: Jump to position if transition is large or just started
            nextX = targetX;
            nextY = targetY;
          } else {
            // SMOOTH: EMA filter
            nextX = targetX * SMOOTHING + pointerRef.current.x * (1 - SMOOTHING);
            nextY = targetY * SMOOTHING + pointerRef.current.y * (1 - SMOOTHING);
          }

          const delta = Math.abs(nextX - pointerRef.current.x) + Math.abs(nextY - pointerRef.current.y);
          pointerRef.current = { x: nextX, y: nextY, isActive: true };
          pointerDropoutRef.current = 15; // Increased dropout persistence
          pointerGraceRef.current = 15;   // Increased gesture state persistence

          if (delta > MOVEMENT_THRESHOLD) {
            setPointer({ x: nextX, y: nextY, isActive: true });
          }
          setGesture(prev => prev.name === 'READY' ? prev : { name: 'READY', fingerCount: totalFingers, confidence });
        }
      } else {
        // GESTURE HYSTERESIS: Keep READY state for a few frames even if hand is lost or messy
        if (pointerGraceRef.current > 0) {
          pointerGraceRef.current--;

          // Still update gesture as READY if we are in grace period
          setGesture(prev => prev.name === 'READY' ? prev : { name: 'READY', fingerCount: totalFingers, confidence });

          // If we have landmarks but it's just 'messy', try to keep the pointer at last position
          if (pointerDropoutRef.current > 0) {
            pointerDropoutRef.current--;
          } else {
            pointerRef.current.isActive = false;
            setPointer(prev => prev.isActive ? { ...prev, isActive: false } : prev);
          }
        } else {
          setGesture(prev => prev.name === 'STABILIZING' ? prev : { name: 'STABILIZING', fingerCount: totalFingers, confidence });
          if (pointerDropoutRef.current > 0) {
            pointerDropoutRef.current--;
          } else if (pointerRef.current.isActive) {
            pointerRef.current.isActive = false;
            setPointer(prev => ({ ...prev, isActive: false }));
          }
        }
      }
    }
  }, [countFingers, detectSwipe]);

  useEffect(() => { onResultsRef.current = onResults; }, [onResults]);

  const processFrame = useCallback(async () => {
    if (!isActiveRef.current || !handsRef.current || !videoRef.current) return;
    try {
      if (videoRef.current.readyState >= 2 && !videoRef.current.paused) {
        await handsRef.current.send({ image: videoRef.current });
      }
    } catch (e) { console.error('AI Loop Error:', e); }
    if (isActiveRef.current) animationRef.current = requestAnimationFrame(processFrame);
  }, []);

  const stop = useCallback(async () => {
    isActiveRef.current = false;
    setIsActive(false);
    setGesture({ name: 'WAITING', fingerCount: 0, confidence: 0 });
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    if (handsRef.current) { try { await handsRef.current.close(); } catch (e) { } handsRef.current = null; }
  }, []);

  const start = useCallback(async () => {
    if (isInitializingRef.current || isActiveRef.current) return;
    try {
      isInitializingRef.current = true;
      setError(null);
      const Hands = window.Hands;
      if (!Hands) throw new Error('MediaPipe not loaded.');
      await stop();

      const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`
      });
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1, // BETTER ACCURACY (Standard model)
        minDetectionConfidence: 0.65,
        minTrackingConfidence: 0.65,
      });
      hands.onResults((r) => onResultsRef.current?.(r));
      handsRef.current = hands;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise(r => {
          videoRef.current.onloadedmetadata = () => videoRef.current.play().then(r).catch(r);
        });
        isActiveRef.current = true;
        setIsActive(true);
        processFrame();
      }
    } catch (e) { setError(e.message); await stop(); }
    finally { isInitializingRef.current = false; }
  }, [processFrame, stop]);

  useEffect(() => { return () => { stop(); } }, [stop]);

  return { videoRef, isActive, gesture, pointer, error, start, stop };
}
