import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { groupAPI } from '../services/api';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, updateUser, loginWithToken } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const redirectTo = location.state?.redirectTo || '/dashboard';
    const groupId = location.state?.groupId;
    const shouldJoinGroup = location.state?.joinGroup;

    // Handle Google OAuth callback token
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        if (token) {
            handleGoogleLogin(token);
        }
    }, [location]);

    const handleGoogleLogin = async (token) => {
        setLoading(true);
        try {
            await loginWithToken(token);
            navigate(redirectTo);
        } catch (err) {
            setError('Google login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRedirect = () => {
        const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
        const baseUrl = isProd ? `${window.location.origin}/api` : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
        window.location.href = `${baseUrl}/auth/google`;
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(formData.email, formData.password);
            
            if (shouldJoinGroup && groupId) {
                try {
                    await groupAPI.join(groupId);
                    updateUser({ mode: 'group', group_id: groupId, quiz_complete: false });
                    navigate('/quiz');
                    return;
                } catch (err) {
                    console.error('Failed to join group after login:', err);
                }
            }
            
            if (!user.quiz_complete) {
                navigate('/mode-select');
            } else {
                navigate(redirectTo);
            }
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

                    <div className="mt-4">
                        <button
                            onClick={handleGoogleRedirect}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                                <path d="M1 1h22v22H1z" fill="none" />
                            </svg>
                            Continue with Google
                        </button>
                    </div>

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
