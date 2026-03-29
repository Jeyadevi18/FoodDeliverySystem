import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Customer pages
import CustomerDashboard from './pages/customer/Dashboard';
import Menu from './pages/customer/Menu';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderHistory from './pages/customer/OrderHistory';
import Tracking from './pages/customer/Tracking';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminFoods from './pages/admin/Foods';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';

// Delivery pages
import DeliveryDashboard from './pages/delivery/Dashboard';
import DeliveryTracking from './pages/delivery/Tracking';

function App() {
    const { user } = useAuth();

    const getDashboard = () => {
        if (!user) return '/login';
        if (user.role === 'admin') return '/admin';
        if (user.role === 'delivery') return '/delivery';
        return '/customer';
    };

    return (
        <Router>
            <Navbar />
            <Routes>
                {/* Public */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={user ? <Navigate to={getDashboard()} /> : <Login />} />
                <Route path="/register" element={user ? <Navigate to={getDashboard()} /> : <Register />} />

                {/* Customer */}
                <Route path="/customer" element={<ProtectedRoute role="customer"><CustomerDashboard /></ProtectedRoute>} />
                <Route path="/customer/menu" element={<ProtectedRoute role="customer"><Menu /></ProtectedRoute>} />
                <Route path="/customer/cart" element={<ProtectedRoute role="customer"><Cart /></ProtectedRoute>} />
                <Route path="/customer/checkout" element={<ProtectedRoute role="customer"><Checkout /></ProtectedRoute>} />
                <Route path="/customer/orders" element={<ProtectedRoute role="customer"><OrderHistory /></ProtectedRoute>} />
                <Route path="/customer/tracking/:id" element={<ProtectedRoute role="customer"><Tracking /></ProtectedRoute>} />

                {/* Admin */}
                <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/foods" element={<ProtectedRoute role="admin"><AdminFoods /></ProtectedRoute>} />
                <Route path="/admin/orders" element={<ProtectedRoute role="admin"><AdminOrders /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />

                {/* Delivery */}
                <Route path="/delivery" element={<ProtectedRoute role="delivery"><DeliveryDashboard /></ProtectedRoute>} />
                <Route path="/delivery/tracking/:id" element={<ProtectedRoute role="delivery"><DeliveryTracking /></ProtectedRoute>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
