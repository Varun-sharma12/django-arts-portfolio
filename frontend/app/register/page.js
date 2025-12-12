// frontend/pages/register.js
"use client";
import { useState } from "react";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [message, setMessage] = useState("");

  async function submit(e) {
    e.preventDefault();
    const res = await fetch("http://127.0.0.1:8000/api/auth/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(JSON.stringify(data));
    } else {
      setMessage(data.detail || "Check your email for verification link.");
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-4">Register</h1>
      <form onSubmit={submit} className="space-y-3">
        <input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} placeholder="username" required className="w-full p-2 border"/>
        <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="email" type="email" required className="w-full p-2 border"/>
        <input value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="password" type="password" required className="w-full p-2 border"/>
        <input value={form.confirm_password} onChange={e=>setForm({...form,confirm_password:e.target.value})} placeholder="confirm password" type="password" required className="w-full p-2 border"/>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Register</button>
      </form>
      <div className="mt-4 text-sm text-red-600">{message}</div>
    </div>
  );
}
