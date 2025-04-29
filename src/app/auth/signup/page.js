"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", enrollmentNumber: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("https://alumni-backend-d9k9.onrender.com/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);
    if (res.ok) {
      router.push("/auth/login");
    } else {
      alert("❌ Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-white text-gray-800 rounded-xl shadow-lg w-full max-w-md p-8 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Create Your Account</h1>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded focus:outline-none"
        />

        <input
          type="text"
          name="enrollmentNumber"
          placeholder="Enrollment Number"
          value={form.enrollmentNumber}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded focus:outline-none"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded focus:outline-none"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded focus:outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>

        <p className="mt-4 text-sm text-center">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-600 underline">Login</Link>
        </p>

        <Link href="/" className="block mt-2 text-center text-blue-600 text-sm">
          ← Back to Home
        </Link>
      </form>
    </div>
  );
}
