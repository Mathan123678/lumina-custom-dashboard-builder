import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';

const OrderModal = ({ isOpen, onClose, onSave, editingOrder }) => {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      customerInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United States'
      },
      orderInfo: {
        product: 'Fiber Internet 300 Mbps',
        quantity: 1,
        unitPrice: 0,
        totalAmount: 0,
        status: 'Pending',
        createdBy: 'Mr. Michael Harris',
        orderDate: new Date().toISOString().split('T')[0]
      }
    }
  });

  // Watch quantity and unitPrice for auto-calculation
  const quantity = watch('orderInfo.quantity');
  const unitPrice = watch('orderInfo.unitPrice');

  useEffect(() => {
    const total = (parseFloat(quantity) || 0) * (parseFloat(unitPrice) || 0);
    setValue('orderInfo.totalAmount', total);
  }, [quantity, unitPrice, setValue]);

  const onInvalid = (errors) => {
    console.error('Form Validation Errors:', errors);
    alert('Form validation failed! Errors: ' + Object.keys(errors).join(', '));
  };

  useEffect(() => {
    if (editingOrder) {
      reset(editingOrder);
    } else {
      reset({
        customerInfo: {
          firstName: '', lastName: '', email: '', phone: '', street: '', city: '', state: '', postalCode: '', country: 'United States'
        },
        orderInfo: {
          product: 'Fiber Internet 300 Mbps', quantity: 1, unitPrice: 0, totalAmount: 0, status: 'Pending', createdBy: 'Mr. Michael Harris', orderDate: new Date().toISOString().split('T')[0]
        }
      });
    }
  }, [editingOrder, reset]);

  if (!isOpen) return null;

  const inputClass = "w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all border shadow-inner placeholder:text-slate-400";
  const labelClass = "block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1";
  const errorClass = "text-rose-600 text-[10px] mt-1.5 font-bold uppercase tracking-tight ml-1";

  // Dropdown options aligned with system data
  const countries = ['United States', 'Canada', 'Australia', 'Singapore', 'Hong Kong'];
  const products = [
    'Fiber Internet 300 Mbps', 
    '5GUnlimited Mobile Plan', 
    'Fiber Internet 1 Gbps', 
    'Business Internet 500 Mbps', 
    'VoIP Corporate Package'
  ];
  const statuses = ['Pending', 'In progress', 'Completed'];
  const creators = ['Mr. Michael Harris', 'Mr. Ryan Cooper', 'Ms. Olivia Carter', 'Mr. Lucas Martin'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-premium flex flex-col animate-in fade-in zoom-in duration-500 fill-mode-both">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {editingOrder ? 'Update Order' : 'New Order'}
            </h2>
            <p className="text-sm font-medium text-slate-400">Capture customer and product details</p>
          </div>
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-900 transition-all hover:bg-slate-100 rounded-2xl border border-transparent hover:border-slate-200 shadow-sm">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSave, onInvalid)} className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
          {/* Customer Information Section */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4 mb-8">
              <span className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black shadow-sm">01</span>
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Customer Profile</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Identity & Contact Information</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <label className={labelClass}>First Name</label>
                <input {...register('customerInfo.firstName', { required: "Please fill the field" })} className={inputClass} placeholder="Enter first name..." />
                {errors.customerInfo?.firstName && <p className={errorClass}>{errors.customerInfo.firstName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input {...register('customerInfo.lastName', { required: "Please fill the field" })} className={inputClass} placeholder="Enter last name..." />
                {errors.customerInfo?.lastName && <p className={errorClass}>{errors.customerInfo.lastName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Email id</label>
                <input type="email" {...register('customerInfo.email', { required: "Please fill the field" })} className={inputClass} placeholder="customer@example.com" />
                {errors.customerInfo?.email && <p className={errorClass}>{errors.customerInfo.email.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Phone number</label>
                <input {...register('customerInfo.phone', { required: "Please fill the field" })} className={inputClass} placeholder="+1 (555) 000-0000" />
                {errors.customerInfo?.phone && <p className={errorClass}>{errors.customerInfo.phone.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Street Address</label>
                <input {...register('customerInfo.street', { required: "Please fill the field" })} className={inputClass} placeholder="Enter full street address..." />
                {errors.customerInfo?.street && <p className={errorClass}>{errors.customerInfo.street.message}</p>}
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input {...register('customerInfo.city', { required: "Please fill the field" })} className={inputClass} placeholder="e.g. New York" />
                {errors.customerInfo?.city && <p className={errorClass}>{errors.customerInfo.city.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>State / Province</label>
                  <input {...register('customerInfo.state', { required: "Please fill the field" })} className={inputClass} placeholder="NY" />
                </div>
                <div>
                  <label className={labelClass}>Postal code</label>
                  <input {...register('customerInfo.postalCode', { required: "Please fill the field" })} className={inputClass} placeholder="10001" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Country</label>
                <select {...register('customerInfo.country', { required: "Please fill the field" })} className={inputClass}>
                  {countries.map(c => <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100"></div>

          {/* Order Information Section */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <div className="flex items-center gap-4 mb-8">
              <span className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-black shadow-sm">02</span>
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Order Particulars</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Product & Transaction Details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="md:col-span-2">
                <label className={labelClass}>Product Selection</label>
                <select {...register('orderInfo.product', { required: "Please fill the field" })} className={inputClass}>
                  {products.map(p => <option key={p} value={p} className="bg-slate-900 text-white">{p}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Quantity</label>
                <input 
                  type="number" 
                  {...register('orderInfo.quantity', { 
                    required: "Please fill the field",
                    min: { value: 1, message: "Quantity cannot be reduced below 1" },
                    valueAsNumber: true
                  })} 
                  className={inputClass} 
                />
                {errors.orderInfo?.quantity && <p className={errorClass}>{errors.orderInfo.quantity.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Unit Price ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    {...register('orderInfo.unitPrice', { 
                      required: "Please fill the field",
                      valueAsNumber: true
                    })} 
                    className={`${inputClass} pl-8`} 
                  />
                </div>
                {errors.orderInfo?.unitPrice && <p className={errorClass}>{errors.orderInfo.unitPrice.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Total Amount ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input 
                    type="number" 
                    {...register('orderInfo.totalAmount')} 
                    readOnly 
                    className={`${inputClass} pl-8 bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed font-black`} 
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Workflow Status</label>
                <select {...register('orderInfo.status', { required: "Please fill the field" })} className={inputClass}>
                  {statuses.map(s => <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Created by</label>
                <select {...register('orderInfo.createdBy', { required: "Please fill the field" })} className={inputClass}>
                  {creators.map(c => <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Order Date</label>
                <input 
                  type="date" 
                  {...register('orderInfo.orderDate', { required: "Please fill the field" })} 
                  className={inputClass} 
                />
                {errors.orderInfo?.orderDate && <p className={errorClass}>{errors.orderInfo.orderDate.message}</p>}
              </div>
            </div>
          </div>
          
          <div className="pt-8 flex items-center justify-end gap-4 border-t border-slate-100 sticky bottom-0 bg-white/80 backdrop-blur-md pb-2 z-10">
            <button 
              type="button" 
              onClick={onClose}
              className="px-8 py-3 rounded-2xl border border-slate-200 text-slate-400 font-black uppercase tracking-widest text-xs hover:bg-slate-50 hover:text-slate-900 transition-all"
            >
              Discard
            </button>
            <button 
              type="submit"
              className="px-10 py-3 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
            >
              {editingOrder ? 'Update Record' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;
