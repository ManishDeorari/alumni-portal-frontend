import { Pencil, PlusCircle } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const SectionCard = ({ title, children, onEdit, isPublicView, hasData }) => {
  const { darkMode } = useTheme();

  return (
    <div className={`relative p-[2px] bg-gradient-to-r ${darkMode ? 'from-blue-600 via-purple-500 to-pink-500' : 'from-blue-400 via-purple-400 to-pink-400'} rounded-2xl shadow-xl transition-all`}>
      <div className={`p-6 rounded-[calc(1rem-1px)] h-full transition-colors duration-500 ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
        {!isPublicView && onEdit && (
          <div className="absolute top-6 right-6">
            {hasData ? (
              <Pencil
                className={`h-5 w-5 cursor-pointer transition-colors ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                onClick={onEdit}
              />
            ) : (
              <PlusCircle
                className={`h-5 w-5 cursor-pointer transition-colors ${darkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}
                onClick={onEdit}
              />
            )}
          </div>
        )}
        <h3 className={`text-xl font-black mb-4 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        <div className={`text-sm space-y-1 transition-colors ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          {children}
        </div>
      </div>
    </div >
  );
};

export default SectionCard;
