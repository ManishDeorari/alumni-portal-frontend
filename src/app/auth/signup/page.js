
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    enrollmentNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://alumni-backend-d9k9.onrender.com/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Signup failed");
      }

      router.push("/auth/login");
    } catch (err) {
      console.error("❌ Signup error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex flex-col justify-center items-center text-white">
      <h1 className="text-3xl font-bold mb-6">Join Alumni Portal 🚀</h1>
      <form onSubmit={handleSignup} className="bg-white p-8 rounded-lg shadow-md w-80 text-black">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="input mb-4"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="input mb-4"
          required
        />
        <input
          type="text"
          placeholder="Enrollment Number"
          value={form.enrollmentNumber}
          onChange={(e) => setForm({ ...form, enrollmentNumber: e.target.value })}
          className="input mb-4"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="input mb-4"
          required
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn w-full"
        >
          {loading ? (
            <div className="flex justify-center items-center">
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Signing Up...
            </div>
          ) : (
            "Sign Up"
          )}
        </button>
      </form>

      <p className="mt-4 text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-600 underline">Login</Link>
        </p>
        <Link href="/" className="block mt-4 text-blue-600 text-sm">
          ← Back to Home
        </Link>
    </div>
  );
}
