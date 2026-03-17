import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Mail, Lock, ArrowRight, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { login, verifyMFA } from '../lib/api';
import { getErrorMessage } from '../lib/error-utils';

export function Login() {
  const [step, setStep] = useState<'login' | 'mfa'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.status === 401 && result.error === 'mfa_required') {
        setMfaToken(result.mfaToken);
        setStep('mfa');
        toast.info('Two-factor authentication required');
      } else if (result.status === 200) {
        localStorage.setItem('accessToken', result.data.accessToken);
        localStorage.setItem('admin', JSON.stringify(result.data.admin));
        toast.success(`Welcome back, ${result.data.admin.name}`);
        navigate('/dashboard');
      } else {
        toast.error(getErrorMessage(result.error));
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Connection failed. Please check your network.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await verifyMFA(mfaToken, totpCode);

      if (result.status === 200) {
        localStorage.setItem('accessToken', result.data.accessToken);
        localStorage.setItem('admin', JSON.stringify(result.data.admin));
        toast.success('Authentication successful');
        navigate('/dashboard');
      } else {
        toast.error(getErrorMessage(result.error));
      }
    } catch (err) {
      console.error('MFA error:', err);
      toast.error('A network error occurred during verification.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.16),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] px-4 py-8 font-sans text-slate-900">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden border-r border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-950 text-white">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Admin Console</p>
            <h1 className="mt-3 max-w-md text-4xl font-semibold tracking-tight text-slate-950">A more objective control surface for your operations.</h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500">
              Designed to stay quiet, readable, and professional so the data is what stands out.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <p className="text-3xl font-semibold text-slate-950">24/7</p>
              <p className="mt-2 text-sm text-slate-500">Operational coverage</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <p className="text-3xl font-semibold text-slate-950">MFA</p>
              <p className="mt-2 text-sm text-slate-500">Protected access</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white">
              <p className="text-3xl font-semibold">Audit</p>
              <p className="mt-2 text-sm text-slate-300">Traceable activity</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 'login' ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="flex flex-col">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-950 lg:hidden">
                  <LayoutDashboard className="h-6 w-6 text-white" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Secure access</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Sign in</h1>
                <p className="mt-2 text-sm text-slate-500">Enter your credentials to continue to the admin workspace.</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="ml-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="ml-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative mt-6 flex w-full items-center justify-center overflow-hidden rounded-lg bg-slate-950 py-3.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 disabled:opacity-70"
                >
                  <span className={isLoading ? 'opacity-0' : 'opacity-100 flex items-center gap-2'}>
                    Sign in
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="mfa"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="flex flex-col text-center">
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                  <ShieldCheck className="h-6 w-6 text-slate-900" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Verification</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Two-factor authentication</h1>
                <p className="mt-2 px-4 text-sm text-slate-500">
                  Enter the 6-digit code from your authenticator app to secure your account.
                </p>
              </div>

              <form onSubmit={handleMfaSubmit} className="space-y-6">
                <div className="flex justify-center">
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000 000"
                    className="w-full max-w-[220px] rounded-lg border border-slate-200 bg-slate-50 py-4 text-center text-3xl font-semibold tracking-[0.42em] text-slate-950 focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-200/60 placeholder:text-slate-300"
                  />
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={isLoading || totpCode.length !== 6}
                    className="relative flex w-full items-center justify-center rounded-lg bg-slate-950 py-3.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 disabled:opacity-30"
                  >
                    <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
                      Verify and Login
                    </span>
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('login')}
                    className="flex w-full items-center justify-center gap-2 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 transition-colors hover:text-slate-900"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back to login
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
            Authorized Access Only
          </p>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
