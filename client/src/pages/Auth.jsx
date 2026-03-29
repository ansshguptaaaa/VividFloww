import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email');
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const otpInputRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let interval;
    if (isOtpSent && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, timer]);

  useEffect(() => {
    if (step === 'otp' && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  useEffect(() => {
    // Check if token was passed in URL (e.g. from Google Auth callback)
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('vividflow_token', token);
      navigate('/dashboard', { replace: true });
    }
  }, [searchParams, navigate]);

  const handleSendCode = async (e) => {
    if (e) e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/send-otp`, { email });
      console.log('OTP Send Response:', response.data);
      setIsOtpSent(true);
      setTimer(30);
      setStep('otp');
    } catch (error) {
      console.log('OTP Send Error Responses:', error.response?.data || error.message);
      alert(error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, { email, otp });
      localStorage.setItem('vividflow_token', response.data.token);
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.error || 'Invalid Verification Code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  return (
    <div className="min-h-screen w-full flex bg-[#0a0a0a] text-white font-sans selection:bg-purple-500/30">
      {/* LEFT COLUMN: Visuals */}
      <div className="hidden lg:flex flex-1 flex-col relative overflow-hidden bg-black p-12">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[120px] mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[150px] mix-blend-screen pointer-events-none" />
        
        <div className="absolute inset-0 z-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative z-10 flex flex-col h-full h-full justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight">VividFlow</span>
          </div>

          <div className="max-w-xl pb-20">
            <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-[1.1] bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/50">
              Build your vision,<br />seamlessly.
            </h1>
            <p className="text-lg text-neutral-400 font-medium leading-relaxed max-w-md">
              The modern platform for crafting lightning-fast, highly dynamic web experiences without the friction.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Auth Form */}
      <div className="flex-1 flex flex-col bg-white text-slate-900 justify-center items-center p-8 relative isolate">
        <div className="w-full max-w-[420px] p-8 sm:p-10 bg-white rounded-3xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-slate-100">
          
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Welcome strictly to VividFlow</h2>
            <p className="text-sm text-slate-500">Sign in to your account or create a new one securely.</p>
          </div>

          <button 
            onClick={handleGoogleAuth}
            className="w-full relative flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 relative z-10" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-slate-400">or</span>
            </div>
          </div>

          <form onSubmit={step === 'email' ? handleSendCode : handleVerifyOTP} className="space-y-5">
            {step === 'email' && (
              <div className="space-y-1.5 opacity-100 transition-opacity duration-300">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Work Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all duration-200 text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            {step === 'otp' && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <label htmlFor="otp" className="block flex justify-between text-sm font-medium text-slate-700">
                  <span>6-digit OTP</span>
                  <button 
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setIsOtpSent(false);
                      setTimer(0);
                    }}
                    className="text-purple-600 hover:text-purple-700 text-xs font-semibold"
                  >
                    Edit Email
                  </button>
                </label>
                <div className="relative">
                  <input
                    id="otp"
                    ref={otpInputRef}
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all duration-200 text-slate-900 tracking-[0.5em] text-center font-mono text-lg placeholder:text-sm placeholder:tracking-normal placeholder:text-slate-400"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <ShieldCheck className="w-5 h-5 opacity-50" />
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs mt-2">
                  <p className="text-slate-500">
                    We've sent a code to <span className="font-medium text-slate-700">{email}</span>
                  </p>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={timer > 0 || isLoading}
                    className="text-purple-600 hover:text-purple-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {timer > 0 ? `Resend in ${timer}s` : "Didn't receive code? Try again"}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || (step === 'email' ? !email : otp.length !== 6)}
              className="group relative w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {step === 'email' ? 'Send Verification Code' : 'Verify & Continue'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            </button>
          </form>

        </div>
        
      </div>

    </div>
  );
}
