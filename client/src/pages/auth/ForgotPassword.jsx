import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, ArrowLeft, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSent(true);
    setLoading(false);
    toast.success('Reset link sent if account exists!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-8 rounded-3xl shadow-xl backdrop-blur-xl">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="bg-primary/10 p-2.5 rounded-2xl text-primary mb-3">
            <Heart className="h-6 w-6 fill-primary/10" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Forgot Password</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            We will send you instructions to reset your password.
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl font-medium shadow-lg shadow-primary/20"
            >
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </Button>
          </form>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto bg-green-500/10 p-3 rounded-full text-green-500 w-12 h-12 flex items-center justify-center">
              <Mail className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-base">Check your email</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                We've sent a password reset link to <strong className="text-slate-700 dark:text-slate-300">{email}</strong>.
              </p>
            </div>
          </div>
        )}

        <div className="border-t border-slate-200/50 dark:border-slate-800/50 mt-6 pt-4 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
