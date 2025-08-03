import { Pencil, PlusCircle } from "lucide-react";

export default function SectionCard({ title, children, hasData }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md relative">
      <div className="absolute top-4 right-4">
        {hasData ? (
          <Pencil className="h-5 w-5 text-blue-600 hover:text-blue-800 cursor-pointer" />
        ) : (
          <PlusCircle className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
        )}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="text-gray-800 text-sm space-y-1">
        {children}
      </div>
    </div>
  );
}
