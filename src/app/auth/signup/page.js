"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
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
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Signup successful!");
        window.location.href = "/auth/login";
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] max-w-md text-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Sign Up</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="input"
          />
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

          <button type="submit" className="btn w-full mt-2">Create Account</button>
        </form>

        <p className="mt-4 text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-600 underline">Login</Link>
        </p>
        <Link href="/" className="block mt-4 text-blue-600 text-sm">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
