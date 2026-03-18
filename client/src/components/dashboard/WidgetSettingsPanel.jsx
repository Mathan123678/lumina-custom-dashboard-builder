import { X } from 'lucide-react';

const WidgetSettingsPanel = ({ widget, onUpdate, onClose }) => {
  if (!widget) return null;

  const handleChange = (section, field, value) => {
    onUpdate({
      ...widget,
      [section === 'root' ? field : 'settings']: section === 'root' 
        ? value 
        : { ...widget.settings, [field]: value }
    });
  };

  // Standard class definitions for the editor UI
  const inputClass = "w-full bg-slate-50 border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:ring-1 focus:ring-primary/40 border shadow-inner transition-all focus:bg-white";
  const labelClass = "block text-xs font-black text-slate-400 uppercase tracking-wider mb-2";
  const sectionClass = "p-6 space-y-6 border-b border-slate-100";

  const metrics = ['Customer ID', 'Customer name', 'Email id', 'Address', 'Order date', 'Product', 'Created by', 'Status', 'Total amount', 'Unit price', 'Quantity'];
  const xAxisOptions = ['Product', 'Quantity', 'Unit price', 'Total amount', 'Status', 'Created by', 'Duration'];
  const yAxisOptions = ['Product', 'Quantity', 'Unit price', 'Total amount', 'Status', 'Created by', 'Duration'];
  const pieCategories = ['Product', 'Quantity', 'Unit price', 'Total amount', 'Status', 'Created by'];
  const tableColumns = ['Customer ID', 'Customer name', 'Email id', 'Phone number', 'Address', 'Order ID', 'Order date', 'Product', 'Quantity', 'Unit price', 'Total amount', 'Status', 'Created by'];

  const isNumericFilter = (metric) => ['Total amount', 'Unit price', 'Quantity', 'Duration'].includes(metric);

  return (
    <div className="w-96 bg-white border-l border-slate-200 flex flex-col h-full shadow-premium animate-in slide-in-from-right duration-300">
      {/* Panel Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 backdrop-blur-sm">
        <h2 className="font-black text-slate-900 flex items-center gap-2 text-sm uppercase tracking-tighter">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
          Widget Editor
        </h2>
        <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* General Settings */}
        <div className={sectionClass}>
          <div>
            <label className={labelClass}>Widget Title</label>
            <input 
              type="text" 
              value={widget.title} 
              onChange={(e) => handleChange('root', 'title', e.target.value)}
              className={inputClass}
              placeholder="e.g. Sales Overview"
            />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea 
              value={widget.description} 
              onChange={(e) => handleChange('root', 'description', e.target.value)}
              className={`${inputClass} h-20 resize-none`}
              placeholder="Brief summary of this widget..."
            />
          </div>
        </div>

        {/* Data Settings for KPI */}
        {widget.type === 'kpi' && (
          <div className={sectionClass}>
            <h3 className="text-[10px] font-black text-primary mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-4 h-[1px] bg-primary/20"></span>
              KPI Configuration
            </h3>
            <div>
              <label className={labelClass}>Select Metric</label>
              <select 
                value={widget.settings.metric} 
                onChange={(e) => handleChange('settings', 'metric', e.target.value)}
                className={inputClass}
              >
                {/* Dynamically render options from the metrics list */}
                {metrics.map(m => <option key={m} value={m} className="bg-slate-900 text-white">{m}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Aggregation</label>
              <select 
                value={widget.settings.aggregation} 
                onChange={(e) => handleChange('settings', 'aggregation', e.target.value)}
                className={inputClass}
                disabled={!isNumericFilter(widget.settings.metric)}
              >
                <option value="sum" className="bg-slate-900 text-white">Sum</option>
                <option value="avg" className="bg-slate-900 text-white">Average</option>
                <option value="count" className="bg-slate-900 text-white">Count</option>
              </select>
              {!isNumericFilter(widget.settings.metric) && (
                <p className="text-[10px] text-slate-400 mt-1.5 font-medium italic">* Aggregation restricted for categories</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Data Format</label>
              <select 
                value={widget.settings.format} 
                onChange={(e) => handleChange('settings', 'format', e.target.value)}
                className={inputClass}
              >
                <option value="number" className="bg-slate-900 text-white">Number</option>
                <option value="currency" className="bg-slate-900 text-white">Currency ($)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Decimal Precision</label>
              <input 
                type="number" 
                min="0"
                value={widget.settings.precision} 
                onChange={(e) => handleChange('settings', 'precision', Math.max(0, parseInt(e.target.value) || 0))}
                className={inputClass}
              />
            </div>
          </div>
        )}

        {/* Data Settings for Charts */}
        {['bar', 'line', 'pie', 'area', 'scatter'].includes(widget.type) && (
          <div className={sectionClass}>
            <h3 className="text-[10px] font-black text-primary mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-4 h-[1px] bg-primary/20"></span>
              Chart Configuration
            </h3>
            <div>
              <label className={labelClass}>{widget.type === 'pie' ? 'Category Field' : 'Dimension (X-Axis)'}</label>
              <select 
                value={widget.settings.xAxis} 
                onChange={(e) => handleChange('settings', 'xAxis', e.target.value)}
                className={inputClass}
              >
                {(widget.type === 'pie' ? pieCategories : xAxisOptions).map(m => <option key={m} value={m} className="bg-slate-900 text-white">{m}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>{widget.type === 'pie' ? 'Value Field' : 'Measure (Y-Axis)'}</label>
              <select 
                value={widget.settings.yAxis} 
                onChange={(e) => handleChange('settings', 'yAxis', e.target.value)}
                className={inputClass}
              >
                {yAxisOptions.map(m => <option key={m} value={m} className="bg-slate-900 text-white">{m}</option>)}
              </select>
            </div>
            {widget.type !== 'pie' && (
              <div>
                <label className={labelClass}>Brand Accent Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={widget.settings.color} 
                    onChange={(e) => handleChange('settings', 'color', e.target.value)}
                    className="h-10 w-14 bg-slate-50 border-slate-200 rounded-lg cursor-pointer border shadow-sm p-1"
                  />
                  <input 
                    type="text" 
                    value={widget.settings.color} 
                    onChange={(e) => handleChange('settings', 'color', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 pt-2">
              <input 
                type="checkbox" 
                checked={widget.settings.showLabel} 
                onChange={(e) => handleChange('settings', 'showLabel', e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-primary focus:ring-primary shadow-sm"
              />
              <label className="text-sm font-bold text-slate-400">Toggle Data Labels</label>
            </div>
            {widget.type === 'pie' && (
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={widget.settings.showLegend} 
                  onChange={(e) => handleChange('settings', 'showLegend', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-primary focus:ring-primary shadow-sm"
                />
                <label className="text-sm font-bold text-slate-400">Display Chart Legend</label>
              </div>
            )}
          </div>
        )}

        {/* Data Settings for Table */}
        {widget.type === 'table' && (
          <div className={sectionClass}>
            <h3 className="text-[10px] font-black text-primary mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-4 h-[1px] bg-primary/20"></span>
              Table Configuration
            </h3>
            <div>
              <label className={labelClass}>Visible Columns</label>
              <div className="max-h-48 overflow-y-auto space-y-1 bg-slate-900/50 p-3 rounded-xl border border-slate-800 shadow-inner">
                {tableColumns.map(col => (
                  <label key={col} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded-lg transition-all group/item">
                    <input 
                      type="checkbox" 
                      checked={widget.settings.columns.includes(col)}
                      onChange={(e) => {
                        const newCols = e.target.checked 
                          ? [...widget.settings.columns, col]
                          : widget.settings.columns.filter(c => c !== col);
                        handleChange('settings', 'columns', newCols);
                      }}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-primary focus:ring-primary"
                    />
                    <span className="text-xs font-bold text-slate-400 group-hover/item:text-slate-100 transition-colors uppercase tracking-tight">{col}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Default Sort Order</label>
              <select 
                value={widget.settings.sort} 
                onChange={(e) => handleChange('settings', 'sort', e.target.value)}
                className={inputClass}
              >
                <option value="Ascending" className="bg-slate-900 text-white">Ascending</option>
                <option value="Descending" className="bg-slate-900 text-white">Descending</option>
                <option value="Order date" className="bg-slate-900 text-white">Order date</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Page Size</label>
              <select 
                value={widget.settings.pagination} 
                onChange={(e) => handleChange('settings', 'pagination', parseInt(e.target.value))}
                className={inputClass}
              >
                <option value="5" className="bg-slate-900 text-white">5 rows</option>
                <option value="10" className="bg-slate-900 text-white">10 rows</option>
                <option value="15" className="bg-slate-900 text-white">15 rows</option>
              </select>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={widget.settings.applyFilter} 
                  onChange={(e) => handleChange('settings', 'applyFilter', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-primary focus:ring-primary"
                />
                <label className="text-sm font-black text-slate-100 uppercase tracking-tighter">Enable Row Filtering</label>
              </div>

              {widget.settings.applyFilter && (
                <div className="p-5 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Filters</p>
                    <button 
                      onClick={() => {
                        const newFilters = [...(widget.settings.filters || []), { field: 'Status', operator: 'equals', value: '' }];
                        handleChange('settings', 'filters', newFilters);
                      }}
                      className="text-[10px] font-black text-primary hover:text-slate-900 transition-all flex items-center gap-1.5 uppercase hover:tracking-widest"
                    >
                      + Add New
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {(widget.settings.filters || []).map((filter, index) => (
                      <div key={index} className="flex flex-col gap-2 p-3 bg-white rounded-xl border border-slate-100 shadow-sm relative group/filter transition-all hover:border-primary/20">
                        <button 
                          onClick={() => {
                            const newFilters = widget.settings.filters.filter((_, i) => i !== index);
                            handleChange('settings', 'filters', newFilters);
                          }}
                          className="absolute -right-2 -top-2 w-6 h-6 bg-slate-900 text-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover/filter:opacity-100 transition-all shadow-md hover:bg-rose-500 hover:text-white border border-slate-800"
                        >
                          <X size={12} />
                        </button>
                        <div className="flex gap-2">
                          <select 
                            value={filter.field}
                            onChange={(e) => {
                              const newFilters = [...widget.settings.filters];
                              newFilters[index].field = e.target.value;
                              handleChange('settings', 'filters', newFilters);
                            }}
                            className={`${inputClass} !py-1 !px-2 text-[10px] flex-1 font-bold uppercase tracking-tight`}
                          >
                            {tableColumns.map(col => <option key={col} className="bg-slate-900 text-white">{col}</option>)}
                          </select>
                          <select 
                            value={filter.operator}
                            onChange={(e) => {
                              const newFilters = [...widget.settings.filters];
                              newFilters[index].operator = e.target.value;
                              handleChange('settings', 'filters', newFilters);
                            }}
                            className={`${inputClass} !py-1 !px-2 text-[10px] flex-1 font-bold lowercase tracking-widest`}
                          >
                            <option value="equals" className="bg-slate-900 text-white">equals</option>
                            <option value="contains" className="bg-slate-900 text-white">contains</option>
                            <option value="greater than" className="bg-slate-900 text-white">greater than</option>
                            <option value="less than" className="bg-slate-900 text-white">less than</option>
                          </select>
                        </div>
                        <input 
                          type="text" 
                          placeholder="Search value..." 
                          value={filter.value}
                          onChange={(e) => {
                            const newFilters = [...widget.settings.filters];
                            newFilters[index].value = e.target.value;
                            handleChange('settings', 'filters', newFilters);
                          }}
                          className={`${inputClass} !py-1.5 !px-3 text-[10px] font-medium`} 
                        />
                      </div>
                    ))}
                    {(widget.settings.filters || []).length === 0 && (
                      <p className="text-[10px] text-slate-300 italic text-center py-4 font-bold uppercase tracking-widest">No criteria defined</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <label className={labelClass}>Header Accent Color</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={widget.settings.headerBgColor} 
                  onChange={(e) => handleChange('settings', 'headerBgColor', e.target.value)}
                  className="h-10 w-14 bg-slate-50 border-slate-200 rounded-lg cursor-pointer border shadow-sm p-1"
                />
                <input 
                   type="text" 
                   value={widget.settings.headerBgColor} 
                   onChange={(e) => handleChange('settings', 'headerBgColor', e.target.value)}
                   className={inputClass}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white flex gap-3 border-t border-slate-100">
        <button 
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-slate-50 text-slate-900 rounded-lg hover:bg-slate-100 transition-all text-xs font-black uppercase tracking-widest border border-slate-200 shadow-sm"
        >
          Close Panel
        </button>
      </div>
    </div>
  );
};

export default WidgetSettingsPanel;
