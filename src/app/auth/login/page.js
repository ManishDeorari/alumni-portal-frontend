"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState("LOGIN"); // LOGIN | FORGOT_EMAIL | FORGOT_OTP
  const [form, setForm] = useState({ identifier: "", password: "" });

  // Forgot Password States
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Countdown timer for OTP
  React.useEffect(() => {
    let interval;
    if (view === "FORGOT_OTP" && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [view, timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            identifier: form.identifier,
            password: form.password
          }),
        });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      // ✅ Save token and role
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("userId", data.userId);

        toast.success("✅ Login Successful!");

        // ✅ Redirect based on role
        if (data.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        throw new Error("Token not received");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message || "Something went wrong");
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(data.message);
      setView("FORGOT_OTP");
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/reset-password-with-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(data.message);
      setView("LOGIN");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 relative overflow-hidden px-8 transition-colors duration-500`}>
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
          <div className={`${darkMode ? "bg-[#0f172a]/90 text-white" : "bg-white text-gray-900"} backdrop-blur-2xl border ${darkMode ? "border-white/10" : "border-gray-200"} rounded-[2.5rem] py-6 px-8 md:py-8 md:px-10 shadow-2xl space-y-6 relative overflow-hidden transition-all duration-500`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>

            {view === "LOGIN" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 text-center">
                  <h2 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-black"}`}>Welcome Back</h2>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Enter your credentials to access your account</p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`${darkMode ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-100 text-red-600"} border text-xs py-3 px-4 rounded-xl text-center font-bold`}
                  >
                    {error}
                  </motion.div>
                )}

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className={`text-[10px] uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"} ml-4 font-black`}>Email or ID</label>
                    <input
                      type="text"
                      name="identifier"
                      placeholder="example@univ.edu"
                      value={form.identifier}
                      onChange={handleChange}
                      className={`w-full px-6 py-4 rounded-2xl outline-none gradient-border-input ${darkMode ? "gradient-border-input-dark text-white placeholder-white/20" : "gradient-border-input-light text-gray-900 placeholder-gray-400"} shadow-sm hover:shadow-blue-500/20`}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-4 mr-2">
                      <label className={`text-[10px] uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"} font-black`}>Password</label>
                      <button
                        type="button"
                        onClick={() => setView("FORGOT_EMAIL")}
                        className="text-[10px] uppercase tracking-widest text-blue-500 hover:text-blue-400 font-black transition-colors"
                      >
                        Forgot?
                      </button>
                    </div>
                    <input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      className={`w-full px-6 py-4 rounded-2xl outline-none gradient-border-input ${darkMode ? "gradient-border-input-dark text-white placeholder-white/20" : "gradient-border-input-light text-gray-900 placeholder-gray-400"} shadow-sm hover:shadow-blue-500/20`}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50"
                  style={{ boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)' }}
                >
                  {loading ? "Authenticating..." : "Login to Dashboard"}
                </button>

                <div className="pt-2 text-center">
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    New here?{" "}
                    <Link href="/auth/signup" className="text-blue-500 font-bold hover:underline underline-offset-4">
                      Create an Account
                    </Link>
                  </p>
                </div>
              </form>
            )}

            {view === "FORGOT_EMAIL" && (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="space-y-2 text-center">
                  <h2 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-black"}`}>Reset Access</h2>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>We'll send a code to your registered email</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className={`text-[10px] uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"} ml-4 font-black`}>Email Address</label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className={`w-full px-6 py-4 rounded-2xl outline-none gradient-border-input ${darkMode ? "gradient-border-input-dark text-white placeholder-white/20" : "gradient-border-input-light text-gray-900 placeholder-gray-400"} shadow-sm hover:shadow-blue-500/20`}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full ${darkMode ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"} py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all`}
                  >
                    {loading ? "Sending..." : "Send Verification Code"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("LOGIN")}
                    className={`w-full ${darkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"} text-[10px] uppercase tracking-widest font-black transition-colors`}
                  >
                    Return to Login
                  </button>
                </div>
              </form>
            )}

            {view === "FORGOT_OTP" && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-2 text-center">
                  <h2 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-black"}`}>Security Check</h2>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Verification code sent to your inbox</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className={`text-[10px] uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"} ml-4 font-black`}>Verification Code</label>
                    <input
                      type="text"
                      placeholder="6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className={`w-full px-6 py-4 rounded-2xl outline-none text-center tracking-[0.5em] font-black gradient-border-input ${darkMode ? "gradient-border-input-dark text-white placeholder-white/20" : "gradient-border-input-light text-gray-900 placeholder-gray-400"} shadow-sm hover:shadow-blue-500/20`}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={`text-[10px] uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"} ml-4 font-black`}>New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full px-6 py-4 rounded-2xl outline-none gradient-border-input ${darkMode ? "gradient-border-input-dark text-white placeholder-white/20" : "gradient-border-input-light text-gray-900 placeholder-gray-400"} shadow-sm hover:shadow-blue-500/20`}
                      required
                    />
                  </div>
                </div>

                <div className="text-center">
                  {timer > 0 ? (
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Code expires in <span className="text-blue-500">{timer}s</span></p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[10px] uppercase tracking-widest text-red-500 font-black hover:underline"
                    >
                      Code Expired. Resend?
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg"
                  >
                    {loading ? "Updating..." : "Verify & Reset"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("LOGIN")}
                    className={`w-full ${darkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"} text-[10px] uppercase tracking-widest font-black transition-colors`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Back to Home Inside the Div */}
            <div className="pt-2 border-t border-white/5 text-center">
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
            Reconnect with your roots. Network with professionals. Grow your future together.
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

      {/* Theme Toggle Button - Fixed at absolute bottom right of page */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-4 rounded-full backdrop-blur-md shadow-2xl border-2 transition-all duration-500 ${darkMode ? "bg-white/10 border-white/20 text-yellow-400 hover:bg-white/20" : "bg-[#0f172a]/10 border-[#0f172a]/20 text-[#0f172a] hover:bg-[#0f172a]/20"} hover:scale-110 active:scale-90`}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? (
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
              <span className="text-[10px] uppercase tracking-widest font-black">Light Mode</span>
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
