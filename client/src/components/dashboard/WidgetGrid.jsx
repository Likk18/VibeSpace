import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';

const WidgetGrid = ({ products = [] }) => {
    const { user, isAuthenticated } = useAuth();
    const { profile, personalizationOn } = useProfile();
    
    // Fallback product logic for widgets
    const featuredProducts = products.length >= 4 ? products.slice(0, 4) : [];
    const newArrivals = products.filter(p => true).slice(0, 4); // In a real app we'd filter by date
    const offers = products.filter(p => p.original_price > p.price).slice(0, 4);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-24 md:-mt-32 relative z-20 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Widget 1: Keep Shopping / Welcome */}
                <div className="bg-surface rounded-xl shadow-lg border border-white/10 p-5 flex flex-col h-[380px] hover:border-primary/50 transition-colors">
                    <h2 className="text-xl font-display font-bold mb-4">
                        {isAuthenticated ? `Keep shopping for ${profile?.primary_style || 'Furniture'}` : 'Welcome to VibeSpace'}
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-2 flex-grow mb-4">
                        {featuredProducts.map((p, idx) => (
                            <div key={idx} className="bg-background rounded overflow-hidden aspect-square">
                                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                    
                    <Link to="/dashboard" className="text-primary hover:text-primary/80 hover:underline text-sm font-medium mt-auto">
                        See more →
                    </Link>
                </div>

                {/* Widget 2: New Arrivals (Teal theme) */}
                <div className="bg-emerald-950/30 rounded-xl shadow-lg border border-emerald-900/50 p-5 flex flex-col h-[380px] hover:border-emerald-500/50 transition-colors">
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-xl font-display font-bold text-emerald-50">New Arrivals</h2>
                        <span className="bg-emerald-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm">New</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 flex-grow mb-4">
                        {newArrivals.map((p, idx) => (
                            <div key={idx} className="bg-emerald-900/50 rounded overflow-hidden aspect-square relative group">
                                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            </div>
                        ))}
                    </div>
                    
                    <Link to="/dashboard?filter=new" className="text-emerald-400 hover:text-emerald-300 hover:underline text-sm font-medium mt-auto">
                        View all →
                    </Link>
                </div>

                {/* Widget 3: Offers / Deals (Amber theme) */}
                <div className="bg-amber-950/30 rounded-xl shadow-lg border border-amber-900/50 p-5 flex flex-col h-[380px] hover:border-amber-500/50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-display font-bold text-amber-50">Offers & Deals</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 flex-grow mb-4">
                        {offers.length > 0 ? offers.map((p, idx) => (
                            <div key={idx} className="bg-amber-900/50 rounded flex flex-col overflow-hidden relative group">
                                <div className="aspect-square relative flex-grow overflow-hidden">
                                     <img src={p.image_url} alt={p.name} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="p-2 flex items-center justify-center gap-2 bg-amber-950/50">
                                    <span className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">-20%</span>
                                    <span className="text-red-500 font-bold text-sm">Deal</span>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-2 flex items-center justify-center text-amber-500/50 h-full">
                                No active deals
                            </div>
                        )}
                    </div>
                    
                    <Link to="/dashboard?filter=sale" className="text-amber-400 hover:text-amber-300 hover:underline text-sm font-medium mt-auto">
                        See all offers →
                    </Link>
                </div>

                {/* Widget 4: Room Collections (Brown/Primary theme) */}
                <div className="bg-primary/5 rounded-xl shadow-lg border border-primary/20 p-5 flex flex-col h-[380px] hover:border-primary/50 transition-colors">
                    <h2 className="text-xl font-display font-bold text-[#f1f2f4] mb-4">Room Collections</h2>
                    
                    <div className="grid grid-cols-2 gap-2 flex-grow mb-4">
                         <Link to="/category/living-room" className="bg-background rounded overflow-hidden aspect-square relative group">
                            <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 flex items-end p-2 bg-gradient-to-t from-black/80 to-transparent">
                                <span className="text-xs font-medium text-white shadow-sm">Living</span>
                            </div>
                         </Link>
                         <Link to="/category/bedroom" className="bg-background rounded overflow-hidden aspect-square relative group">
                            <img src="https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 flex items-end p-2 bg-gradient-to-t from-black/80 to-transparent">
                                <span className="text-xs font-medium text-white shadow-sm">Bedroom</span>
                            </div>
                         </Link>
                         <Link to="/category/kitchen" className="bg-background rounded overflow-hidden aspect-square relative group">
                            <img src="https://images.unsplash.com/photo-1556910103-1c02745a872f?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 flex items-end p-2 bg-gradient-to-t from-black/80 to-transparent">
                                <span className="text-xs font-medium text-white shadow-sm">Kitchen</span>
                            </div>
                         </Link>
                         <Link to="/category/decor" className="bg-background rounded overflow-hidden aspect-square relative group">
                            <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 flex items-end p-2 bg-gradient-to-t from-black/80 to-transparent">
                                <span className="text-xs font-medium text-white shadow-sm">Decor</span>
                            </div>
                         </Link>
                    </div>
                    
                    <Link to="/dashboard" className="text-primary hover:text-primary/80 hover:underline text-sm font-medium mt-auto">
                        Explore all rooms →
                    </Link>
                </div>
                
            </div>
        </div>
    );
};

export default WidgetGrid;
