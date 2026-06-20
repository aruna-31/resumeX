import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './Scene';
import { OverlayUI } from './OverlayUI';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Landing3D = () => {
    const [isReady, setIsReady] = useState(false);
    const [hasWebGL, setHasWebGL] = useState(true);

    // Simulate asset loading for smoother intro
    useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    // Graceful fallback for environments without WebGL (e.g. embedded browsers)
    useEffect(() => {
        try {
            const canvas = document.createElement('canvas');
            const gl =
                canvas.getContext('webgl') ||
                canvas.getContext('experimental-webgl') ||
                canvas.getContext('webgl2');
            setHasWebGL(!!gl);
        } catch {
            setHasWebGL(false);
        }
    }, []);

    return (
        <div className="h-screen w-full bg-[#020617] relative overflow-hidden">
            {/* Loading Curtain */}
            <AnimatePresence>
                {!isReady && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-[#020617]"
                    >
                        <Loader2 className="text-blue-500 animate-spin" size={32} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 3D Scene Layer */}
            {hasWebGL && (
                <div className={`absolute inset-0 transition-opacity duration-1000 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
                    <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 45 }}>
                        <Suspense fallback={null}>
                            <Scene />
                        </Suspense>
                    </Canvas>
                </div>
            )}

            {!hasWebGL && (
                <div className={`absolute inset-0 transition-opacity duration-1000 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0b1226] via-[#020617] to-black" />
                    <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-blue-600/10 blur-[120px]" />
                    <div className="absolute -bottom-48 -right-40 h-[560px] w-[560px] rounded-full bg-indigo-600/10 blur-[140px]" />
                </div>
            )}

            {/* HTML Overlay Layer */}
            {isReady && <OverlayUI />}

            {/* Vignette & Grain */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/40 z-0" />
        </div>
    );
};
