import React, { useRef, useEffect } from 'react';
import AIAvatar from './AIAvatar';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import { cn } from "../../utils/cn";
import { Mic, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Inner component to render and animate the model
function Model({ url, state, audioRef }) {
  const { nodes, scene } = useGLTF(url);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);

  // Set up audio analyzer
  useEffect(() => {
    if (!audioRef?.current) return;
    
    // We only want to set this up once per audio element
    if (!audioContextRef.current) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
        
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      } catch (e) {
        console.warn("AudioContext setup failed:", e);
      }
    }

    // Resume AudioContext if it was suspended (browser policy)
    const handlePlay = () => {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };
    
    const audioEl = audioRef.current;
    audioEl.addEventListener('play', handlePlay);
    
    return () => {
      audioEl.removeEventListener('play', handlePlay);
    };
  }, [audioRef]);

  useFrame((stateObj) => {
    let volume = 0;
    if (state === "speaking" && analyserRef.current && dataArrayRef.current) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      // Average volume of lower frequencies (voice)
      let sum = 0;
      for (let i = 0; i < 20; i++) sum += dataArrayRef.current[i];
      volume = sum / 20 / 255; 
      // amplify slightly
      volume = Math.min(1.0, volume * 1.5);
    }

    // Apply volume to morph targets (assuming Ready Player Me structure)
    if (nodes.Wolf3D_Head && nodes.Wolf3D_Head.morphTargetDictionary) {
      const jawOpenIndex = nodes.Wolf3D_Head.morphTargetDictionary['jawOpen'];
      if (jawOpenIndex !== undefined) {
        // Smooth out the animation with lerp
        const current = nodes.Wolf3D_Head.morphTargetInfluences[jawOpenIndex];
        nodes.Wolf3D_Head.morphTargetInfluences[jawOpenIndex] = current + (volume - current) * 0.4;
      }
    }

    // Apply to teeth as well if available
    if (nodes.Wolf3D_Teeth && nodes.Wolf3D_Teeth.morphTargetDictionary) {
      const jawOpenTeeth = nodes.Wolf3D_Teeth.morphTargetDictionary['jawOpen'];
      if (jawOpenTeeth !== undefined) {
        const currentTeeth = nodes.Wolf3D_Teeth.morphTargetInfluences[jawOpenTeeth];
        nodes.Wolf3D_Teeth.morphTargetInfluences[jawOpenTeeth] = currentTeeth + (volume - currentTeeth) * 0.4;
      }
    }
    
    // Idle animation (breathing / subtle movement)
    if (scene) {
      const time = stateObj.clock.getElapsedTime();
      scene.rotation.y = Math.sin(time * 0.5) * 0.05;
      scene.rotation.x = Math.cos(time * 0.5) * 0.02;
    }
  });

  return (
    <primitive 
      object={scene} 
      position={[0, -5.5, 2]} 
      scale={3.5}
    />
  );
}


class AvatarErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Avatar loading error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback to the 2D orb if 3D model fails to load due to network/CORS
      return <AIAvatar conversationState={this.props.conversationState} className="w-full h-full shadow-none border-none ring-0" />;
    }
    return this.props.children;
  }
}

export default function AIAvatar3D({ state, className, audioRef }) {
  // Use the local model provided by the user
  const avatarUrl = "/models/dezyne_3d-sad-373.glb";

  // Map state back to conversationState for the fallback orb
  const conversationState = state === 'speaking' ? 'speaking' : state === 'listening' ? 'listening' : state === 'thinking' ? 'thinking' : 'idle';

  return (
    <div
      className={cn(
        "relative w-48 h-48 sm:w-56 sm:h-56 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-[32px] overflow-hidden shadow-2xl bg-[#111118] border border-[var(--border)] flex items-center justify-center group transition-all duration-500",
        state === "speaking" && "ring-2 ring-[var(--primary)] ring-offset-4 ring-offset-[var(--background)] shadow-[0_0_40px_rgba(99,102,241,0.2)]",
        className
      )}
    >
      <div className="absolute inset-0 z-10">
        <AvatarErrorBoundary conversationState={conversationState}>
          <Canvas camera={{ position: [0, 0, 4], fov: 40 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[2, 2, 2]} intensity={1.2} />
            <directionalLight position={[-2, 1, 2]} intensity={0.5} />
            <Environment preset="city" />
            <React.Suspense fallback={null}>
              <Model url={avatarUrl} state={state} audioRef={audioRef} />
            </React.Suspense>
          </Canvas>
        </AvatarErrorBoundary>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 z-20 pointer-events-none" />

      {/* State Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center w-full px-8 z-30">
        <AnimatePresence mode="wait">
          {state === "listening" && (
            <motion.div
              key="listening"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white"
            >
              <div className="relative flex items-center justify-center w-6 h-6">
                <div className="absolute w-full h-full bg-[var(--color-success)] rounded-full animate-ping opacity-20" />
                <Mic className="w-4 h-4 text-[var(--color-success)]" />
              </div>
              <span className="text-sm font-medium tracking-wide">Listening...</span>
            </motion.div>
          )}

          {state === "thinking" && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white"
            >
              <Loader2 className="w-4 h-4 text-[var(--primary)] animate-spin" />
              <span className="text-sm font-medium tracking-wide">Processing...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
