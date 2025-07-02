"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", enrollmentNumber: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("https://alumni-backend-d9k9.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ Use for cookies/session
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Login failed");
      }

      const data = await res.json();

      // ✅ Store token if needed (commented out if using cookies)
      // localStorage.setItem("token", data.token);

      // ✅ Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-white px-4">
      <h1 className="text-3xl font-bold mb-6">Welcome Back 👋</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white text-gray-800 rounded-xl shadow-lg w-full max-w-md p-8 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Login</h2>

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded focus:outline-none"
          required
        />

        <input
          type="text"
          name="enrollmentNumber"
          placeholder="Enrollment Number"
          value={form.enrollmentNumber}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded focus:outline-none"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded focus:outline-none"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
        >
          {loading ? "Logging In..." : "Login"}
        </button>

        <p className="mt-4 text-sm text-center">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-blue-600 underline">Sign Up</Link>
        </p>

        <Link href="/" className="block mt-2 text-center text-blue-600 text-sm">
          ← Back to Home
        </Link>
      </form>
    </div>
  );
}
