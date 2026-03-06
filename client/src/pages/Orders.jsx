import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import './Orders.css';

const Orders = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await ordersAPI.getUserOrders();
            setOrders(response.data.data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="orders-container">
            <div className="orders-max-width">
                <nav className="text-sm mb-6 flex gap-2 text-gray-400">
                    <span className="cursor-pointer hover:underline" onClick={() => navigate('/settings')}>Your Account</span>
                    <span>›</span>
                    <span className="text-primary font-bold">Your Orders</span>
                </nav>

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Your Orders</h1>
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Search all orders"
                            className="bg-surface border border-white/10 rounded-lg px-4 py-2 pr-20 text-sm focus:border-primary outline-none"
                        />
                        <button className="absolute right-1 top-1 bottom-1 px-4 bg-gray-700 text-white rounded-md text-xs font-bold hover:bg-gray-600">
                            Search Orders
                        </button>
                    </div>
                </div>

                <div className="orders-nav">
                    <button
                        className={`orders-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        Orders
                    </button>
                    <button
                        className={`orders-nav-item ${activeTab === 'buy-again' ? 'active' : ''}`}
                        onClick={() => setActiveTab('buy-again')}
                    >
                        Buy Again
                    </button>
                    <button
                        className={`orders-nav-item ${activeTab === 'not-shipped' ? 'active' : ''}`}
                        onClick={() => setActiveTab('not-shipped')}
                    >
                        Not Yet Shipped
                    </button>
                </div>

                <div className="mb-6 text-sm">
                    <span className="font-bold">{orders.length} orders</span> placed in
                    <select className="bg-transparent border-none text-[var(--color-primary)] font-bold cursor-pointer outline-none ml-1">
                        <option>past 3 months</option>
                        <option>2026</option>
                        <option>2025</option>
                    </select>
                </div>

                {/* Orders List */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="text-center py-10 text-gray-400">Loading orders...</div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-10 border border-white/10 rounded-xl bg-surface/30">
                            <h2 className="text-xl font-bold mb-2">No orders found</h2>
                            <p className="text-gray-400 mb-6">Looks like you haven't placed any orders yet.</p>
                            <button onClick={() => navigate('/dashboard')} className="btn-primary px-6 py-2">Start Shopping</button>
                        </div>
                    ) : (
                        orders.map(order => (
                        <div key={order._id} className="order-card">
                            <div className="order-header">
                                <div>
                                    <label>Order Placed</label>
                                    <span>{formatDate(order.createdAt)}</span>
                                </div>
                                <div>
                                    <label>Total</label>
                                    <span>${(order.total_amount || 0).toFixed(2)}</span>
                                </div>
                                <div>
                                    <label>Ship To</label>
                                    <span className="text-[var(--color-primary)] cursor-pointer hover:underline flex items-center gap-1">
                                        {order.shipping_address?.name || user?.name || 'Customer'}
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    </span>
                                </div>
                                <div className="text-right">
                                    <label>Order # {order.order_id}</label>
                                    <div className="space-x-2 text-[var(--color-primary)] flex justify-end">
                                        <span className="cursor-pointer hover:underline">View order details</span>
                                        <span className="text-gray-500">|</span>
                                        <span className="cursor-pointer hover:underline">Invoice</span>
                                    </div>
                                </div>
                            </div>

                            <div className="order-body">
                                <div className="delivery-status capitalize">
                                    {order.delivery_status?.replace(/_/g, ' ')}
                                </div>
                                <p className="text-xs text-gray-400 mb-4">{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Paid via ' + order.payment_method.toUpperCase()}</p>

                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-grow space-y-4">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="order-item">
                                                <img src={item.image_url} alt={item.name} className="order-item-img" />
                                                <div className="order-item-info">
                                                    <h4>{item.name}</h4>
                                                    <p className="text-primary font-bold mt-1">${(item.price || 0).toFixed(2)}</p>
                                                    <p className="text-xs text-gray-400 mt-2">Qty: {item.quantity}</p>
                                                    <button className="amazon-btn-white mt-4 flex items-center gap-2 px-6" onClick={() => navigate(`/product/${item.product._id || item.product}`)}>
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                                                        View your item
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="order-actions">
                                        <button className="amazon-btn-white">Track package</button>
                                        <button className="amazon-btn-white">Return or replace items</button>
                                        <button className="amazon-btn-white">Share gift receipt</button>
                                        <button className="amazon-btn-white">Ask Product Question</button>
                                        <button className="amazon-btn-white">Leave seller feedback</button>
                                        <button className="amazon-btn-white">Leave delivery feedback</button>
                                        <button className="amazon-btn-white">Write a product review</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )))}
                </div>
            </div>
        </div>
    );
};

export default Orders;
