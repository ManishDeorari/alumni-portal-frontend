"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import HybridInput from "../ui/HybridInput";
import { useTheme } from "@/context/ThemeContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const COURSE_OPTIONS = ["B.Tech", "M.Tech", "MBA", "BCA", "MCA"];
const currentYearForDropdown = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: currentYearForDropdown + 5 - 2000 + 1 }, (_, i) => String(2000 + i));

export default function AlumniExport() {
    const { darkMode } = useTheme();
    const [alumni, setAlumni] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({
        course: "",
        year: "",
        industry: ""
    });

    const getToken = () => localStorage.getItem("token");

    const handleSearch = async () => {
        setLoading(true);
        try {
            let url = `${API}/api/admin/export-alumni?query=${searchQuery}`;
            if (filters.course) url += `&course=${filters.course}`;
            if (filters.year) url += `&year=${filters.year}`;
            if (filters.industry) url += `&industry=${filters.industry}`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Search failed");
            setAlumni(data || []);
            if (data.length === 0) toast.error("No alumni found with these filters");
            else toast.success(`Found ${data.length} alumni`);
        } catch (err) {
            console.error("Search error:", err);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const downloadExcel = async () => {
        if (alumni.length === 0) return;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Alumni Data");

        // Row 1: Group Headers
        const r1 = [
            "", "", "", "", "", "ADDRESS", "", "", "EDUCATION",
            ...Array(17).fill(""), // Spanning Education
            "EXPERIENCE"
        ];

        // Row 2: Sub-Groups
        const r2 = [
            "", "", "", "", "", "", "", "", "High School", "", "", "Intermediate", "", "", "Undergraduate", "", "", "", "", "", "Postgraduate", "", "", "", "", "", ""
        ];

        // Row 3: Column Names
        const r3 = [
            "S.No", "Enrollment No", "Name", "Email", "Phone",
            "City", "State", "Country",
            "School Name", "Year", "Grades/%",
            "School Name", "Year", "Grades/%",
            "College Name", "Campus", "Course", "Start Year", "End Year", "Grades/%",
            "College Name", "Campus", "Course", "Start Year", "End Year", "Grades/%",
            "Recent Role", "Company", "Duration"
        ];

        worksheet.addRow(r1);
        worksheet.addRow(r2);
        worksheet.addRow(r3);

        const MANDATORY_DEGREES = [
            "High School (Secondary - Class 10)",
            "Intermediate (Higher Secondary - Class 11-12)",
            "Undergraduate (Bachelor's Degree)",
            "Postgraduate (Master's Degree)"
        ];

        const formatPhone = (phone) => {
            if (!phone || phone === "N/A") return "N/A";
            let cleaned = String(phone).replace(/\D/g, "");
            if (cleaned.startsWith("91") && cleaned.length === 12) {
                return `+91 ${cleaned.substring(2)}`;
            }
            if (cleaned.length === 10) {
                return `+91 ${cleaned}`;
            }
            return phone.startsWith("+") ? phone : `+${cleaned}`;
        };

        alumni.forEach((u, index) => {
            const getEdu = (degreeName) => (u.education || []).find(e => e.degree === degreeName) || {};

            const hs = getEdu(MANDATORY_DEGREES[0]);
            const inter = getEdu(MANDATORY_DEGREES[1]);
            const ug = getEdu(MANDATORY_DEGREES[2]);
            const pg = getEdu(MANDATORY_DEGREES[3]);

            let recentExp = (u.experience || []).find(e => !e.endDate || e.endDate.toLowerCase().includes("present") || e.endDate.toLowerCase().includes("current"));
            if (!recentExp && u.experience?.length > 0) {
                recentExp = [...u.experience].sort((a, b) => {
                    const yearA = parseInt(a.endDate?.split(" ").pop()) || 0;
                    const yearB = parseInt(b.endDate?.split(" ").pop()) || 0;
                    return yearB - yearA;
                })[0];
            }
            recentExp = recentExp || {};

            const addrParts = (u.address || "").split(",").map(p => p.trim());
            const city = addrParts[0] || "N/A";
            const state = addrParts[1] || "N/A";
            const country = addrParts[2] || "N/A";

            worksheet.addRow([
                index + 1,
                u.enrollmentNumber || "N/A",
                u.name,
                u.email,
                formatPhone(u.phone),
                city, state, country,
                hs.institution || "NA", hs.endDate?.split(" ").pop() || "NA", hs.grade || "NA",
                inter.institution || "NA", inter.endDate?.split(" ").pop() || "NA", inter.grade || "NA",
                ug.institution || "NA", ug.campus || "NA", ug.fieldOfStudy || "NA", ug.startDate?.split(" ").pop() || "NA", ug.endDate?.split(" ").pop() || "NA", ug.grade || "NA",
                pg.institution || "NA", pg.campus || "NA", pg.fieldOfStudy || "NA", pg.startDate?.split(" ").pop() || "NA", pg.endDate?.split(" ").pop() || "NA", pg.grade || "NA",
                recentExp.title || "NA", recentExp.company || "NA", recentExp.startDate && recentExp.endDate ? `${recentExp.startDate} - ${recentExp.endDate}` : "NA"
            ]);
        });

        // Styling
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                // Center alignment for all cells
                cell.alignment = { vertical: 'middle', horizontal: 'center' };

                // Bold style for headers (Rows 1, 2, 3)
                if (rowNumber <= 3) {
                    cell.font = { bold: true };
                }
            });
        });

        // Set column widths for better readability
        worksheet.columns.forEach(column => {
            column.width = 15;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, `alumni_data_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success("Excel File Downloaded Successfully");
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Search & Filters */}
            <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl shadow-2xl">
                <section className={`${darkMode ? "bg-black" : "bg-white"} p-8 rounded-[calc(1.5rem-1px)] space-y-8`}>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 p-[1px] bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl">
                            <div className="relative h-full">
                                <input
                                    type="text"
                                    placeholder="Search by name, email, enrollment..."
                                    value={searchQuery}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`w-full pl-12 pr-4 py-3.5 ${darkMode ? "bg-black text-white placeholder-white/30" : "bg-white text-black"} rounded-2xl outline-none transition-all font-medium`}
                                />
                                <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? "text-blue-400" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>
                        <button
                            onClick={handleSearch}
                            className="px-10 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black transition-all shadow-lg active:scale-95"
                        >
                            Search Alumni
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5 z-[60]">
                            <label className={`text-[10px] uppercase tracking-widest ${darkMode ? "text-white" : "text-slate-900"} ml-2 font-black`}>Course</label>
                            <div className="p-[1px] bg-gradient-to-r from-blue-400/50 to-purple-400/50 rounded-xl relative">
                                <HybridInput
                                    value={filters.course}
                                    onChange={(val) => setFilters({ ...filters, course: val })}
                                    options={COURSE_OPTIONS}
                                    placeholder="All Courses"
                                    uppercase={true}
                                    placement="top"
                                    className={`w-full px-4 py-4 ${darkMode ? "bg-black text-white" : "bg-white text-black border border-gray-200"} rounded-xl text-[10px] uppercase tracking-widest outline-none font-bold`}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5 relative">
                            <label className={`text-[10px] uppercase tracking-widest ${darkMode ? "text-white" : "text-slate-900"} ml-2 font-black`}>Graduation / Start Year</label>
                            <div className="p-[1px] bg-gradient-to-r from-blue-400/50 to-purple-400/50 rounded-xl relative">
                                <select
                                    value={filters.year}
                                    onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                    className={`w-full px-4 py-[15px] ${darkMode ? "bg-black text-white" : "bg-white text-black border border-gray-200"} rounded-xl text-[10px] uppercase tracking-widest outline-none font-bold appearance-none cursor-pointer`}
                                >
                                    <option value="">All Years</option>
                                    {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                                <svg className={`w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${darkMode ? "text-blue-400" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                        <div className="space-y-1.5 font-bold">
                            <label className={`text-[10px] uppercase tracking-widest ${darkMode ? "text-white" : "text-slate-900"} ml-2 font-black`}>Industry</label>
                            <div className="p-[1px] bg-gradient-to-r from-blue-400/50 to-purple-400/50 rounded-xl">
                                <input
                                    type="text"
                                    placeholder="e.g. IT, Finance"
                                    value={filters.industry}
                                    onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                                    className={`w-full px-4 py-3.5 ${darkMode ? "bg-black text-white" : "bg-white text-black border border-gray-200"} rounded-xl outline-none text-xs`}
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Results & Export */}
            {alumni.length > 0 && (
                <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl shadow-2xl overflow-hidden">
                    <section className={`${darkMode ? "bg-black" : "bg-white"} p-8 rounded-[calc(1.5rem-1px)] space-y-6`}>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-2 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.4)]"></div>
                                <h2 className={`text-2xl font-black ${darkMode ? "text-white" : "text-slate-900"} tracking-tight`}>Export Preview ({alumni.length})</h2>
                            </div>
                            <button
                                onClick={downloadExcel}
                                className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black transition-all shadow-xl flex items-center gap-2 active:scale-95"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Download Excel
                            </button>
                        </div>

                        <div className="p-[1px] bg-gradient-to-r from-blue-400/50 via-purple-400/50 to-pink-400/50 rounded-2xl overflow-hidden shadow-xl">
                            <div className={`overflow-x-auto custom-scrollbar ${darkMode ? "bg-black" : "bg-white"}`}>
                                <table className="w-full">
                                    <thead>
                                        <tr className={`${darkMode ? "text-blue-400 border-white/10 bg-white/5" : "text-slate-900 border-gray-100 bg-gray-50"} text-[10px] uppercase font-black tracking-[0.2em] border-b`}>
                                            <th className="py-4 px-6 text-left">Alumni</th>
                                            <th className="py-4 px-6 text-left">Course &amp; Year</th>
                                            <th className="py-4 px-6 text-left">Location</th>
                                            <th className="py-4 px-6 text-left">Industry</th>
                                        </tr>
                                    </thead>
                                    {/* Gradient Separator Line */}
                                    <tr className="h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-sm"><td colSpan="4"></td></tr>
                                    <tbody className={`${darkMode ? "divide-white/5" : "divide-gray-100"}`}>
                                        {alumni.slice(0, 10).map((u) => (
                                            <tr key={u._id} className={`transition-all ${darkMode ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                                                <td className="py-4 px-6">
                                                    <div>
                                                        <p className={`font-extrabold ${darkMode ? "text-white" : "text-slate-900"}`}>{u.name}</p>
                                                        <p className={darkMode ? "text-blue-100 text-xs" : "text-slate-600 text-xs"}>{u.email}</p>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`text-xs font-black ${darkMode ? "text-blue-300 bg-white/5 border-white/10" : "text-slate-900 bg-gray-100 border-gray-200"} px-3 py-1.5 rounded-lg border`}>
                                                        {u.course} ({u.year})
                                                    </span>
                                                </td>
                                                <td className={`py-4 px-6 text-xs font-medium ${darkMode ? "text-white" : "text-slate-900"}`}>{u.address || "N/A"}</td>
                                                <td className="py-4 px-6">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-400/10 px-2.5 py-1 rounded-full border border-blue-400/20">
                                                        {u.workProfile?.industry || "N/A"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {alumni.length > 10 && (
                                    <div className={`p-4 text-center border-t ${darkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"}`}>
                                        <p className={`text-xs ${darkMode ? "text-blue-400" : "text-blue-600"} font-black uppercase tracking-widest italic`}>
                                            Showing first 10 results. Click Download to get all {alumni.length} entries.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    <p className={`${darkMode ? "text-blue-100/40" : "text-gray-400"} font-black uppercase tracking-widest text-xs`}>Searching database...</p>
                </div>
            )}
        </div>
    );
}
