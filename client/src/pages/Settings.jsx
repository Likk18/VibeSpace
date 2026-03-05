import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';

const Settings = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { togglePersonalization, personalizationOn } = useProfile();

    return (
        <div className="min-h-screen bg-background py-12 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-display font-bold mb-10 text-glow">Account Settings</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Orders Card */}
                    <button onClick={() => navigate('/orders')} className="bg-surface/30 p-8 rounded-2xl border border-white/5 backdrop-blur-sm text-left hover:border-primary/50 transition-all group">
                        <div className="flex justify-between items-center mb-4">
                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                            </div>
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </div>
                        <h2 className="text-xl font-bold mb-1">Your Orders</h2>
                        <p className="text-gray-400 text-sm">Track, return, or buy things again</p>
                    </button>

                    {/* Security Card */}
                    <button onClick={() => navigate('/security')} className="bg-surface/30 p-8 rounded-2xl border border-white/5 backdrop-blur-sm text-left hover:border-primary/50 transition-all group">
                        <div className="flex justify-between items-center mb-4">
                            <div className="p-3 bg-green-500/10 rounded-xl text-green-400 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            </div>
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </div>
                        <h2 className="text-xl font-bold mb-1">Login & Security</h2>
                        <p className="text-gray-400 text-sm">Edit login, name, and mobile number</p>
                    </button>

                    {/* VibePay Card */}
                    <button onClick={() => navigate('/vibepay')} className="bg-surface/30 p-8 rounded-2xl border border-white/5 backdrop-blur-sm text-left hover:border-primary/50 transition-all group">
                        <div className="flex justify-between items-center mb-4">
                            <div className="p-3 bg-purple-500/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                            </div>
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </div>
                        <h2 className="text-xl font-bold mb-1">VibePay Wallet</h2>
                        <p className="text-gray-400 text-sm">Manage balance and vouchers</p>
                    </button>

                    {/* FAQ Card */}
                    <button onClick={() => navigate('/faq')} className="bg-surface/30 p-8 rounded-2xl border border-white/5 backdrop-blur-sm text-left hover:border-primary/50 transition-all group">
                        <div className="flex justify-between items-center mb-4">
                            <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </div>
                        <h2 className="text-xl font-bold mb-1">FAQs & Support</h2>
                        <p className="text-gray-400 text-sm">Browse help topics and contact support</p>
                    </button>
                </div>

                <div className="mt-12 space-y-6">
                    {/* Preferences Section */}
                    <section className="bg-surface/30 p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
                        <h2 className="text-xl font-bold mb-6">Preferences</h2>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold">AI Personalization</h3>
                                    <p className="text-gray-400 text-sm">Tailor your feed based on your style results</p>
                                </div>
                                <button
                                    onClick={togglePersonalization}
                                    className={`w-14 h-7 rounded-full transition-all relative ${personalizationOn ? 'bg-primary' : 'bg-gray-600'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${personalizationOn ? 'left-8' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Account Info */}
                    <section className="bg-surface/30 p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
                        <h2 className="text-xl font-bold mb-6">Account Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Username</label>
                                <div className="text-lg">{user?.name}</div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Email</label>
                                <div className="text-lg">{user?.email}</div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Settings;
