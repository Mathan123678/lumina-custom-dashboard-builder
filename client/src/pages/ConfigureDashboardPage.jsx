import { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Save, ChevronLeft, Settings2, Trash2, Layout, BarChart, PieChart, Table as TableIcon, Hash, TrendingUp, AreaChart, Dot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dashboardService, orderService } from '../services/api';
import { openOrdersStream } from '../services/realtime';
import WidgetSettingsPanel from '../components/dashboard/WidgetSettingsPanel';
import KPIWidget from '../components/dashboard/KPIWidget';
import ChartWidget from '../components/dashboard/ChartWidget';
import TableWidget from '../components/dashboard/TableWidget';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const ConfigureDashboardPage = () => {
  const [widgets, setWidgets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [configRes, ordersRes] = await Promise.all([
          dashboardService.getConfig(),
          orderService.getAll()
        ]);
        setWidgets(configRes.data.widgets || []);
        setOrders(ordersRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Keep widget previews fresh while editing (SSE; fallback to polling)
  useEffect(() => {
    const stream = openOrdersStream();
    if (stream) {
      const onOrdersChanged = () => {
        orderService.getAll().then((res) => setOrders(res.data)).catch(() => {});
      };
      stream.addEventListener('orders_changed', onOrdersChanged);
      return () => stream.close();
    }

    const intervalMs = 5000;
    const id = setInterval(() => {
      orderService.getAll().then((res) => setOrders(res.data)).catch(() => {});
    }, intervalMs);
    return () => clearInterval(id);
  }, []);

  const handleLayoutChange = (currentLayout, allLayouts) => {
    // IMPORTANT: use functional setState so rapid drag/resize events never lose updates.
    setWidgets((prevWidgets) =>
      prevWidgets.map((w) => {
        const nextLayouts = { ...(w.layouts || {}) };

        if (allLayouts) {
          Object.entries(allLayouts).forEach(([bp, bpLayout]) => {
            const item = bpLayout?.find((l) => l.i === w.id);
            if (item) nextLayouts[bp] = { x: item.x, y: item.y, w: item.w, h: item.h };
          });
        }

        // Keep a single fallback layout (for older configs / server-side compatibility)
        const item = currentLayout?.find((l) => l.i === w.id);
        const fallbackLayout = item ? { x: item.x, y: item.y, w: item.w, h: item.h } : w.layout;

        return { ...w, layout: fallbackLayout, layouts: nextLayouts };
      })
    );
  };

  const getWidgetConstraints = (type) => {
    if (type === 'kpi') {
      return { minW: 2, maxW: 6, minH: 2, maxH: 3 };
    }
    if (type === 'table') {
      return { minW: 4, maxW: 12, minH: 4, maxH: 10 };
    }
    // charts
    return { minW: 4, maxW: 12, minH: 4, maxH: 8 };
  };

  const addWidget = (type, layout = null) => {
    const id = `widget_${Date.now()}`;
    let defaultW = 4;
    let defaultH = 4;

    if (type === 'kpi') {
      defaultW = 2;
      defaultH = 2;
    } else if (['bar', 'line', 'area', 'scatter'].includes(type)) {
      defaultW = 5;
      defaultH = 5;
    } else if (type === 'pie' || type === 'table') {
      defaultW = 4;
      defaultH = 4;
    }

    const newWidget = {
      id,
      type,
      title: `Untitled ${type.toUpperCase()}`,
      description: '',
      layout: layout || { x: (widgets.length * 2) % 12, y: 1000, w: defaultW, h: defaultH },
      layouts: {
        lg: layout || { x: (widgets.length * 2) % 12, y: 1000, w: defaultW, h: defaultH }
      },
      settings: {
        metric: 'Total amount',
        aggregation: 'sum',
        format: 'currency',
        precision: 0,
        xAxis: type === 'pie' ? 'Status' : 'Product',
        yAxis: 'Total amount',
        color: '#54bd95',
        showLabel: false,
        showLegend: true,
        columns: ['Customer name', 'Product', 'Total amount', 'Status'],
        sort: 'Descending',
        pagination: 5,
        fontSize: 14,
        headerBgColor: '#54bd95',
        applyFilter: false,
        filters: []
      }
    };
    setWidgets([...widgets, newWidget]);
    setSelectedWidgetId(id);
  };

  const onDrop = (layout, layoutItem, _event) => {
    const type = _event.dataTransfer.getData('widgetType');
    if (type) {
      addWidget(type, { ...layoutItem, i: undefined });
    }
  };

  const deleteWidget = (id) => {
    if (window.confirm('Are you sure you want to delete this widget?')) {
      setWidgets(widgets.filter(w => w.id !== id));
      if (selectedWidgetId === id) setSelectedWidgetId(null);
    }
  };

  const updateWidget = (updatedWidget) => {
    setWidgets(widgets.map(w => w.id === updatedWidget.id ? updatedWidget : w));
  };

  const saveConfiguration = async () => {
    try {
      setSaving(true);
      await dashboardService.saveConfig({ widgets });
      navigate('/');
    } catch (error) {
      console.error('Failed to save config:', error);
      alert('Failed to save dashboard configuration');
    } finally {
      setSaving(false);
    }
  };

  const selectedWidget = widgets.find(w => w.id === selectedWidgetId);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col -m-6 transition-colors duration-300">
      {/* Top Bar - Adjusted to Premium Theme */}
      <div className="h-16 bg-[var(--bg-card)] border-b border-[var(--border-main)] flex items-center justify-between px-6 z-20 shadow-sm transition-colors">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-black text-[var(--text-main)] flex items-center gap-3">
            <img src="/logo.png" alt="Lumina" className="w-8 h-8 object-contain" />
            Lumina Custom Dashboard Builder
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[var(--bg-main)] rounded-lg p-1 border border-[var(--border-main)] mr-4 transition-colors">
            <button 
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData('widgetType', 'kpi');
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onClick={() => addWidget('kpi')} 
              className="p-2 text-[var(--text-muted)] hover:text-primary hover:bg-[var(--bg-card)] rounded transition-all flex items-center gap-2 text-xs font-bold cursor-grab active:cursor-grabbing" title="Drag to add KPI">
              <Hash size={14} /> KPI
            </button>
            <button 
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData('widgetType', 'bar');
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onClick={() => addWidget('bar')} 
              className="p-2 text-[var(--text-muted)] hover:text-primary hover:bg-[var(--bg-card)] rounded transition-all flex items-center gap-2 text-xs font-bold cursor-grab active:cursor-grabbing" title="Drag to add Bar Chart">
              <BarChart size={14} /> Bar
            </button>
            <button 
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData('widgetType', 'line');
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onClick={() => addWidget('line')} 
              className="p-2 text-[var(--text-muted)] hover:text-primary hover:bg-[var(--bg-card)] rounded transition-all flex items-center gap-2 text-xs font-bold cursor-grab active:cursor-grabbing" title="Drag to add Line Chart">
              <TrendingUp size={14} /> Line
            </button>
            <button 
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData('widgetType', 'area');
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onClick={() => addWidget('area')} 
              className="p-2 text-[var(--text-muted)] hover:text-primary hover:bg-[var(--bg-card)] rounded transition-all flex items-center gap-2 text-xs font-bold cursor-grab active:cursor-grabbing" title="Drag to add Area Chart">
              <AreaChart size={14} /> Area
            </button>
            <button 
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData('widgetType', 'pie');
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onClick={() => addWidget('pie')} 
              className="p-2 text-[var(--text-muted)] hover:text-primary hover:bg-[var(--bg-card)] rounded transition-all flex items-center gap-2 text-xs font-bold cursor-grab active:cursor-grabbing" title="Drag to add Pie Chart">
              <PieChart size={14} /> Pie
            </button>
            <button 
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData('widgetType', 'scatter');
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onClick={() => addWidget('scatter')} 
              className="p-2 text-[var(--text-muted)] hover:text-primary hover:bg-[var(--bg-card)] rounded transition-all flex items-center gap-2 text-xs font-bold cursor-grab active:cursor-grabbing" title="Drag to add Scatter Plot">
              <Dot size={14} /> Scatter
            </button>
            <button 
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData('widgetType', 'table');
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onClick={() => addWidget('table')} 
              className="p-2 text-[var(--text-muted)] hover:text-primary hover:bg-[var(--bg-card)] rounded transition-all flex items-center gap-2 text-xs font-bold cursor-grab active:cursor-grabbing" title="Drag to add Table">
              <TableIcon size={14} /> Table
            </button>
          </div>
          
          <button 
            onClick={saveConfiguration}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all shadow-md disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-12 bg-[var(--bg-main)] relative transition-colors duration-300">
          {/* Grid lines background */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
          </div>

          {widgets.length === 0 ? (
            <div className="flex-1 bg-white rounded-3xl border border-slate-200 border-dashed relative overflow-hidden flex flex-col items-center justify-center p-12 text-center group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.02)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mb-8 border border-slate-100 shadow-sm transform group-hover:rotate-12 transition-transform">
                <Plus size={40} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight flex items-center gap-3">
                  <img src="/logo.png" alt="Lumina" className="w-10 h-10 object-contain" />
                  Lumina Analytics Dashboard
                </h1>
                <p className="text-[var(--text-muted)] mt-1 font-medium ml-1">Real-time insights from your customer order data.</p>
              </div>
              <p className="text-slate-500 max-w-xs mb-10 font-medium">
                Drag widgets from the sidebar to start building your custom analytics layout.
              </p>
            </div>
          ) : (
            <ResponsiveGridLayout
              className="layout"
              layouts={{
                lg: widgets.map((w) => ({ ...(w.layouts?.lg || w.layout), i: w.id, ...getWidgetConstraints(w.type) })),
                md: widgets.map((w) => ({ ...(w.layouts?.md || w.layout), i: w.id, ...getWidgetConstraints(w.type) })),
                sm: widgets.map((w) => ({ ...(w.layouts?.sm || w.layout), i: w.id, ...getWidgetConstraints(w.type) })),
                xs: widgets.map((w) => ({ ...(w.layouts?.xs || w.layout), i: w.id, ...getWidgetConstraints(w.type) })),
                xxs: widgets.map((w) => ({ ...(w.layouts?.xxs || w.layout), i: w.id, ...getWidgetConstraints(w.type) })),
              }}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 12, md: 8, sm: 4, xs: 2, xxs: 1 }}
              rowHeight={100}
              onLayoutChange={handleLayoutChange}
              draggableHandle=".drag-handle"
              isDraggable
              isResizable
              isDroppable
              onDrop={onDrop}
              droppingItem={{ i: 'dropping-placeholder', w: 4, h: 4 }}
              resizeHandles={['se', 'e', 's']}
            >
              {widgets.map((widget) => (
                <div key={widget.id} className={`group relative bg-[var(--bg-card)] border ${selectedWidgetId === widget.id ? 'border-primary ring-2 ring-primary/10' : 'border-[var(--border-main)]'} rounded-2xl overflow-hidden shadow-sm transition-all`}>
                  {/* Hover Controls */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setSelectedWidgetId(widget.id)}
                      className="p-1.5 bg-white text-slate-400 hover:text-slate-900 rounded-lg border border-slate-200 shadow-sm"
                    >
                      <Settings2 size={14} />
                    </button>
                    <button 
                      onClick={() => deleteWidget(widget.id)}
                      className="p-1.5 bg-slate-800 text-rose-500 hover:bg-rose-600 hover:text-white rounded-lg border border-slate-700 shadow-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Drag Handle */}
                  <div className="drag-handle absolute inset-x-0 top-0 h-8 cursor-move opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 flex items-center justify-center">
                    <div className="w-12 h-1 bg-primary/20 rounded-full"></div>
                  </div>

                  {/* Widget Content */}
                  <div className="w-full h-full" onClick={() => setSelectedWidgetId(widget.id)}>
                    {widget.type === 'kpi' && <KPIWidget settings={widget.settings} data={orders} title={widget.title} />}
                    {['bar', 'line', 'pie', 'area', 'scatter'].includes(widget.type) && (
                      <ChartWidget type={widget.type} settings={widget.settings} data={orders} title={widget.title} />
                    )}
                    {widget.type === 'table' && <TableWidget settings={widget.settings} data={orders} title={widget.title} />}
                  </div>
                </div>
              ))}
            </ResponsiveGridLayout>
          )}
        </div>

        {/* Settings Panel */}
        {selectedWidget && (
          <WidgetSettingsPanel 
            widget={selectedWidget} 
            onUpdate={updateWidget} 
            onClose={() => setSelectedWidgetId(null)} 
          />
        )}
      </div>
    </div>
  );
};

export default ConfigureDashboardPage;
