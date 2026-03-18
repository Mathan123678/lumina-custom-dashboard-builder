/**
 * TableWidget Component
 * Renders a data table with dynamic columns, sorting, and multi-filter support.
 * Adheres to the Premium Dark theme specifications.
 */
const TableWidget = ({ settings, data, title }) => {
  const { 
    columns = [], 
    sort, 
    pagination = 5, 
    fontSize = 14, 
    headerBgColor = '#54bd95',
    applyFilter = false 
  } = settings;

  const getDisplayValue = (item, col) => {
    switch (col) {
      case 'Customer ID': return item._id?.substring(0, 8) || 'N/A';
      case 'Customer name': return `${item.customerInfo?.firstName || ''} ${item.customerInfo?.lastName || ''}`.trim() || 'Guest';
      case 'Email ID': return item.customerInfo?.email || '-';
      case 'Phone number': return item.customerInfo?.phone || '-';
      case 'Address': return `${item.customerInfo?.street || ''}, ${item.customerInfo?.city || ''}`.trim() || '-';
      case 'Order ID': return item._id || 'N/A';
      case 'Order date': return item.orderInfo?.orderDate ? new Date(item.orderInfo.orderDate).toLocaleDateString() : new Date(item.createdAt).toLocaleDateString();
      case 'Product': return item.orderInfo?.product || '-';
      case 'Quantity': return item.orderInfo?.quantity || 0;
      case 'Unit price': return `$${item.orderInfo?.unitPrice || 0}`;
      case 'Total amount': return `$${item.orderInfo?.totalAmount || 0}`;
      case 'Status': return item.orderInfo?.status || 'Pending';
      case 'Created by': return item.orderInfo?.createdBy || '-';
      default: return '-';
    }
  };

  // 1. Filter Logic (Dynamic version supporting multiple filters)
  let processedData = [...data];
  if (applyFilter && settings.filters && settings.filters.length > 0) {
    processedData = processedData.filter(item => {
      return settings.filters.every(filter => {
        if (!filter.value) return true; // Skip empty filters
        
        const rawValue = getDisplayValue(item, filter.field);
        const targetValue = filter.value.toLowerCase();
        const displayStr = String(rawValue).toLowerCase();

        // Numeric parsing for comparison operators
        const numValue = parseFloat(String(rawValue).replace(/[^0-9.-]+/g, ""));
        const compareValue = parseFloat(filter.value);

        switch (filter.operator) {
          case 'equals':
            return displayStr === targetValue;
          case 'contains':
            return displayStr.includes(targetValue);
          case 'greater than':
            return !isNaN(numValue) && !isNaN(compareValue) && numValue > compareValue;
          case 'less than':
            return !isNaN(numValue) && !isNaN(compareValue) && numValue < compareValue;
          default:
            return true;
        }
      });
    });
  }

  // 2. Sort Logic
  if (sort === 'Ascending') {
    processedData.sort((a, b) => (a.orderInfo?.totalAmount || 0) - (b.orderInfo?.totalAmount || 0));
  } else if (sort === 'Descending') {
    processedData.sort((a, b) => (b.orderInfo?.totalAmount || 0) - (a.orderInfo?.totalAmount || 0));
  } else if (sort === 'Order date') {
    processedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // 3. Paginate
  const paginatedData = processedData.slice(0, pagination);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-amber-700 bg-amber-500/10 border-amber-500/20';
      case 'In progress': return 'text-blue-700 bg-blue-500/10 border-blue-500/20';
      case 'Completed': return 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20';
      case 'Canceled': return 'text-rose-700 bg-rose-500/10 border-rose-500/20';
      default: return 'text-[var(--text-muted)] bg-[var(--bg-main)] border-[var(--border-main)]';
    }
  };

  return (
    <div className="p-5 h-full flex flex-col overflow-hidden group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-[0.2em] truncate">{title}</h3>
        {applyFilter && (
          <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase rounded-lg border border-primary/20 flex items-center gap-1.5 shadow-[0_0_10px_rgba(84,189,149,0.1)]">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            Filtered
          </span>
        )}
      </div>
      <div className="flex-1 overflow-auto rounded-xl border border-[var(--border-main)] scrollbar-thin scrollbar-thumb-[var(--border-main)] hover:scrollbar-thumb-[var(--text-muted)] transition-colors bg-[var(--bg-card)]">
        <table className="w-full text-left border-separate border-spacing-0" style={{ fontSize: `${fontSize}px` }}>
          <thead className="sticky top-0 z-10">
            <tr style={{ backgroundColor: headerBgColor }}>
              {columns.map((col, idx) => (
                <th key={col} className={`px-4 py-3.5 text-white font-black whitespace-nowrap border-b border-white/10 uppercase tracking-tighter ${idx === 0 ? 'rounded-tl-xl' : ''} ${idx === columns.length - 1 ? 'rounded-tr-xl' : ''}`}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-main)]">
            {paginatedData.length > 0 ? paginatedData.map((item, idx) => (
              <tr 
                key={item._id || idx} 
                className="bg-transparent hover:bg-[var(--bg-main)] transition-all duration-300 group/row animate-in fade-in slide-in-from-left-2"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {columns.map(col => (
                  <td key={col} className="px-4 py-3 text-[var(--text-main)] font-medium whitespace-nowrap group-hover/row:text-primary transition-colors">
                    {col === 'Status' ? (
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border whitespace-nowrap inline-flex items-center justify-center ${getStatusColor(item.orderInfo?.status)}`}>
                        {getDisplayValue(item, col)}
                      </span>
                    ) : (
                      getDisplayValue(item, col)
                    )}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-24 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
                       <span className="text-2xl font-black">?</span>
                    </div>
                    <div className="text-slate-400 font-black text-xs uppercase tracking-widest">No matching records</div>
                    <p className="text-slate-400/60 text-[10px] font-bold uppercase tracking-tighter italic">Try adjusting your filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {(processedData.length > pagination || applyFilter) && (
        <div className="flex items-center justify-between mt-3 px-1">
          <p className="text-[10px] text-[var(--text-muted)] font-bold flex items-center gap-3 uppercase tracking-tighter">
            <span>Showing {paginatedData.length} <span className="text-[var(--border-main)] mx-0.5">/</span> {processedData.length} records</span>
            {applyFilter && (
              <span className="text-primary/70 animate-pulse">Live Filter Active</span>
            )}
          </p>
          {processedData.length > pagination && (
            <div className="flex items-center gap-1.5 italic text-[10px] text-slate-400">
               <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200">Prev</span>
               <span className="text-slate-900 font-black mx-1">1</span>
               <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200">Next</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TableWidget;
