import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Settings, BarChart3, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Orders', path: '/orders', icon: ShoppingCart },
    { name: 'Configure', path: '/configure', icon: Settings },
  ];

  return (
    <aside className="w-72 bg-[var(--bg-sidebar)] border-r border-[var(--border-main)] flex flex-col shadow-sm z-40 transition-colors duration-300">
      <div className="p-8">
        <div className="flex items-center gap-4 text-primary group cursor-pointer" onClick={() => navigate('/')}>
          <div className="p-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
            <img src="/logo.png" alt="Lumina Logo" className="w-10 h-10 object-contain" />
          </div>
          <span className="text-2xl font-black tracking-tight text-[var(--text-main)] group-hover:text-primary transition-colors">Lumina</span>
        </div>
      </div>
      
      <nav className="flex-1 mt-6 px-4 space-y-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-primary text-white font-bold shadow-lg shadow-primary/20 scale-[1.02]' 
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-active)]/10 hover:text-[var(--text-main)] hover:translate-x-1'
              }`
            }
          >
            <item.icon size={22} className="transition-colors" />
            <span className="text-[15px]">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-6 border-t border-[var(--border-main)] space-y-6">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-5 py-3.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-2xl transition-all duration-300 group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            {isDarkMode ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-amber-500" />}
            <span className="text-sm font-bold text-[var(--text-main)]">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${isDarkMode ? 'bg-primary' : 'bg-slate-200'}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </div>
        </button>

        <div className="flex items-center gap-4 px-2">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[var(--bg-sidebar)] shadow-sm"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[var(--text-main)] truncate">{user?.name || 'User'}</p>
            <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">Premium Admin</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-3.5 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-2xl transition-all duration-300 text-sm font-bold group border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
        >
          <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
