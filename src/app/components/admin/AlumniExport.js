"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AlumniExport() {
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

    const downloadCSV = () => {
        if (alumni.length === 0) return;

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

        const MANDATORY_DEGREES = [
            "High School (Secondary - Class 10)",
            "Intermediate (Higher Secondary - Class 11-12)",
            "Undergraduate (Bachelor's Degree)",
            "Postgraduate (Master's Degree)"
        ];

        // CSV Data Rows
        const rows = alumni.map((u, index) => {
            const getEdu = (degreeName) => (u.education || []).find(e => e.degree === degreeName) || {};

            const hs = getEdu(MANDATORY_DEGREES[0]);
            const inter = getEdu(MANDATORY_DEGREES[1]);
            const ug = getEdu(MANDATORY_DEGREES[2]);
            const pg = getEdu(MANDATORY_DEGREES[3]);

            // Experience Logic: Current or Most Recent
            let recentExp = (u.experience || []).find(e => !e.endDate || e.endDate.toLowerCase().includes("present") || e.endDate.toLowerCase().includes("current"));
            if (!recentExp && u.experience?.length > 0) {
                recentExp = [...u.experience].sort((a, b) => {
                    const yearA = parseInt(a.endDate?.split(" ").pop()) || 0;
                    const yearB = parseInt(b.endDate?.split(" ").pop()) || 0;
                    return yearB - yearA;
                })[0];
            }
            recentExp = recentExp || {};

            // Address splitting (simple heuristic: "City, State, Country")
            const addrParts = (u.address || "").split(",").map(p => p.trim());
            const city = addrParts[0] || "N/A";
            const state = addrParts[1] || "N/A";
            const country = addrParts[2] || "N/A";

            return [
                index + 1,
                u.enrollmentNumber || "N/A",
                u.name,
                u.email,
                u.phone || "N/A",
                city, state, country,
                // HS
                hs.institution || "NA", hs.endDate?.split(" ").pop() || "NA", hs.grade || "NA",
                // Intermediate
                inter.institution || "NA", inter.endDate?.split(" ").pop() || "NA", inter.grade || "NA",
                // Undergraduate
                ug.institution || "NA", ug.campus || "NA", ug.fieldOfStudy || "NA", ug.startDate?.split(" ").pop() || "NA", ug.endDate?.split(" ").pop() || "NA", ug.grade || "NA",
                // Postgraduate
                pg.institution || "NA", pg.campus || "NA", pg.fieldOfStudy || "NA", pg.startDate?.split(" ").pop() || "NA", pg.endDate?.split(" ").pop() || "NA", pg.grade || "NA",
                // Experience
                recentExp.title || "NA", recentExp.company || "NA", recentExp.startDate && recentExp.endDate ? `${recentExp.startDate} - ${recentExp.endDate}` : "NA"
            ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(",");
        });

        const csvContent = [
            r1.join(","),
            r2.join(","),
            r3.join(","),
            ...rows
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `alumni_data_reshaped_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Reshaped CSV Downloaded Successfully");
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Search & Filters */}
            <section className="bg-gray-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-8">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search by name, email, enrollment..."
                            value={searchQuery}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none transition-all text-white placeholder-white/20"
                        />
                        <svg className="absolute left-4 top-4 w-5 h-5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <button
                        onClick={handleSearch}
                        className="px-10 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black transition-all shadow-lg active:scale-95"
                    >
                        Search Alumni
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2 font-black">Course</label>
                        <select
                            value={filters.course}
                            onChange={(e) => setFilters({ ...filters, course: e.target.value })}
                            className="w-full px-4 py-3 bg-[#1a1a2e] border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-400 appearance-none cursor-pointer"
                        >
                            <option value="">All Courses</option>
                            {["B.Tech", "M.Tech", "MBA", "BCA", "MCA"].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2 font-black">Graduation Year</label>
                        <select
                            value={filters.year}
                            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                            className="w-full px-4 py-3 bg-[#1a1a2e] border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-400 appearance-none cursor-pointer"
                        >
                            <option value="">All Years</option>
                            {Array.from({ length: 25 }, (_, i) => 2010 + i).map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2 font-black">Industry</label>
                        <input
                            type="text"
                            placeholder="e.g. IT, Finance"
                            value={filters.industry}
                            onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-400 placeholder-white/10"
                        />
                    </div>
                </div>
            </section>

            {/* Results & Export */}
            {alumni.length > 0 && (
                <section className="bg-gray-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-2 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.4)]"></div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Export Preview ({alumni.length})</h2>
                        </div>
                        <button
                            onClick={downloadCSV}
                            className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black transition-all shadow-xl flex items-center gap-2 active:scale-95"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Download CSV
                        </button>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar border border-white/5 rounded-2xl">
                        <table className="w-full">
                            <thead>
                                <tr className="text-blue-100/30 text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/5 bg-white/5">
                                    <th className="py-4 px-6 text-left">Alumni</th>
                                    <th className="py-4 px-6 text-left">Course & Year</th>
                                    <th className="py-4 px-6 text-left">Location</th>
                                    <th className="py-4 px-6 text-left">Industry</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {alumni.slice(0, 10).map((u) => (
                                    <tr key={u._id} className="hover:bg-white/5 transition-all">
                                        <td className="py-4 px-6">
                                            <div>
                                                <p className="font-extrabold text-white">{u.name}</p>
                                                <p className="text-xs text-blue-100/40">{u.email}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-xs font-black text-blue-100/60 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                                {u.course} ({u.year})
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-xs text-blue-100/60">{u.address || "N/A"}</td>
                                        <td className="py-4 px-6">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-400/10 px-2.5 py-1 rounded-full">
                                                {u.workProfile?.industry || "N/A"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {alumni.length > 10 && (
                            <div className="p-4 text-center bg-white/5">
                                <p className="text-xs text-blue-100/20 font-bold uppercase tracking-widest italic">
                                    Showing first 10 results. Click Download to get all {alumni.length} entries.
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-blue-100/40 font-black uppercase tracking-widest text-xs">Searching database...</p>
                </div>
            )}
        </div>
    );
}
