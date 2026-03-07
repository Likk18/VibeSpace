import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-display font-bold mb-2" style={{ color: '#3D1F0D' }}>
                        Welcome Back
                    </h2>
                    <p style={{ color: '#8B6347' }}>
                        Sign in to continue your vibe journey
                    </p>
                </div>

                <div className="rounded-2xl shadow-xl p-8" style={{ backgroundColor: '#F5EFE6' }}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#3D1F0D' }}>
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="input"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#3D1F0D' }}>
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="input"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`btn-primary w-full py-3 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={() => alert('A password reset link has been sent to your email address.')}
                            className="text-sm hover:underline transition-colors duration-300"
                            style={{ color: '#8B6347' }}
                        >
                            Forgot your password?
                        </button>
                    </div>

                    <div className="mt-4 text-center">
                        <p className="text-sm" style={{ color: '#6B5B4F' }}>
                            Don't have an account?{' '}
                            <Link to="/register" className="font-medium hover:underline" style={{ color: '#8B6347' }}>
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
