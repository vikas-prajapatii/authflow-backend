import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Key, 
  Send, 
  RefreshCw, 
  ArrowRight, 
  UserPlus, 
  Check, 
  LogOut,
  Terminal,
  ExternalLink
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('login');
  const [registerEmail, setRegisterEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [consoleLogs, setConsoleLogs] = useState([
    { time: new Date().toLocaleTimeString(), message: 'AuthFlow React Portal Client initialized.', type: 'info' }
  ]);

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form States
  const [registerName, setRegisterName] = useState('');
  const [registerFormEmail, setRegisterFormEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // OTP Form States
  const [otpCode, setOtpCode] = useState('');

  // Forgot Form States
  const [forgotEmail, setForgotEmail] = useState('');

  // Reset Form States
  const [newPassword, setNewPassword] = useState('');

  // Profile States
  const [accessToken, setAccessToken] = useState('');
  const [profileResult, setProfileResult] = useState('');

  const consoleEndRef = useRef(null);

  // Check URL parameters on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setResetToken(token);
      setActiveTab('reset');
      addLog('Detected password reset token in URL parameters.', 'success');
    }

    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setAccessToken(storedToken);
    }
  }, []);

  // Scroll console to bottom
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLogs]);

  const addLog = (message, type = 'info') => {
    setConsoleLogs(prev => [...prev, {
      time: new Date().toLocaleTimeString(),
      message,
      type
    }]);
  };

  const clearConsole = () => {
    setConsoleLogs([{ time: new Date().toLocaleTimeString(), message: 'Console cleared.', type: 'info' }]);
  };

  const handleTokenChange = (e) => {
    const value = e.target.value.trim();
    setAccessToken(value);
    if (value) {
      localStorage.setItem('accessToken', value);
      addLog('Manual Access Token updated in localStorage.', 'success');
    } else {
      localStorage.removeItem('accessToken');
      addLog('Access Token cleared from localStorage.', 'info');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken('');
    setProfileResult('');
    addLog('Successfully logged out.', 'info');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      addLog('Missing email or password.', 'error');
      return;
    }

    addLog('Calling POST /api/auth/login...');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        addLog('Login successful!', 'success');
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        setAccessToken(data.data.accessToken);
        setActiveTab('profile');
      } else {
        addLog(`Login Failed: ${data.message || 'Invalid credentials'}`, 'error');
      }
    } catch (err) {
      addLog(`Network Error: ${err.message}`, 'error');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerName || !registerFormEmail || !registerPassword) {
      addLog('Missing registration details.', 'error');
      return;
    }

    addLog('Calling POST /api/auth/register...');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: registerName, email: registerFormEmail, password: registerPassword })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        addLog('Registration successful! OTP code sent to your email.', 'success');
        setRegisterEmail(registerFormEmail);
        setActiveTab('otp');
      } else {
        addLog(`Registration Failed: ${data.message}`, 'error');
      }
    } catch (err) {
      addLog(`Network Error: ${err.message}`, 'error');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode) {
      addLog('Please enter the OTP code.', 'error');
      return;
    }

    addLog('Calling POST /api/auth/verify-otp...');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registerEmail, code: otpCode })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        addLog('Email verified and account activated successfully!', 'success');
        setActiveTab('login');
      } else {
        addLog(`Verification Failed: ${data.message}`, 'error');
      }
    } catch (err) {
      addLog(`Network Error: ${err.message}`, 'error');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      addLog('Please enter your email.', 'error');
      return;
    }

    addLog('Calling POST /api/auth/forgot-password...');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        addLog('Password reset link sent to your email!', 'success');
      } else {
        addLog(`Request Failed: ${data.message}`, 'error');
      }
    } catch (err) {
      addLog(`Network Error: ${err.message}`, 'error');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      addLog('Please enter your new password.', 'error');
      return;
    }

    addLog('Calling POST /api/auth/reset-password...');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password: newPassword })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        addLog('Password updated successfully! Redirecting to login...', 'success');
        setTimeout(() => {
          window.history.replaceState({}, document.title, window.location.pathname);
          setActiveTab('login');
        }, 2000);
      } else {
        addLog(`Reset Failed: ${data.message}`, 'error');
      }
    } catch (err) {
      addLog(`Network Error: ${err.message}`, 'error');
    }
  };

  const fetchProfile = async () => {
    if (!accessToken) {
      addLog('Cannot fetch profile: No token stored or provided.', 'error');
      return;
    }

    addLog('Calling GET /api/auth/profile with Bearer Token...');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (res.ok) {
        const text = await res.text();
        addLog('Profile retrieved successfully!', 'success');
        setProfileResult(text);
      } else {
        addLog(`Request Failed with status: ${res.status}`, 'error');
        setProfileResult(`Error ${res.status}: Unauthorized`);
      }
    } catch (err) {
      addLog(`Network Error: ${err.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-6">
      {/* Navbar Header */}
      <header className="w-full max-w-5xl mx-auto flex justify-between items-center py-4 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400">
              AuthFlow
            </h1>
            <p className="text-xs text-slate-400">React Client Edition</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-xs font-semibold text-cyan-400 tracking-widest uppercase">
            React Active
          </span>
        </div>
      </header>

      {/* Main Workspace Card */}
      <main className="flex-grow flex items-center justify-center my-8">
        <div className="w-full max-w-md glass-cyan glow-cyan rounded-3xl p-8 space-y-8 relative overflow-hidden">
          {/* Cyan blur orb */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Tab Navigation (Except OTP/Reset modes) */}
          {activeTab !== 'otp' && activeTab !== 'reset' && (
            <div className="flex border-b border-slate-800">
              {['login', 'register', 'forgot', 'profile'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                    activeTab === tab 
                      ? 'border-cyan-500 text-cyan-400 font-bold' 
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab === 'forgot' ? 'Forgot' : tab}
                </button>
              ))}
            </div>
          )}

          {/* VIEW: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-cyan-500 transition-all text-slate-200 placeholder-slate-650"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-cyan-500 transition-all text-slate-200 placeholder-slate-650"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 flex items-center justify-center gap-2 text-sm"
              >
                Sign In <ArrowRight className="w-4 h-4" />
              </button>

              <div className="relative flex items-center justify-center my-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-800"></span></div>
                <span className="relative bg-slate-950 px-3 text-[10px] uppercase font-bold tracking-widest text-slate-500">Or Auth With</span>
              </div>

              <a
                href="http://localhost:8080/oauth2/authorization/google"
                className="w-full bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-200 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2.5 text-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google Authentication
              </a>
            </form>
          )}

          {/* VIEW: REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-cyan-500 transition-all text-slate-200 placeholder-slate-650"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={registerFormEmail}
                    onChange={(e) => setRegisterFormEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-cyan-500 transition-all text-slate-200 placeholder-slate-650"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-cyan-500 transition-all text-slate-200 placeholder-slate-650"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 flex items-center justify-center gap-2 text-sm"
              >
                Create Account <UserPlus className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* VIEW: OTP */}
          {activeTab === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center space-y-2">
                <Key className="w-10 h-10 text-cyan-400 mx-auto" />
                <h3 className="text-lg font-bold text-slate-100">Activate Account</h3>
                <p className="text-xs text-slate-400">Verification OTP code has been dispatched to <b>{registerEmail}</b>.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block text-center">OTP Code</label>
                <input
                  type="text"
                  maxLength="6"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="000000"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 text-center text-lg font-extrabold tracking-widest focus:outline-none focus:border-cyan-500 transition-all text-cyan-400 placeholder-slate-700"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                Validate OTP <Check className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* VIEW: FORGOT PASSWORD */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div className="text-center space-y-2">
                <Lock className="w-10 h-10 text-cyan-400 mx-auto" />
                <h3 class="text-lg font-bold text-slate-100">Reset Credentials</h3>
                <p className="text-xs text-slate-400">Enter your address to receive a secure password reset link.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-cyan-500 transition-all text-slate-200 placeholder-slate-650"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                Email Reset Link <Send className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* VIEW: RESET PASSWORD */}
          {activeTab === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="text-center space-y-2">
                <RefreshCw className="w-10 h-10 text-cyan-400 mx-auto" />
                <h3 className="text-lg font-bold text-slate-100">Set New Password</h3>
                <p className="text-xs text-slate-400">Enter a secure, unique password below.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-cyan-500 transition-all text-slate-200 placeholder-slate-650"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                Apply Password <Check className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* VIEW: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div className="bg-slate-950/70 border border-slate-850 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Bearer JWT Token</span>
                  {accessToken && (
                    <button type="button" onClick={handleLogout} className="text-rose-450 hover:underline flex items-center gap-1">
                      Log Out <LogOut className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <textarea
                  value={accessToken}
                  onChange={handleTokenChange}
                  placeholder="No JWT token detected. Complete Login/OAuth, or paste an accessToken here."
                  className="w-full h-24 bg-slate-950 border border-slate-900 rounded-xl p-3 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500 placeholder-slate-750 resize-none"
                />
              </div>

              <button
                type="button"
                onClick={fetchProfile}
                className="w-full bg-slate-800 hover:bg-slate-755 text-slate-100 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                Query Profile Endpoint <RefreshCw className="w-4 h-4" />
              </button>

              {profileResult && (
                <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-xs font-mono text-cyan-300 text-center select-all">
                  Authenticated User Email:<br />
                  <span className="text-slate-100 font-bold text-sm block mt-1">{profileResult}</span>
                </div>
              )}
            </div>
          )}

          {/* Log Output Console */}
          <div className="border-t border-slate-900 pt-6 space-y-3">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" /> API Transaction Logs</span>
              <button type="button" onClick={clearConsole} className="hover:text-slate-350">Clear</button>
            </div>
            <div className="h-28 bg-slate-950 border border-slate-900/60 rounded-2xl p-3 text-[10px] font-mono space-y-1.5 overflow-y-auto">
              {consoleLogs.map((log, idx) => (
                <div key={idx} className={
                  log.type === 'success' ? 'text-emerald-400' :
                  log.type === 'error' ? 'text-rose-400' : 'text-cyan-300/80'
                }>
                  [{log.time}] {log.message}
                </div>
              ))}
              <div ref={consoleEndRef} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="w-full max-w-5xl mx-auto flex justify-between items-center text-[10px] text-slate-500 py-4 px-2">
        <p>&copy; 2026 AuthFlow Client Portal. Standalone React Client.</p>
        <a href="https://github.com/vikas-prajapatii/authflow-backend" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-cyan-400">
          Source Repository <ExternalLink className="w-3 h-3" />
        </a>
      </footer>
    </div>
  );
}
