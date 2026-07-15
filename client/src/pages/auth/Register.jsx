import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm as useHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '../../context/AuthContext';
import { Heart, ArrowRight, User, Mail, Lock, Calendar, Droplets } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate as useNav } from 'react-router-dom';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  dob: z.string().nonempty('Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  bloodGroup: z.string().nonempty('Blood group is required'),
  language: z.string().optional()
});

const Register = () => {
  const navigate = useNav();
  const { registerPatient } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useHookForm({
    resolver: zodResolver(schema),
    defaultValues: { gender: 'male', bloodGroup: 'O+', language: 'English' }
  });

  const onSubmit = async (data) => {
    try {
      await registerPatient(data);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error('Registration failed. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Left Branding */}
      <div className="hidden lg:flex w-[420px] xl:w-[480px] bg-gradient-to-br from-teal-600 via-blue-700 to-slate-900 flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-400/20 rounded-full blur-[100px]" />
        <div className="relative z-10 flex items-center gap-2">
          <Heart className="h-6 w-6 text-teal-300 fill-teal-300/20" />
          <span className="font-extrabold text-xl tracking-tight">HealSync</span>
        </div>
        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-extrabold leading-tight">
            Join thousands of patients managing their health smarter.
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed">
            Book appointments, scan prescriptions, track vitals, and get personalised AI health insights — all in one platform.
          </p>
        </div>
        <div className="relative z-10 text-xs text-blue-300">© 2026 HealSync Inc.</div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12 bg-white">
        <div className="mx-auto w-full max-w-lg">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Heart className="h-6 w-6 text-blue-600 fill-blue-100" />
            <span className="font-extrabold text-xl text-blue-600">HealSync</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Create your account</h1>
            <p className="text-sm text-slate-500">Register as a patient to get started.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input id="name" {...register('name')} placeholder="John Doe" className="pl-10 rounded-xl h-11" />
                </div>
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input id="email" type="email" {...register('email')} placeholder="john@example.com" className="pl-10 rounded-xl h-11" />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="password" type="password" {...register('password')} placeholder="••••••••" className="pl-10 rounded-xl h-11" />
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dob" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Date of Birth</Label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input id="dob" type="date" {...register('dob')} className="pl-10 rounded-xl h-11" />
                </div>
                {errors.dob && <p className="text-xs text-red-500">{errors.dob.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gender" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Gender</Label>
                <select id="gender" {...register('gender')} className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <p className="text-xs text-red-500">{errors.gender.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bloodGroup" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Blood Group</Label>
                <div className="relative">
                  <Droplets className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <select id="bloodGroup" {...register('bloodGroup')} className="w-full h-11 bg-white border border-slate-200 rounded-xl pl-10 pr-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                {errors.bloodGroup && <p className="text-xs text-red-500">{errors.bloodGroup.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="language" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Preferred Language</Label>
              <Input id="language" {...register('language')} placeholder="e.g. English, Hindi" className="rounded-xl h-11" />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 active:scale-[0.98] mt-4 group disabled:opacity-60"
            >
              {isSubmitting ? 'Creating account...' : <>Create Account <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
