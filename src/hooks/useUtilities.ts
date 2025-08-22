import { useState, useEffect, useRef } from 'react';
import { debounce } from '../utils';

export interface ViewportHookReturn {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
}

export const useViewport = (): ViewportHookReturn => {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const debouncedSetViewport = useRef(
    debounce((...args: unknown[]) => {
      const [width, height] = args as [number, number];
      setViewport({ width, height });
    }, 100)
  ).current;

  useEffect(() => {
    const handleResize = () => {
      debouncedSetViewport(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [debouncedSetViewport]);

  const isMobile = viewport.width <= 768;
  const isTablet = viewport.width > 768 && viewport.width <= 1024;
  const isDesktop = viewport.width > 1024;
  const orientation = viewport.width > viewport.height ? 'landscape' : 'portrait';

  return {
    width: viewport.width,
    height: viewport.height,
    isMobile,
    isTablet,
    isDesktop,
    orientation,
  };
};

export interface KeyboardHookReturn {
  isPressed: (key: string) => boolean;
  pressedKeys: Set<string>;
}

export const useKeyboard = (): KeyboardHookReturn => {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setPressedKeys(prev => new Set(prev).add(event.code));
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      setPressedKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(event.code);
        return newKeys;
      });
    };

    const handleBlur = () => {
      setPressedKeys(new Set());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  const isPressed = (key: string) => pressedKeys.has(key);

  return { isPressed, pressedKeys };
};

export interface AnimationFrameHookReturn {
  start: () => void;
  stop: () => void;
  isRunning: boolean;
}

export const useAnimationFrame = (callback: (deltaTime: number) => void): AnimationFrameHookReturn => {
  const [isRunning, setIsRunning] = useState(false);
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);

  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  const start = () => {
    if (!isRunning) {
      setIsRunning(true);
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  const stop = () => {
    if (isRunning && requestRef.current) {
      setIsRunning(false);
      cancelAnimationFrame(requestRef.current);
      previousTimeRef.current = undefined;
    }
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return { start, stop, isRunning };
};
