import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, BarChart3 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
      <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center gap-4 text-primary mb-6 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="p-1 bg-[var(--bg-card)] rounded-xl shadow-sm group-hover:shadow-md transition-all duration-500">
              <img src="/logo.png" alt="InsightGrid Logo" className="w-12 h-12 object-contain" />
            </div>
            <span className="text-4xl font-black tracking-tight text-[var(--text-main)] group-hover:text-primary transition-colors">InsightGrid</span>
          </div>
          <h1 className="text-3xl font-extrabold text-primary mb-2">Welcome Back</h1>
          <p className="text-slate-500 font-medium tracking-tight">Access your professional analytics suite</p>
        </div>

        <div className="bg-[var(--bg-card)] backdrop-blur-2xl border border-[var(--border-main)] p-10 rounded-[2.5rem] shadow-premium transition-colors">
          {error && (
            <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="space-y-2.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all font-medium placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Password</label>
                <a href="#" className="text-xs text-primary font-bold hover:underline underline-offset-4">Forgot password?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all font-medium placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-black py-4 rounded-2xl hover:bg-primary-hover transition-all flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 transform active:scale-95 disabled:opacity-50 mt-4"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={20} />
                  Authorize Session
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm font-medium">
              New to Halleyx?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline underline-offset-4 ml-1">Create Account</Link>
            </p>
          </div>
        </div>
        
        <p className="mt-10 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] opacity-50">
          &copy; 2026 Lumina Analytics &bull; Enterprise Grade
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
