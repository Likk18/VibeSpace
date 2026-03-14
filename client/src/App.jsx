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
import Checkout from './pages/Checkout';
import Settings from './pages/Settings';
import VibePay from './pages/VibePay';
import Orders from './pages/Orders';
import Security from './pages/Security';
import FAQ from './pages/FAQ';
import Invite from './pages/Invite';
import JoinGroup from './pages/JoinGroup';
import InviteMembers from './pages/InviteMembers';

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

// Quiz Route (supports guest mode and group members)
const QuizRoute = ({ children }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    // If authenticated and quiz complete → redirect to result
    if (isAuthenticated && user?.quiz_complete) {
        return <Navigate to="/result" />;
    }

    return children;
};

function AppContent() {
    return (
        <div className="flex flex-col min-h-screen bg-white w-full overflow-x-hidden">
            <Navbar />
            <main className="flex-grow">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/join/:inviteCode" element={<JoinGroup />} />
                    <Route path="/quiz/invite" element={<Invite />} />
                    <Route path="/invite-members" element={<InviteMembers />} />

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
                        path="/checkout"
                        element={
                            <ProtectedRoute>
                                <Checkout />
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
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <Settings />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/vibepay"
                        element={
                            <ProtectedRoute>
                                <VibePay />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/orders"
                        element={
                            <ProtectedRoute>
                                <Orders />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/security"
                        element={
                            <ProtectedRoute>
                                <Security />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/faq"
                        element={<FAQ />}
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
