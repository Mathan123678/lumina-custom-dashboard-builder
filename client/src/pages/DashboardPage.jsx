import { useState, useEffect, useCallback } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Settings, Plus, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService, orderService } from '../services/api';
import { openOrdersStream } from '../services/realtime';
import KPIWidget from '../components/dashboard/KPIWidget';
import ChartWidget from '../components/dashboard/ChartWidget';
import TableWidget from '../components/dashboard/TableWidget';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const DashboardPage = () => {
  const [config, setConfig] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('All time');
  const { searchTerm } = useAuth();
  const navigate = useNavigate();

  const refreshDashboardData = useCallback(async ({ showSpinner } = { showSpinner: false }) => {
    try {
      if (showSpinner) setLoading(true);
      const [configRes, ordersRes] = await Promise.all([
        dashboardService.getConfig({ t: Date.now() }),
        orderService.getAll()
      ]);
      setConfig(configRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDashboardData({ showSpinner: true });
  }, [refreshDashboardData]);

  // Live updates: prefer SSE; fall back to polling.
  useEffect(() => {
    const stream = openOrdersStream();
    if (stream) {
      const onOrdersChanged = () => refreshDashboardData({ showSpinner: false });
      stream.addEventListener('orders_changed', onOrdersChanged);
      return () => stream.close();
    }

    const intervalMs = 5000;
    const id = setInterval(() => {
      refreshDashboardData({ showSpinner: false });
    }, intervalMs);
    return () => clearInterval(id);
  }, [refreshDashboardData]);

  const filteredOrders = orders.filter(order => {
    // Date Filtering
    let dateMatch = true;
    if (dateFilter !== 'All time') {
      const orderDate = new Date(order.orderInfo?.orderDate || order.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now - orderDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (dateFilter === 'Today') dateMatch = diffDays <= 1;
      else if (dateFilter === 'Last 7 Days') dateMatch = diffDays <= 7;
      else if (dateFilter === 'Last 30 Days') dateMatch = diffDays <= 30;
      else if (dateFilter === 'Last 90 Days') dateMatch = diffDays <= 90;
    }

    // Search Filtering
    const term = (searchTerm || '').toLowerCase().trim();
    const matchesSearch = term === '' || (
      order.customerInfo?.firstName?.toLowerCase().includes(term) ||
      order.customerInfo?.lastName?.toLowerCase().includes(term) ||
      order.customerInfo?.email?.toLowerCase().includes(term) ||
      order.orderInfo?.product?.toLowerCase().includes(term)
    );

    return dateMatch && matchesSearch;
  });

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const widgets = config?.widgets || [];
  
  const hasSavedResponsiveLayouts = widgets.some((w) => w.layouts && Object.keys(w.layouts).length > 0);

  // Dynamic Layout Generator for standard "KPIs Top -> Charts Middle -> Table Bottom" look
  const generateLayouts = () => {
    const breakpoints = { lg: 12, md: 8, sm: 4, xs: 2, xxs: 1 };
    const layouts = {};

    Object.entries(breakpoints).forEach(([bp, cols]) => {
      let currentY = 0;
      let currentX = 0;

      // Group widgets by section
      const kpis = widgets.filter(w => w.type === 'kpi');
      const charts = widgets
        .filter(w => ['bar', 'line', 'pie', 'area', 'scatter'].includes(w.type))
        .sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      const tables = widgets.filter(w => w.type === 'table');

      // 1. Position KPIs (Top Section)
      const kpiLayouts = kpis.map((w) => {
        const w_size = bp === 'xxs' ? 1 : (bp === 'sm' || bp === 'xs') ? 2 : 3;
        if (currentX + w_size > cols) {
          currentX = 0;
          currentY += 3;
        }
        const layout = { i: w.id, x: currentX, y: currentY, w: w_size, h: 3 };
        currentX += w_size;
        return layout;
      });

      if (kpis.length > 0 && currentX > 0) currentY += 3;
      currentX = 0;

      // 2. Position Charts (Middle Section - Side by Side)
      const chartLayouts = charts.map((w) => {
        const w_size = (bp === 'sm' || bp === 'xs' || bp === 'xxs') ? cols : cols / 2;
        if (currentX + w_size > cols) {
          currentX = 0;
          currentY += 5;
        }
        const layout = { i: w.id, x: currentX, y: currentY, w: w_size, h: 5 };
        currentX += w_size;
        return layout;
      });

      // Advance currentY to start of table section if we had charts
      if (charts.length > 0) {
        currentY += 5;
      }
      currentX = 0;

      // 3. Position Tables (Bottom Section)
      const tableLayouts = tables.map((w) => {
        const layout = { i: w.id, x: 0, y: currentY, w: cols, h: 8 };
        currentY += 8;
        return layout;
      });

      layouts[bp] = [...kpiLayouts, ...chartLayouts, ...tableLayouts];

      // Absolute safety: if somehow a widget ID is missing, push it with its original relative position
      widgets.forEach(w => {
        if (!layouts[bp].some(l => l.i === w.id)) {
          layouts[bp].push({ i: w.id, x: 0, y: currentY, w: cols, h: (w.type === 'table' ? 8 : (w.type === 'kpi' ? 3 : 5)) });
          currentY += (w.type === 'table' ? 8 : (w.type === 'kpi' ? 3 : 5));
        }
      });
    });

    return layouts;
  };


  const dynamicLayouts = hasSavedResponsiveLayouts
    ? {
        lg: widgets.map((w) => ({ ...(w.layouts?.lg || w.layout), i: w.id })),
        md: widgets.map((w) => ({ ...(w.layouts?.md || w.layout), i: w.id })),
        sm: widgets.map((w) => ({ ...(w.layouts?.sm || w.layout), i: w.id })),
        xs: widgets.map((w) => ({ ...(w.layouts?.xs || w.layout), i: w.id })),
        xxs: widgets.map((w) => ({ ...(w.layouts?.xxs || w.layout), i: w.id })),
      }
    : generateLayouts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight flex items-center gap-3">
            <img src="/logo.png" alt="InsightGrid" className="w-10 h-10 object-contain" />
            InsightGrid Analytics Dashboard
          </h1>
          <p className="text-[var(--text-muted)] mt-1 font-medium ml-1">Real-time insights from your customer order data.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg px-3 py-2 shadow-sm transition-colors">
            <Calendar size={18} className="text-[var(--text-muted)]" />
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent text-sm text-[var(--text-main)] outline-none cursor-pointer font-bold"
            >
              <option className="bg-[var(--bg-card)] text-[var(--text-main)]">All time</option>
              <option className="bg-[var(--bg-card)] text-[var(--text-main)]">Today</option>
              <option className="bg-[var(--bg-card)] text-[var(--text-main)]">Last 7 Days</option>
              <option className="bg-[var(--bg-card)] text-[var(--text-main)]">Last 30 Days</option>
              <option className="bg-[var(--bg-card)] text-[var(--text-main)]">Last 90 Days</option>
            </select>
          </div>
          
          <button 
            onClick={() => navigate('/configure')}
            className="flex items-center gap-2 px-6 py-2 bg-[var(--bg-card)] text-[var(--text-main)] font-bold rounded-lg hover:bg-[var(--bg-main)] transition-all border border-[var(--border-main)] shadow-sm"
          >
            <Settings size={18} className="text-[var(--text-muted)]" />
            Configure Dashboard
          </button>
        </div>
      </div>

      {widgets.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-20 flex flex-col items-center justify-center text-center shadow-premium relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.02)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mb-8 border border-slate-100 shadow-sm transform group-hover:rotate-12 transition-transform">
            <Plus size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tighter">No widgets added yet</h2>
          <p className="text-slate-500 max-w-md mb-10 font-medium">
            Your dashboard is currently empty. Start building your custom analytics views by adding widgets.
          </p>
          <button 
            onClick={() => navigate('/configure')}
            className="px-10 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 uppercase tracking-widest text-xs"
          >
            Configure Dashboard
          </button>
        </div>
      ) : (
        <ResponsiveGridLayout
          className="layout"
          layouts={dynamicLayouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 8, sm: 4, xs: 2, xxs: 1 }}
          rowHeight={100}
          isDraggable={false}
          isResizable={false}
          margin={[24, 24]}
        >
          {widgets.map((widget) => (
            <div key={widget.id} className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-3xl overflow-hidden shadow-sm flex flex-col hover:border-primary/30 transition-all hover:shadow-md">
              {widget.type === 'kpi' && <KPIWidget settings={widget.settings} data={filteredOrders} title={widget.title} />}
              {['bar', 'line', 'pie', 'area', 'scatter'].includes(widget.type) && (
                <ChartWidget type={widget.type} settings={widget.settings} data={filteredOrders} title={widget.title} />
              )}
              {widget.type === 'table' && <TableWidget settings={widget.settings} data={filteredOrders} title={widget.title} />}
            </div>
          ))}
        </ResponsiveGridLayout>
      )}
    </div>
  );
};

export default DashboardPage;
