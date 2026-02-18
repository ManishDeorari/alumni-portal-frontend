"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState("LOGIN"); // LOGIN | FORGOT_EMAIL | FORGOT_OTP
  const [form, setForm] = useState({ email: "", password: "", enrollmentNumber: "" });

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
          body: JSON.stringify(form),
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-white px-4">
      <h1 className="text-3xl font-bold mb-6">Welcome Back 👋</h1>

      <div className="bg-white text-gray-800 rounded-xl shadow-lg w-full max-w-md p-8 space-y-4">
        {view === "LOGIN" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Login to Continue</h2>
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}

            <div className="space-y-3">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                name="enrollmentNumber"
                placeholder="ID"
                value={form.enrollmentNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setView("FORGOT_EMAIL")}
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
            >
              {loading ? "Logging In..." : "Login"}
            </button>

            <p className="mt-4 text-sm text-center">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-blue-600 underline">Sign Up</Link>
            </p>
          </form>
        )}

        {view === "FORGOT_EMAIL" && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Reset Password</h2>
            <p className="text-sm text-gray-500 text-center">Enter your email to receive a verification code.</p>
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}

            <input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>

            <button
              type="button"
              onClick={() => setView("LOGIN")}
              className="w-full text-gray-500 hover:text-gray-700 text-sm"
            >
              Back to Start
            </button>
          </form>
        )}

        {view === "FORGOT_OTP" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Enter OTP</h2>
            <p className="text-sm text-gray-500 text-center">Check your email for the 6-digit code.</p>
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}

            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <div className="text-center text-sm text-gray-500">
              {timer > 0 ? (
                <p>Time remaining: {timer}s</p>
              ) : (
                <p className="text-red-500">OTP Expired</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            {canResend && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="w-full text-blue-600 hover:underline text-sm"
              >
                Resend OTP
              </button>
            )}

            <button
              type="button"
              onClick={() => setView("LOGIN")}
              className="w-full text-gray-500 hover:text-gray-700 text-sm"
            >
              Cancel
            </button>
          </form>
        )}

        <Link href="/" className="block mt-2 text-center text-blue-600 text-sm">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
