import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function LoadingOverlay({ isVisible, message = "Processing...", type = "overlay" }) {
    const { darkMode } = useTheme();
    if (!isVisible) return null;

    // Define the outer background: Solid for full page transitions, translucent glass for modals/overlays
    const outerBg = type === "page" 
        ? "bg-gradient-to-br from-blue-600 to-purple-700"
        : (darkMode ? "bg-[#0f172a]/60 backdrop-blur-lg" : "bg-gray-900/40 backdrop-blur-md");

    return (
        <div className={`fixed inset-0 ${outerBg} flex justify-center items-center z-[9999] animate-fadeIn`}>
            <div className={`relative overflow-hidden flex flex-col items-center gap-4 ${darkMode ? 'bg-[#0f172a]/90 text-white' : 'bg-[#FAFAFA]/90 text-gray-900'} backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-2xl border ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                {/* Optional decorative top gradient line matching login */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                
                <div className="p-4 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-full">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {message}
                </span>
            </div>
        </div>
    );
}
