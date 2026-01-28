"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

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
            enrollmentNumber: form.enrollmentNumber, // employeeId handled as same field
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-white px-4">
      <h1 className="text-3xl font-bold mb-6">Join Alumni Portal 🚀</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white text-gray-800 rounded-xl shadow-lg w-full max-w-md p-8 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Create Your Account</h2>

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        {/* Role Selector */}
        <div className="flex justify-center gap-4 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              value="alumni"
              checked={form.role === "alumni"}
              onChange={handleChange}
            />
            Alumni
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              value="faculty"
              checked={form.role === "faculty"}
              onChange={handleChange}
            />
            Faculty
          </label>
        </div>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded focus:outline-none"
          required
        />

        <input
          type="text"
          name="enrollmentNumber"
          placeholder={form.role === "faculty" ? "Employee ID" : "Enrollment Number"}
          value={form.enrollmentNumber}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded focus:outline-none"
          required
        />

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
          {loading ? "Signing Up..." : "Sign Up"}
        </button>

        <p className="mt-4 text-sm text-center">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-600 underline">
            Login
          </Link>
        </p>

        <Link href="/" className="block mt-2 text-center text-blue-600 text-sm">
          ← Back to Home
        </Link>
      </form>
    </div>
  );
}
