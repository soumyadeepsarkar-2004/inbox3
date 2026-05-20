import React, { useState, Suspense } from 'react';
import Spline from '@splinetool/react-spline';
import { motion } from 'framer-motion';
import { Spinner } from './ui';

interface EmptyChatViewProps {
    onStartNewChat: () => void;
}

export const EmptyChatView: React.FC<EmptyChatViewProps> = ({ onStartNewChat }) => {
    const [splineLoaded, setSplineLoaded] = useState(false);
    const [splineError, setSplineError] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    // Track cursor movement for interactive CSS sphere fallback
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        // Calculate coordinate offsets relative to center (-25px to 25px max)
        const x = (e.clientX - rect.left - rect.width / 2) / 8;
        const y = (e.clientY - rect.top - rect.height / 2) / 8;
        setMousePos({ x, y });
    };

    const handleMouseLeave = () => {
        setMousePos({ x: 0, y: 0 });
        setIsHovered(false);
    };

    return (
        <div 
            className="h-full w-full flex flex-col justify-between items-center p-8 relative overflow-hidden select-none"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
        >
            {/* Top Sub-Header HUD */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="w-full flex justify-between items-center z-10"
            >
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#C084FC]">Network: Active</span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted">E2E Secure Channel v3.0</span>
            </motion.div>

            {/* Central Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg z-10 my-4">
                {/* Heading */}
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-3xl md:text-4xl font-extrabold text-center tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-indigo-200 drop-shadow-md mb-8"
                >
                    We are securing <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#FF6B35]">your digital identity.</span>
                </motion.h2>

                {/* Interactive Sphere Visual Container */}
                <div className="relative w-[300px] h-[300px] flex items-center justify-center">
                    {/* Glowing Background Radial Halo */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/10 to-[#FF6B35]/10 rounded-full blur-3xl scale-125 pointer-events-none" />

                    {/* Spline 3D Scene */}
                    {!splineError && (
                        <div className={`absolute inset-0 transition-opacity duration-1000 z-10 ${splineLoaded ? 'opacity-100' : 'opacity-0'}`}>
                            <Suspense fallback={null}>
                                <Spline 
                                    scene="https://prod.spline.design/kZi12hP5v72-H568/scene.splinecode" 
                                    onLoad={() => setSplineLoaded(true)}
                                    onError={() => {
                                        setSplineError(true);
                                        setSplineLoaded(false);
                                    }}
                                />
                            </Suspense>
                        </div>
                    )}

                    {/* High-Fidelity CSS Sphere Fallback (Dynamic mouse reactive + rotation + breathing animations) */}
                    {(!splineLoaded || splineError) && (
                        <motion.div 
                            animate={{ 
                                x: mousePos.x, 
                                y: mousePos.y,
                                scale: isHovered ? 1.05 : 1
                            }}
                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                            className="cyber-sphere cursor-grab active:cursor-grabbing flex items-center justify-center"
                        >
                            {/* Inner Glass Highlights and Textures */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(255,255,255,0.2)_0%,transparent_60%)]" />
                            <div className="absolute w-[80%] h-[80%] rounded-full border border-white/5 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.4)_100%)]" />
                            <div className="absolute w-[110%] h-[110%] rounded-full border border-white/5 opacity-10 animate-pulse pointer-events-none" />
                        </motion.div>
                    )}

                    {/* Loading indicator for Spline */}
                    {!splineLoaded && !splineError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-transparent z-0">
                            <Spinner size="lg" />
                        </div>
                    )}
                </div>

                {/* Sub-sphere Caption */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="mt-6 flex flex-col items-center gap-1.5"
                >
                    <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#C084FC] animate-pulse">Touch Identity</span>
                    <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-[#C084FC]/40 to-transparent" />
                </motion.div>
            </div>

            {/* Bottom Actions Area */}
            <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="w-full max-w-sm flex flex-col items-center gap-4 z-10"
            >
                <button
                    onClick={onStartNewChat}
                    className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm tracking-wide text-white bg-gradient-to-r from-[#A855F7] to-[#FF6B35] shadow-lg shadow-purple-500/10 hover:shadow-[#FF6B35]/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
                >
                    <span>New Secure Message</span>
                    <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="3"
                        className="group-hover:translate-x-0.5 transition-transform"
                    >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </button>
                <p className="text-[10px] text-muted text-center leading-relaxed">
                    Choose a contact from the sidebar or click above to initiate a <br />
                    fully decentralized on-chain communication channel.
                </p>
            </motion.div>
        </div>
    );
};

export default EmptyChatView;
