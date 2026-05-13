import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorVisible('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes('rate limit')) {
          setErrorVisible("Login rate limit exceeded. Please wait a few minutes before trying again.");
          toast.error('Limit exceeded');
        } else {
          setErrorVisible(error.message);
          toast.error('Authentication failed');
        }
      } else if (!data.session) {
        setErrorVisible('Missing session. Please try again.');
        toast.error('Authentication failed');
      } else {
        toast.success('Welcome back');
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      setErrorVisible(err.message || 'An unexpected error occurred');
      toast.error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-12"
      >
        <div className="text-center space-y-4">
          <Link to="/" className="text-2xl font-bold tracking-tighter uppercase font-display inline-block text-black">
            SLIXY
          </Link>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
            Access your account
          </p>
        </div>

        {location.state?.signupSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-gray-50 border border-gray-100 rounded-sm space-y-2 text-center"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-black">Account Created</p>
            <p className="text-[10px] leading-relaxed text-gray-400 uppercase tracking-widest">
              Please check your email and verify your address before logging in.
            </p>
          </motion.div>
        )}

        <form onSubmit={handleSignIn} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2">Email Address</label>
              <input 
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 border border-gray-100 focus:border-black outline-none transition-all text-sm text-black placeholder:text-gray-300"
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2">Password</label>
              <input 
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 border border-gray-100 focus:border-black outline-none transition-all text-sm text-black placeholder:text-gray-300"
                placeholder="••••••••"
              />
            </div>
          </div>

          {errorVisible && (
            <p className="text-[10px] text-red-500 uppercase tracking-widest font-medium text-center">
              {errorVisible}
            </p>
          )}

          <button 
            disabled={loading}
            className="w-full py-5 bg-black text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">
            Don't have an account?{' '}
            <Link to="/signup" className="text-black font-bold hover:underline underline-offset-4 decoration-black/10">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
