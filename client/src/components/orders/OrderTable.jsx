import { MoreVertical, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { useState } from 'react';

const OrderTable = ({ orders, loading, onEdit, onDelete }) => {
  const [activeMenu, setActiveMenu] = useState(null);

  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center text-slate-500 gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="animate-pulse">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-20 text-center text-slate-500">
        <div className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-full text-slate-600">
          <ExternalLink size={32} />
        </div>
        <p className="text-lg font-medium text-slate-400">No orders found</p>
        <p className="text-sm mt-1">Create your first order to see it here.</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-amber-600 bg-amber-50 border-amber-100 shadow-sm';
      case 'In progress': return 'text-blue-600 bg-blue-50 border-blue-100 shadow-sm';
      case 'Completed': return 'text-emerald-600 bg-emerald-50 border-emerald-100 shadow-sm';
      case 'Canceled': return 'text-rose-600 bg-rose-50 border-rose-100 shadow-sm';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-separate border-spacing-0">
        <thead>
          <tr className="bg-slate-50/50 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100">
            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer Profile</th>
            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product</th>
            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">QTY</th>
            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Amount</th>
            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Created By</th>
            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {orders.map((order, index) => (
            <tr 
              key={order._id || order.id} 
              className="hover:bg-slate-50/50 transition-all duration-300 group animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <td className="px-8 py-6">
                <span className="text-xs font-bold text-slate-400">
                  {new Date(order.orderInfo.orderDate || order.createdAt).toLocaleDateString()}
                </span>
              </td>
              <td className="px-8 py-6">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{order.customerInfo.firstName} {order.customerInfo.lastName}</span>
                  <span className="text-xs font-medium text-slate-400">{order.customerInfo.email}</span>
                </div>
              </td>
              <td className="px-8 py-6">
                <span className="text-sm font-medium text-slate-600">{order.orderInfo.product}</span>
              </td>
              <td className="px-8 py-6 text-center">
                <span className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-black text-slate-500 group-hover:bg-white group-hover:border-primary/20 transition-all">
                  {order.orderInfo.quantity}
                </span>
              </td>
              <td className="px-8 py-6">
                <span className="text-sm font-black text-slate-900 tracking-tight">
                  ${order.orderInfo.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </td>
              <td className="px-8 py-6 text-center">
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border whitespace-nowrap inline-flex items-center justify-center ${getStatusColor(order.orderInfo.status)}`}>
                  {order.orderInfo.status}
                </span>
              </td>
              <td className="px-8 py-6">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                  <span className="text-xs font-bold text-slate-400">{order.orderInfo.createdBy}</span>
                </div>
              </td>
              <td className="px-8 py-6 text-right relative">
                <button 
                  onClick={() => setActiveMenu(activeMenu === (order._id || order.id) ? null : (order._id || order.id))}
                  className="p-2.5 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-white transition-all border border-transparent hover:border-slate-100"
                >
                  <MoreVertical size={20} />
                </button>
                
                {activeMenu === (order._id || order.id) && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setActiveMenu(null)}></div>
                    <div className="absolute right-8 top-16 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <button 
                        onClick={() => { onEdit(order); setActiveMenu(null); }}
                        className="w-full flex items-center gap-4 px-5 py-4 text-[13px] font-bold text-slate-600 hover:bg-primary hover:text-white transition-all group/item"
                      >
                        <Edit2 size={16} className="text-primary group-hover/item:text-white" />
                        Edit Record
                      </button>
                      <button 
                        onClick={() => { onDelete(order._id || order.id); setActiveMenu(null); }}
                        className="w-full flex items-center gap-4 px-5 py-4 text-[13px] font-bold text-rose-500 hover:bg-rose-600 hover:text-white transition-all"
                      >
                        <Trash2 size={16} />
                        Discard Order
                      </button>
                    </div>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
