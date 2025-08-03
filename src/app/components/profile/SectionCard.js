"use client";

import { Pencil, PlusCircle } from "lucide-react";

export default function SectionCard({ title, children, hasData }) {
  return (
    <div className="bg-gray-100 p-4 rounded shadow-sm relative">
      <div className="absolute top-2 right-2">
        {hasData ? (
          <Pencil className="h-4 w-4 text-blue-600 cursor-pointer" />
        ) : (
          <PlusCircle className="h-4 w-4 text-gray-500 cursor-pointer" />
        )}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {children}
    </div>
  );
} 