import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Landing from './pages/Landing';
import ModeSelect from './pages/ModeSelect';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import MoodBoard from './pages/MoodBoard';
import Dashboard from './pages/Dashboard';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Register from './pages/Register';
import AestheticReport from './pages/AestheticReport';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

// Quiz Protected Route (requires auth)
const QuizRoute = ({ children }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // If quiz already complete, redirect to dashboard
    if (user?.quiz_complete) {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

function AppContent() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected Routes */}
                    <Route
                        path="/mode-select"
                        element={
                            <ProtectedRoute>
                                <ModeSelect />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/quiz"
                        element={
                            <QuizRoute>
                                <Quiz />
                            </QuizRoute>
                        }
                    />
                    <Route
                        path="/result"
                        element={
                            <ProtectedRoute>
                                <Result />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/aesthetic-report"
                        element={
                            <ProtectedRoute>
                                <AestheticReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/moodboard"
                        element={
                            <ProtectedRoute>
                                <MoodBoard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/product/:id"
                        element={
                            <ProtectedRoute>
                                <ProductDetail />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/cart"
                        element={
                            <ProtectedRoute>
                                <Cart />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/wishlist"
                        element={
                            <ProtectedRoute>
                                <Wishlist />
                            </ProtectedRoute>
                        }
                    />

                    {/* 404 */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ProfileProvider>
                    <AppContent />
                </ProfileProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
