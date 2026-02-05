import { useEffect, useRef, useState } from 'react';

interface DrivingAudioParams {
  speed: number;
  isAccelerating: boolean;
  isEnabled: boolean;
  isMuted: boolean;
}

export function useDrivingAudio({ speed, isAccelerating, isEnabled, isMuted }: DrivingAudioParams) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const engineOscillatorRef = useRef<OscillatorNode | null>(null);
  const engineGainRef = useRef<GainNode | null>(null);
  const roadOscillatorRef = useRef<OscillatorNode | null>(null);
  const roadGainRef = useRef<GainNode | null>(null);
  const isUnlockedRef = useRef(false);
  const [isReady, setIsReady] = useState(false);

  // Initialize audio context and unlock on first user interaction
  useEffect(() => {
    const unlockAudio = () => {
      if (isUnlockedRef.current) return;

      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        audioContextRef.current = ctx;

        // Resume context (required for some browsers)
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        isUnlockedRef.current = true;
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };

    // Listen for first user interaction
    const events = ['click', 'keydown', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, unlockAudio, { once: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, unlockAudio);
      });
    };
  }, []);

  // Create and manage audio nodes
  useEffect(() => {
    if (!isReady || !audioContextRef.current || !isEnabled) {
      return;
    }

    const ctx = audioContextRef.current;

    // Create engine sound (low frequency oscillator with variation)
    const engineOsc = ctx.createOscillator();
    const engineGain = ctx.createGain();
    engineOsc.type = 'sawtooth';
    engineOsc.frequency.value = 80; // Base idle frequency
    engineGain.gain.value = 0;
    engineOsc.connect(engineGain);
    engineGain.connect(ctx.destination);
    engineOsc.start();

    engineOscillatorRef.current = engineOsc;
    engineGainRef.current = engineGain;

    // Create road/rolling sound (higher frequency noise-like)
    const roadOsc = ctx.createOscillator();
    const roadGain = ctx.createGain();
    roadOsc.type = 'triangle';
    roadOsc.frequency.value = 200;
    roadGain.gain.value = 0;
    roadOsc.connect(roadGain);
    roadGain.connect(ctx.destination);
    roadOsc.start();

    roadOscillatorRef.current = roadOsc;
    roadGainRef.current = roadGain;

    return () => {
      engineOsc.stop();
      roadOsc.stop();
      engineOscillatorRef.current = null;
      engineGainRef.current = null;
      roadOscillatorRef.current = null;
      roadGainRef.current = null;
    };
  }, [isReady, isEnabled]);

  // Update audio parameters based on speed and throttle
  useEffect(() => {
    if (!engineOscillatorRef.current || !engineGainRef.current || 
        !roadOscillatorRef.current || !roadGainRef.current || !isEnabled) {
      return;
    }

    const absSpeed = Math.abs(speed);
    const normalizedSpeed = Math.min(absSpeed / 30, 1); // Normalize to 0-1

    // Engine sound: frequency and volume based on speed and acceleration
    const baseFreq = 80;
    const maxFreq = 220;
    const targetFreq = baseFreq + (maxFreq - baseFreq) * normalizedSpeed;
    
    // Smooth frequency transition
    const currentFreq = engineOscillatorRef.current.frequency.value;
    engineOscillatorRef.current.frequency.setValueAtTime(
      currentFreq + (targetFreq - currentFreq) * 0.1,
      audioContextRef.current!.currentTime
    );

    // Engine volume: louder when accelerating or at higher speeds
    const baseVolume = 0.05;
    const maxVolume = 0.15;
    const accelerationBoost = isAccelerating ? 0.05 : 0;
    const targetEngineVolume = isMuted ? 0 : (baseVolume + normalizedSpeed * maxVolume + accelerationBoost);
    
    engineGainRef.current.gain.setValueAtTime(
      targetEngineVolume,
      audioContextRef.current!.currentTime
    );

    // Road sound: volume scales with speed, near-silent when stopped
    const roadVolume = isMuted ? 0 : (normalizedSpeed * 0.08);
    roadGainRef.current.gain.setValueAtTime(
      roadVolume,
      audioContextRef.current!.currentTime
    );

    // Road frequency varies slightly with speed
    const roadFreq = 200 + normalizedSpeed * 100;
    roadOscillatorRef.current.frequency.setValueAtTime(
      roadFreq,
      audioContextRef.current!.currentTime
    );
  }, [speed, isAccelerating, isEnabled, isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return { isReady };
}
