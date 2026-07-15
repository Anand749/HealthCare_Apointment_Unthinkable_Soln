import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, mockUsers } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Heart,
  ShieldAlert,
  ArrowRight,
  Activity,
  Calendar,
  Lock,
  Mail,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('patient');

  const handleMockLogin = async (role) => {
    try {
      const mockUser = mockUsers[role];
      await login(mockUser.email, 'password123', role);
      toast.success(`Welcome, ${mockUser.name}!`);
      navigate(`/${role}`);
    } catch (error) {
      toast.error(error.message || 'Login failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      const user = await login(email, password, selectedRole);
      toast.success(`Logged in as ${user.name}`);
      navigate(`/${user.role}`);
    } catch (error) {
      toast.error(error.message || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* ── Left Column: Form ─────────────────────────────────────────── */}
      <div className="w-full lg:w-[480px] xl:w-[520px] flex flex-col justify-center px-8 sm:px-12 lg:px-14 py-12 bg-white shadow-2xl z-10">
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className="bg-blue-50 p-2 rounded-xl border border-blue-100">
            <Heart className="h-6 w-6 text-blue-600 fill-blue-100" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-blue-600">HealSync</span>
            <span className="block text-[10px] font-semibold text-slate-400 tracking-widest uppercase">Healthcare SaaS</span>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Welcome back</h1>
          <p className="text-sm text-slate-500">
            Sign in to access your personalised healthcare dashboard.
          </p>
        </div>

        {/* ── One-Click Demo Access ─────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-100 rounded-2xl p-4 mb-7">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-500">
              Quick Demo Access
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['patient', 'doctor', 'admin'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleMockLogin(role)}
                disabled={loading}
                className="capitalize text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-xl py-2.5 px-3 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
              >
                {role}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-2.5 text-center">No password required for demo</p>
        </div>

        {/* ── Divider ───────────────────────────────────────────────────── */}
        <div className="relative flex items-center mb-6">
          <div className="flex-1 border-t border-slate-200" />
          <span className="mx-3 text-xs text-slate-400 font-medium">or sign in manually</span>
          <div className="flex-1 border-t border-slate-200" />
        </div>

        {/* ── Credentials Form ─────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="role" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Role</Label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 rounded-xl h-11 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</Label>
              <Link to="/forgot-password" className="text-xs text-blue-500 font-medium hover:text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 rounded-xl h-11 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 active:scale-[0.98] mt-2 group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </span>
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:underline">
            Create a free account
          </Link>
        </p>
      </div>

      {/* ── Right Column: Branding ──────────────────────────────────────── */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 flex-col justify-between p-12 xl:p-16 text-white relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-80px] left-[-60px] w-[400px] h-[400px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />

        {/* Top bar */}
        <div className="relative z-10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-teal-300" />
            <span className="text-sm font-semibold text-white/80 tracking-wide">HealSync SaaS Platform</span>
          </div>
          <div className="bg-white/10 border border-white/15 px-3 py-1 rounded-full text-xs font-medium">
            ✦ v2.0 Beta
          </div>
        </div>

        {/* Middle content */}
        <div className="relative z-10 space-y-7">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-3 py-1 rounded-full text-xs font-semibold text-teal-300">
              <ShieldAlert className="h-3.5 w-3.5" /> AI-Powered Clinical Intelligence
            </div>
            <h2 className="text-4xl xl:text-5xl font-black tracking-tight leading-tight">
              Healthcare<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-200">Built Smarter.</span>
            </h2>
            <p className="text-lg text-blue-200 leading-relaxed max-w-md">
              HealSync connects doctors and patients using advanced clinical AI—from emergency risk triage to OCR prescription scanning.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Calendar, title: 'Instant Booking', desc: 'Atomic transactions prevent double-bookings.' },
              { icon: ShieldAlert, title: 'Emergency AI', desc: 'Real-time symptom triage with risk levels.' },
              { icon: Activity, title: 'Health Insights', desc: 'AI analytics tracking vitals & history.' },
              { icon: Heart, title: 'Prescription OCR', desc: 'Scan handwritten Rx & auto-schedule meds.' }
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2 hover:bg-white/10 transition-colors">
                <Icon className="h-5 w-5 text-teal-300" />
                <div className="font-bold text-sm">{title}</div>
                <div className="text-xs text-blue-300 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-blue-300">
          <span>© 2026 HealSync Inc. All rights reserved.</span>
          <span className="cursor-pointer hover:text-white">Privacy Policy</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
