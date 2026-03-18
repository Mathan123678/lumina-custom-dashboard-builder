import { useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, 
  PieChart, Pie, ScatterChart, Scatter, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, LabelList, Sector
} from 'recharts';

/**
 * Helper to determine if a data key represents a numeric value.
 * Used for aggregation logic and axis scaling.
 */
const isNumericKey = (key) => {
  return ['Quantity', 'Unit price', 'Total amount', 'Duration'].includes(key);
};

/**
 * Extracts and formats a specific field value from an order object.
 * Maps UI configuration keys to nested data paths.
 */
const getOrderValue = (order, key) => {
  if (!order) return 0;
  
  switch (key) {
    case 'Product': return order.orderInfo?.product ?? 'Unknown';
    case 'Quantity': return order.orderInfo?.quantity ?? 0;
    case 'Unit price': return order.orderInfo?.unitPrice ?? 0;
    case 'Total amount': return order.orderInfo?.totalAmount ?? 0;
    case 'Status': return order.orderInfo?.status ?? 'Unknown';
    case 'Created by': return order.orderInfo?.createdBy ?? 'Unknown';
    case 'Customer name': return `${order.customerInfo?.firstName ?? ''} ${order.customerInfo?.lastName ?? ''}`.trim() || 'Guest';
    case 'Duration': return order.orderInfo?.duration ?? 0;
    case 'Address': return order.customerInfo?.city ?? 'Unknown';
    case 'Order date': return new Date(order.orderInfo?.orderDate || order.createdAt).toLocaleDateString();
    default: return 0;
  }
};

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g style={{ cursor: 'pointer' }} className="active-slice-group">
      <style>{`
        @keyframes float-slice {
          0% { transform: translate(0px, 0px); }
          50% { transform: translate(${cos * 4}px, ${sin * 4}px); }
          100% { transform: translate(0px, 0px); }
        }
        .active-slice-group {
          animation: float-slice 3s ease-in-out infinite;
        }
      `}</style>
      
      {/* Center Status Display - Adjusted for Theme */}
      <circle cx={cx} cy={cy} r={innerRadius - 2} fill="var(--bg-card)" fillOpacity={0.9} />
      <circle cx={cx} cy={cy} r={innerRadius - 10} fill="none" stroke={fill} strokeWidth={1} opacity={0.3} />
      
      <text x={cx} y={cy} dy={-8} textAnchor="middle" fill={fill} style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em', filter: 'drop-shadow(0 0 8px ' + fill + '22)' }}>
        {payload.name}
      </text>
      <text x={cx} y={cy} dy={16} textAnchor="middle" fill="var(--text-muted)" style={{ fontSize: '11px', fontWeight: '800', opacity: 0.9 }}>
        {`${(percent * 100).toFixed(1)}% GROWTH`}
      </text>

      {/* 3D Depth - Side Faces */}
      <Sector
        cx={cx}
        cy={cy + 8}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.3}
      />
      
      {/* Top Interactive Surface */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        filter="url(#lighting)"
      />

      {/* Connection Architecture */}
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={3} strokeLinecap="round" opacity={0.6} />
      <circle cx={ex} cy={ey} r={5} fill={fill} stroke="#fff" strokeWidth={2} />
      
      {/* Detailed Callout Overlay */}
      <g style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}>
        <text 
          x={ex + (cos >= 0 ? 15 : -15)} 
          y={ey} 
          dy={5}
          textAnchor={textAnchor} 
          fill="var(--text-main)" 
          style={{ fontSize: '13px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          {`${value} TOTAL ORDERS`}
        </text>
      </g>
    </g>
  );
};




const ChartWidget = ({ type, settings, data, title }) => {
  const { xAxis, yAxis, color, showLabel, showLegend } = settings;
  const [activeIndex, setActiveIndex] = useState(-1);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  // Process data for Recharts
  const processData = () => {
    if (!data || data.length === 0) return [];

    if (type === 'pie') {
      // Aggregate by xAxis category, sum yAxis numeric values or just count if yAxis is non-numeric
      const grouped = data.reduce((acc, order) => {
        const key = String(getOrderValue(order, xAxis));
        const val = isNumericKey(yAxis) ? parseFloat(getOrderValue(order, yAxis)) : 1;
        acc[key] = (acc[key] || 0) + val;
        return acc;
      }, {});
      return Object.entries(grouped).map(([name, value]) => ({ name, value }));
    }

    // For bar, line, area, scatter: aggregate y-values per x-category
    const grouped = data.reduce((acc, order) => {
      const x = String(getOrderValue(order, xAxis));
      const y = parseFloat(getOrderValue(order, yAxis)) || 0;
      if (!acc[x]) acc[x] = { name: x, y: 0, count: 0 };
      acc[x].y += y;
      acc[x].count += 1;
      return acc;
    }, {});

    const result = Object.values(grouped);
    
    // Sort x-axis if it's numeric or date-like
    result.sort((a, b) => {
      if (!isNaN(a.name) && !isNaN(b.name)) return parseFloat(a.name) - parseFloat(b.name);
      return a.name.localeCompare(b.name);
    });

    return result;
  };

  const chartData = processData();
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];
  const chartColor = color || '#6366f1';

  const tooltipStyle = {
    contentStyle: { 
      backgroundColor: 'var(--bg-card)', 
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--border-main)', 
      borderRadius: '16px',
      boxShadow: 'var(--shadow-md)'
    },
    itemStyle: { color: 'var(--text-main)', fontSize: '13px', fontWeight: '700' },
    labelStyle: { color: 'var(--text-muted)', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }
  };

  const axisStyle = { 
    stroke: 'var(--border-main)', 
    fontSize: 9, 
    tickLine: false, 
    axisLine: false,
    tick: { fill: 'var(--text-muted)', fontWeight: '700' }
  };

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-slate-600 text-[10px] font-black uppercase tracking-widest italic">
          No data available
        </div>
      );
    }

    switch (type) {
      case 'bar':
        return (
          <BarChart data={chartData}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity={1} />
                <stop offset="100%" stopColor={chartColor} stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis 
              dataKey="name" 
              {...axisStyle} 
              height={60} 
              angle={-20} 
              textAnchor="end" 
              interval={0}
            />
            <YAxis {...axisStyle} />
            <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            {showLegend && <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px', fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }} />}
            <Bar dataKey="y" name={yAxis} fill="url(#barGradient)" radius={[6, 6, 0, 0]} animationDuration={1500}>
              {showLabel && <LabelList dataKey="y" position="top" style={{ fill: '#94a3b8', fontSize: 9, fontWeight: '800' }} />}
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis 
              dataKey="name" 
              {...axisStyle} 
              height={60} 
              angle={-20} 
              textAnchor="end" 
              interval={0}
            />
            <YAxis {...axisStyle} />
            <Tooltip {...tooltipStyle} />
            {showLegend && <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px', fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }} />}
            <Line 
              type="monotone" 
              dataKey="y" 
              name={yAxis} 
              stroke={chartColor} 
              strokeWidth={4} 
              dot={{ r: 4, fill: '#020617', stroke: chartColor, strokeWidth: 2 }} 
              activeDot={{ r: 7, strokeWidth: 0, fill: chartColor }}
              animationDuration={2000}
            >
              {showLabel && <LabelList dataKey="y" position="top" offset={10} style={{ fill: '#94a3b8', fontSize: 9, fontWeight: '800' }} />}
            </Line>
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`areaGrad-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3} />
            <XAxis 
              dataKey="name" 
              {...axisStyle} 
              height={60} 
              angle={-20} 
              textAnchor="end" 
              interval={0}
            />
            <YAxis {...axisStyle} />
            <Tooltip {...tooltipStyle} />
            {showLegend && <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px', fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }} />}
            <Area 
              type="monotone" 
              dataKey="y" 
              name={yAxis} 
              stroke={chartColor} 
              strokeWidth={3} 
              fillOpacity={1} 
              fill={`url(#areaGrad-${title.replace(/\s+/g, '')})`}
              animationDuration={2000}
            >
              {showLabel && <LabelList dataKey="y" position="top" offset={10} style={{ fill: '#94a3b8', fontSize: 9, fontWeight: '800' }} />}
            </Area>
          </AreaChart>
        );
      case 'pie':
        return (
          <PieChart className="animate-in zoom-in spin-in-12 duration-1000">
            <defs>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
                <feOffset dx="0" dy="12" result="offsetblur" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.6" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="lighting">
                <feSpecularLighting surfaceScale="5" specularConstant="0.8" specularExponent="25" lightingColor="#fff">
                  <fePointLight x="-5000" y="-10000" z="20000" />
                </feSpecularLighting>
                <feComposite in="SourceGraphic" operator="arithmetic" k1="1" k2="0" k3="1" k4="0" />
              </filter>
            </defs>
            
            {/* 3D Depth Foundation layer */}
            <Pie
              data={chartData}
              cx="50%"
              cy="53%"
              innerRadius={settings.innerRadius || 60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={1500}
              pointerEvents="none"
              legendType="none"
            >
              {chartData.map((_, index) => (
                <Cell 
                  key={`depth-${index}`} 
                  fill="#000" 
                  opacity={0.3} 
                />
              ))}
            </Pie>
            
            {/* Interactive 3D Surface */}
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={settings.innerRadius || 60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              onMouseEnter={onPieEnter}
              onClick={onPieEnter}
              onMouseLeave={() => setActiveIndex(-1)}
              stroke="none"
              animationBegin={0}
              animationDuration={1500}
              isAnimationActive={true}
              className="outline-none"
            >
              {chartData.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  style={{ 
                    filter: activeIndex === index ? 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))' : 'url(#shadow)',
                    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                />
              ))}
            </Pie>
            <Tooltip {...tooltipStyle} />
            {showLegend && <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '40px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em' }} />}
          </PieChart>
        );
      case 'scatter':
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              type="category" 
              dataKey="name" 
              name={xAxis} 
              {...axisStyle} 
              height={60} 
              angle={-20} 
              textAnchor="end" 
              interval={0}
            />
            <YAxis type="number" dataKey="y" name={yAxis} {...axisStyle} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} {...tooltipStyle} />
            {showLegend && <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }} />}
            <Scatter name={yAxis} data={chartData} fill={chartColor} />
          </ScatterChart>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-5 h-full flex flex-col group overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] truncate">{title}</h3>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
           <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.3)] animate-pulse"></span>
           <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">{xAxis} insight</span>
        </div>
      </div>
      <div className="flex-1 w-full min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart() || <div />}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartWidget;
