"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiFetch } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required.").max(256)
});
type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [message, setMessage] = useState("No public administrator registration is available.");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "technician@pipeguard.local", password: "" }
  });

  const submit = handleSubmit(async (values) => {
    try {
      const user = await apiFetch<{ email: string; role: string }>("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      setMessage(`Signed in as ${user.email} (${user.role}).`);
    } catch {
      setMessage("Invalid email or password, or the backend is unavailable.");
    }
  });

  return (
    <div className="mx-auto max-w-lg">
      <form onSubmit={submit} className="card p-6 sm:p-8" noValidate>
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-cyan-300"><LockKeyhole className="h-8 w-8" /></span>
        <h2 className="mt-5 text-center text-2xl font-extrabold">Technician Login</h2>
        <p className="mt-2 text-center text-sm text-slate-500">Authentication is required only for inspection record changes.</p>
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="label">Email</span>
            <input className="input mt-1" type="email" autoComplete="username" {...register("email")} aria-invalid={Boolean(errors.email)} />
            {errors.email && <span className="mt-1 block text-xs font-semibold text-red-600">{errors.email.message}</span>}
          </label>
          <label className="block">
            <span className="label">Password</span>
            <input className="input mt-1" type="password" autoComplete="current-password" {...register("password")} aria-invalid={Boolean(errors.password)} />
            {errors.password && <span className="mt-1 block text-xs font-semibold text-red-600">{errors.password.message}</span>}
          </label>
        </div>
        <button disabled={isSubmitting} className="mt-6 min-h-12 w-full rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 font-extrabold text-white disabled:opacity-50">
          {isSubmitting ? "Signing in…" : "Sign In"}
        </button>
        <div className="mt-4 rounded-xl bg-slate-100 p-4 text-sm dark:bg-slate-800" aria-live="polite">{message}</div>
      </form>
    </div>
  );
}
