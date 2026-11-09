'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { loginAction } from '../actions';
import { Lock, Mail, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await loginAction(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        {/* Brand Logo */}
        <div className="inline-block bg-white p-4 rounded-2xl shadow-xl">
          <div className="relative w-48 h-12">
            <Image
              src="/images/fca/logo.png"
              alt="Fran Capelli Academy"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Academy Administration Portal
        </h2>
        <p className="text-xs text-slate-400">
          Fran Capelli Academy (RTO # 6055) Content Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-100 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue="admin@fca.edu.au"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-900 placeholder-slate-400"
                  placeholder="admin@fca.edu.au"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  required
                  defaultValue="FcaAcademy2026!"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-900 placeholder-slate-400"
                  placeholder="••••••••••••"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-fca-green hover:bg-fca-green-dark transition-all duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Info Box */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs space-y-1.5 text-slate-700">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Standard Demo Credentials</span>
            </div>
            <p><strong>Email:</strong> admin@fca.edu.au</p>
            <p><strong>Password:</strong> FcaAcademy2026!</p>
          </div>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-slate-500 hover:text-fca-green font-medium">
              ← Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

