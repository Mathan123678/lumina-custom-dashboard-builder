import { DollarSign, ShoppingBag, Users, Hash, Clock, MapPin, Mail, Calendar, UserCheck } from 'lucide-react';

/**
 * Maps metric setting label to actual order data value.
 */
const getMetricValue = (order, metric) => {
  switch (metric) {
    case 'Total amount': return order.orderInfo?.totalAmount ?? 0;
    case 'Unit price': return order.orderInfo?.unitPrice ?? 0;
    case 'Quantity': return order.orderInfo?.quantity ?? 0;
    case 'Duration': return order.orderInfo?.duration ?? 0; 
    case 'Customer ID': return 1;
    case 'Customer name': return 1;
    case 'Email id': return 1;
    case 'Address': return 1;
    case 'Order date': return 1;
    case 'Product': return 1;
    case 'Created by': return 1;
    case 'Status': return 1;
    default: return 0;
  }
};

/**
 * Returns the appropriate icon component for a given metric.
 */
const getIcon = (metric) => {
  switch (metric) {
    case 'Total amount':
    case 'Unit price': return DollarSign;
    case 'Quantity': return ShoppingBag;
    case 'Customer name':
    case 'Customer ID': return Users;
    case 'Address': return MapPin;
    case 'Email id': return Mail;
    case 'Order date': return Calendar;
    case 'Status': return UserCheck;
    case 'Duration': return Clock;
    default: return Hash;
  }
};

/**
 * KPIWidget Component
 * Calculates and displays a single key performance indicator based on dashboard settings.
 */
const KPIWidget = ({ settings, data, title }) => {
  const { metric, aggregation, format, precision = 0 } = settings;

  const calculateValue = () => {
    if (!data || data.length === 0) return 0;

    if (aggregation === 'count') return data.length;

    const values = data.map(order => {
      const val = getMetricValue(order, metric);
      return typeof val === 'number' ? val : 0;
    });

    if (aggregation === 'sum') return values.reduce((a, b) => a + b, 0);
    if (aggregation === 'avg') {
      const sum = values.reduce((a, b) => a + b, 0);
      return values.length > 0 ? sum / values.length : 0;
    }
    return 0;
  };

  const value = calculateValue();

  const formattedValue = format === 'currency'
    ? `$${value.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision })}`
    : value.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision });

  const IconComp = getIcon(metric);

  return (
    <div className="p-6 h-full flex flex-col justify-between group relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500"></div>
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">{title}</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-primary/40"></span>
            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">{aggregation === 'avg' ? 'Average' : aggregation === 'sum' ? 'Total' : 'Count'}</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-sm group-hover:rotate-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
          <IconComp size={20} />
        </div>
      </div>

      <div className="mt-4 relative z-10">
        <div className="text-4xl font-black text-[var(--text-main)] tracking-widest group-hover:text-primary transition-colors">
          {formattedValue}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1 bg-[var(--bg-main)] rounded-full overflow-hidden">
             <div className="h-full bg-primary/40 w-2/3 rounded-full group-hover:w-full transition-all duration-1000"></div>
          </div>
          <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">{metric.split(' ')[0]}</span>
        </div>
      </div>
    </div>
  );
};

export default KPIWidget;
