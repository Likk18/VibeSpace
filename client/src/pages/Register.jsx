import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Stepper, { Step } from '../components/ui/Stepper';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const registrationSuccess = await register(formData.name, formData.email, formData.password, 'single');
            if (registrationSuccess) {
                setIsRegistered(true);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleStepperFinish = () => {
        navigate('/quiz');
    };

    if (isRegistered) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-display font-bold text-primary mb-2">
                        Welcome, {formData.name}!
                    </h2>
                    <p className="text-gray-400">Let's get your profile ready</p>
                </div>

                <Stepper
                    onFinalStepCompleted={handleStepperFinish}
                    finishButtonText="Start Quiz"
                    nextButtonText="Next Step"
                >
                    <Step>
                        <div className="space-y-4">
                            <div className="text-5xl mb-4">🎉</div>
                            <h2 className="text-2xl font-bold">Account Created!</h2>
                            <p>You're now part of the VibeSpace community. Ready to find your perfect aesthetic?</p>
                        </div>
                    </Step>
                    <Step>
                        <div className="space-y-4">
                            <div className="text-5xl mb-4">🎨</div>
                            <h2 className="text-2xl font-bold">Personalize Your Feed</h2>
                            <p>VibeSpace uses AI to curate products based on your unique style. No more generic catalogs.</p>
                        </div>
                    </Step>
                    <Step>
                        <div className="space-y-4">
                            <div className="text-5xl mb-4">👥</div>
                            <h2 className="text-2xl font-bold">Single or Group Mode?</h2>
                            <p>Design your own room or invite friends/partners to merge your aesthetics into a shared profile.</p>
                        </div>
                    </Step>
                    <Step>
                        <div className="space-y-4">
                            <div className="text-5xl mb-4">🔍</div>
                            <h2 className="text-2xl font-bold">Know Your Vibe</h2>
                            <p>Our 25-question visual quiz is the final step. It decrypts your design personality instantly.</p>
                        </div>
                    </Step>
                </Stepper>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-display font-bold text-primary mb-2">
                        Join VibeSpace
                    </h2>
                    <p className="text-gray-400">
                        Start your journey to a space that feels like you
                    </p>
                </div>

                <div className="bg-surface rounded-2xl shadow-xl p-8">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="input"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
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
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
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

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
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
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary font-medium hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
