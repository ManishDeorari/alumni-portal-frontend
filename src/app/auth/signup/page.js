"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    enrollmentNumber: "",
    role: "alumni", // default
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Prepare body according to role
      const body =
        form.role === "faculty"
          ? {
            name: form.name,
            email: form.email,
            password: form.password,
            role: "faculty",
            employeeId: form.enrollmentNumber, // mapping faculty field to employeeId
          }
          : {
            name: form.name,
            email: form.email,
            password: form.password,
            role: "alumni",
            enrollmentNumber: form.enrollmentNumber,
          };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      alert("✅ Signup successful! Please wait for admin approval.");
      router.push("/auth/login");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 relative overflow-hidden px-8 transition-colors duration-500 text-white`}>
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-1/2 max-w-[500px]"
        >
          <div className={`${darkMode ? "bg-[#0f172a]/95 text-white" : "bg-white text-gray-900"} backdrop-blur-3xl border ${darkMode ? "border-white/10" : "border-gray-200"} rounded-[2.2rem] py-3.5 px-8 md:py-4 md:px-10 shadow-2xl space-y-1.5 relative overflow-hidden transition-all duration-500`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>

            <div className="space-y-1 text-center">
              <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-black"}`}>Create Account</h2>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Join our thriving community 🚀</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`${darkMode ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-100 text-red-600"} border text-[10px] py-2 px-4 rounded-xl text-center font-bold`}
                >
                  {error}
                </motion.div>
              )}

              {/* Role Selector */}
              <div className="flex justify-center gap-8 py-0.5">
                {["alumni", "faculty"].map((r) => (
                  <label key={r} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="radio"
                        name="role"
                        value={r}
                        checked={form.role === r}
                        onChange={handleChange}
                        className="peer hidden"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 transition-all ${darkMode ? "border-white/20 peer-checked:border-blue-500" : "border-gray-300 peer-checked:border-blue-600"}`}></div>
                      <div className={`absolute inset-1 rounded-full scale-0 peer-checked:scale-100 transition-transform ${darkMode ? "bg-blue-500" : "bg-blue-600"}`}></div>
                    </div>
                    <span className={`text-[10px] uppercase tracking-widest font-black transition-colors ${form.role === r ? (darkMode ? "text-blue-400" : "text-blue-600") : (darkMode ? "text-gray-500" : "text-gray-400")}`}>
                      {r}
                    </span>
                  </label>
                ))}
              </div>

              <div className="space-y-2.5">
                <div className="space-y-1">
                  <label className={`text-[9px] uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"} ml-4 font-black`}>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                    className={`w-full px-6 py-3 rounded-2xl outline-none text-sm gradient-border-input ${darkMode ? "gradient-border-input-dark text-white placeholder-white/20" : "gradient-border-input-light text-gray-900 placeholder-gray-400"} shadow-sm hover:shadow-blue-500/20`}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[9px] uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"} ml-4 font-black`}>
                    {form.role === "faculty" ? "Employee ID" : "Enrollment No."}
                  </label>
                  <input
                    type="text"
                    name="enrollmentNumber"
                    placeholder={form.role === "faculty" ? "Ex: Emp-123" : "Ex: 2021001"}
                    value={form.enrollmentNumber}
                    onChange={handleChange}
                    className={`w-full px-6 py-3 rounded-2xl outline-none text-sm gradient-border-input ${darkMode ? "gradient-border-input-dark text-white placeholder-white/20" : "gradient-border-input-light text-gray-900 placeholder-gray-400"} shadow-sm hover:shadow-blue-500/20`}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[9px] uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"} ml-4 font-black`}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="john@univ.edu"
                    value={form.email}
                    onChange={handleChange}
                    className={`w-full px-6 py-3 rounded-2xl outline-none text-sm gradient-border-input ${darkMode ? "gradient-border-input-dark text-white placeholder-white/20" : "gradient-border-input-light text-gray-900 placeholder-gray-400"} shadow-sm hover:shadow-blue-500/20`}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[9px] uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"} ml-4 font-black`}>Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className={`w-full px-6 py-3 rounded-2xl outline-none text-sm gradient-border-input ${darkMode ? "gradient-border-input-dark text-white placeholder-white/20" : "gradient-border-input-light text-gray-900 placeholder-gray-400"} shadow-sm hover:shadow-blue-500/20`}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50"
                style={{ boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)' }}
              >
                {loading ? "Creating Account..." : "Join Portal"}
              </button>

              <p className={`text-sm text-center ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Already a member?{" "}
                <Link href="/auth/login" className="text-blue-500 font-bold hover:underline underline-offset-4">
                  Login
                </Link>
              </p>
            </form>

            {/* Back to Home Inside the Div */}
            <div className="pt-1.5 border-t border-white/5 text-center">
              <Link
                href="/"
                className={`inline-flex items-center gap-3 ${darkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-800"} transition-all group`}
              >
                <span className={`w-3 h-[1px] ${darkMode ? "bg-gray-700" : "bg-gray-300"} group-hover:w-8 transition-all`}></span>
                <span className="text-[10px] uppercase tracking-[0.3em] font-black">Back to Home</span>
                <span className={`w-3 h-[1px] ${darkMode ? "bg-gray-700" : "bg-gray-300"} group-hover:w-8 transition-all`}></span>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Header Content on the Right */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full lg:w-1/2 text-center lg:text-right hidden lg:block"
        >
          <h1 className="text-9xl xl:text-[10rem] font-black text-white tracking-tighter drop-shadow-2xl leading-[0.85] opacity-90">
            Alumni Portal
          </h1>
          <p className="text-white/80 mt-6 font-medium text-xl xl:text-2xl max-w-[600px] ml-auto">
            Build lifelong connections, share opportunities, and keep the university spirit alive.
          </p>
          <div className="mt-8 flex justify-end gap-4">
            <div className="w-12 h-1.5 bg-white rounded-full opacity-20"></div>
            <div className="w-12 h-1.5 bg-blue-400 rounded-full"></div>
            <div className="w-12 h-1.5 bg-white rounded-full opacity-20"></div>
          </div>
        </motion.div>

        {/* Mobile Header (Shows above form on small screens) */}
        <div className="lg:hidden text-center mb-0 order-first">
          <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-lg">
            Alumni Portal
          </h1>
          <p className="text-white/70 mt-2 font-medium text-sm">Reconnect. Network. Grow.</p>
        </div>
      </div>

      {/* Theme Toggle Button Fixed at bottom right corner of page */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-4 rounded-full backdrop-blur-md shadow-2xl border-2 transition-all duration-500 ${darkMode ? "bg-white/10 border-white/20 text-yellow-400 hover:bg-white/20" : "bg-[#0f172a]/10 border-[#0f172a]/20 text-[#0f172a] hover:bg-[#0f172a]/20"} hover:scale-110 active:scale-90`}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? (
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
              <span className="text-[10px] uppercase tracking-widest font-black text-yellow-500">Light Mode</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
              <span className="text-[10px] uppercase tracking-widest font-black text-[#0f172a]">Dark Mode</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
