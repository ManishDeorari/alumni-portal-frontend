"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    enrollmentNumber: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://alumni-backend-d9k9.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        alert("Login successful!");
        window.location.href = "/dashboard";
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] max-w-md text-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Login</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="input"
          />
          <input
            type="text"
            name="enrollmentNumber"
            placeholder="Enrollment Number"
            value={form.enrollmentNumber}
            onChange={handleChange}
            className="input"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="input"
          />
          <button type="submit" className="btn w-full mt-2">Login</button>
        </form>

        <p className="mt-4 text-sm">
        Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-blue-600 underline">Sign Up</Link>
        </p>
        <Link href="/" className="block mt-4 text-blue-600 text-sm">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
