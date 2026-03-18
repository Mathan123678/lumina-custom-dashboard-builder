import { useState, useEffect } from 'react';
import { Plus, Filter, Download } from 'lucide-react';
import OrderTable from '../components/orders/OrderTable';
import OrderModal from '../components/orders/OrderModal';
import { orderService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const { searchTerm, setSearchTerm } = useAuth();
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAll();
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCreateOrder = () => {
    setEditingOrder(null);
    setIsModalOpen(true);
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setIsModalOpen(true);
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await orderService.delete(id);
        fetchOrders();
      } catch (error) {
        console.error('Failed to delete order:', error);
      }
    }
  };

  const handleSaveOrder = async (data) => {
    try {
      if (editingOrder) {
        await orderService.update(editingOrder._id, data);
      } else {
        await orderService.create(data);
      }
      setIsModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Failed to save order:', error);
      const errorMessage = error.response?.data?.message || error.message;
      alert(`Failed to save order: ${errorMessage}`);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = (
      order.customerInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderInfo.product.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesStatus = statusFilter === 'All' || order.orderInfo.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Customer', 'Email', 'Product', 'Quantity', 'Total', 'Status', 'Date'];
    const csvData = filteredOrders.map(order => [
      order._id || order.id,
      `${order.customerInfo.firstName} ${order.customerInfo.lastName}`,
      order.customerInfo.email,
      order.orderInfo.product,
      order.orderInfo.quantity,
      order.orderInfo.totalAmount,
      order.orderInfo.status,
      new Date(order.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-100 tracking-tight">Orders Management</h1>
          <p className="text-slate-400 mt-2 text-lg font-medium">Detailed overview and control of your business transactions.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-sm">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-300 text-sm font-black px-4 py-2 outline-none cursor-pointer focus:text-primary transition-colors uppercase tracking-widest"
            >
              <option value="All" className="bg-slate-900 text-white">All Status</option>
              <option value="Pending" className="bg-slate-900 text-white">Pending</option>
              <option value="In Progress" className="bg-slate-900 text-white">In Progress</option>
              <option value="Completed" className="bg-slate-900 text-white">Completed</option>
              <option value="Canceled" className="bg-slate-900 text-white">Canceled</option>
            </select>
          </div>

          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-slate-300 font-black uppercase tracking-widest text-[11px] rounded-xl hover:bg-slate-800 transition-all border border-slate-800 shadow-sm"
          >
            <Download size={18} />
            Export Data
          </button>
          
          <button 
            onClick={handleCreateOrder}
            className="flex items-center gap-2 px-7 py-2.5 bg-primary text-white font-black uppercase tracking-widest text-[11px] rounded-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 transform active:scale-95"
          >
            <Plus size={18} strokeWidth={3} />
            New Order
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Filter className="text-slate-500" size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Search by customer name, email, or product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/50 border border-slate-800 text-slate-100 pl-12 pr-4 py-5 rounded-3xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all placeholder:text-slate-600 shadow-inner font-medium"
        />
      </div>

      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-[2rem] overflow-hidden shadow-2xl">
        <OrderTable 
          orders={filteredOrders} 
          loading={loading} 
          onEdit={handleEditOrder} 
          onDelete={handleDeleteOrder} 
        />
      </div>

      <OrderModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveOrder} 
        editingOrder={editingOrder} 
      />
    </div>
  );
};

export default OrdersPage;
