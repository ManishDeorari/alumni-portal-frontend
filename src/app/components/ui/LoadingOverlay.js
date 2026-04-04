import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function LoadingOverlay({ isVisible, message = "Processing..." }) {
    const { darkMode } = useTheme();
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[9999] animate-fadeIn">
            <div className={`flex flex-col items-center gap-4 ${darkMode ? 'bg-[#121213]' : 'bg-[#FAFAFA]'} p-8 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.6)] border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="p-4 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-full">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                </div>
                <span className={`text-sm font-black uppercase tracking-widest mt-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {message}
                </span>
            </div>
        </div>
    );
}
