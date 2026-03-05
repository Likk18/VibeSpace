import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Orders.css';

const Orders = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('orders');

    // Mock Orders Data
    const mockOrders = [
        {
            id: '403-8146163-5651561',
            date: '2 March 2026',
            total: 398.00,
            status: 'Delivered today',
            statusDetail: 'Package was handed to resident',
            items: [
                {
                    name: 'DZK 60W Adjustable Temperature Electric hakko Soldering Iron Kit Set',
                    price: 398.00,
                    image: 'https://m.media-amazon.com/images/I/71uV8gP8nDL._SL1500_.jpg'
                }
            ]
        },
        {
            id: '403-5814340-2213907',
            date: '15 February 2026',
            total: 630.15,
            status: 'Delivered on 15 February',
            statusDetail: 'Package was handed to resident',
            items: [
                {
                    name: 'Amazon Brand - Solimo Silica Glass Bottle with Flip Cap, 1 Litre',
                    price: 630.15,
                    image: 'https://m.media-amazon.com/images/I/61k1Teb91ZL._SL1500_.jpg'
                }
            ]
        }
    ];

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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
                    <span className="font-bold">{mockOrders.length} orders</span> placed in
                    <select className="bg-transparent border-none text-[#00d4ff] font-bold cursor-pointer outline-none ml-1">
                        <option>past 3 months</option>
                        <option>2026</option>
                        <option>2025</option>
                    </select>
                </div>

                {/* Orders List */}
                <div className="space-y-6">
                    {mockOrders.map(order => (
                        <div key={order.id} className="order-card">
                            <div className="order-header">
                                <div>
                                    <label>Order Placed</label>
                                    <span>{order.date}</span>
                                </div>
                                <div>
                                    <label>Total</label>
                                    <span>${order.total.toFixed(2)}</span>
                                </div>
                                <div>
                                    <label>Ship To</label>
                                    <span className="text-[#00d4ff] cursor-pointer hover:underline flex items-center gap-1">
                                        {user?.name || 'Customer'}
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    </span>
                                </div>
                                <div className="text-right">
                                    <label>Order # {order.id}</label>
                                    <div className="space-x-2 text-[#00d4ff] flex justify-end">
                                        <span className="cursor-pointer hover:underline">View order details</span>
                                        <span className="text-gray-500">|</span>
                                        <span className="cursor-pointer hover:underline">Invoice</span>
                                    </div>
                                </div>
                            </div>

                            <div className="order-body">
                                <div className="delivery-status">{order.status}</div>
                                <p className="text-xs text-gray-400 mb-4">{order.statusDetail}</p>

                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-grow space-y-4">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="order-item">
                                                <img src={item.image} alt={item.name} className="order-item-img" />
                                                <div className="order-item-info">
                                                    <h4>{item.name}</h4>
                                                    <p className="text-xs text-gray-400">Return or replace items: Eligible till 13 March 2026</p>
                                                    <button className="amazon-btn-white mt-4 flex items-center gap-2 px-6">
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
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Orders;
