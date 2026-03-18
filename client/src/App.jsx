import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import OrdersPage from './pages/OrdersPage';
import DashboardPage from './pages/DashboardPage';
import ConfigureDashboardPage from './pages/ConfigureDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function AppContent() {
  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 overflow-auto px-6 py-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/configure"
                element={
                  <ProtectedRoute>
                    <ConfigureDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;