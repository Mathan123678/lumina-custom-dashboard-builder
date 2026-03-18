import { Bell, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, searchTerm, setSearchTerm, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-20 border-b border-[var(--border-main)] bg-[var(--bg-card)]/80 backdrop-blur-2xl sticky top-0 z-30 px-8 flex items-center justify-between shadow-sm transition-colors duration-300">
      <div className="flex items-center gap-4 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-2xl px-5 py-2.5 w-[450px] focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-[var(--bg-card)] transition-all shadow-inner">
        <Search size={20} className="text-[var(--text-muted)]" />
        <input 
          type="text" 
          placeholder="Quick search for anything..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none outline-none text-[15px] w-full text-[var(--text-main)] placeholder:text-[var(--text-muted)] font-medium"
        />
      </div>
      
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4">
          <button className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all relative group">
            <Bell size={22} />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white ring-4 ring-primary/5 transition-all"></span>
          </button>
        </div>
        
        <div className="h-10 w-[1px] bg-[var(--border-main)]"></div>
        
        <div className="flex items-center gap-4 cursor-pointer group">
          <div className="flex flex-col items-end text-right">
            <span className="text-sm font-bold text-[var(--text-main)] group-hover:text-primary transition-colors">{user?.name || 'Account'}</span>
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-tighter">{user?.organization || 'System Admin'}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-800 p-[1px] group-hover:rotate-6 transition-transform">
            <div className="w-full h-full rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-primary border border-[var(--border-main)]">
              <User size={20} />
            </div>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-[var(--border-main)]"></div>

        <button 
          onClick={handleLogout}
          title="Logout"
          className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-xl transition-all"
        >
          <LogOut size={22} className="hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </header>
  );
};

export default Header;
