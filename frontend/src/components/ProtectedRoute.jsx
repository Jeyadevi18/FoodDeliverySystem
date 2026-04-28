import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (role && user.role !== role) {
        // Redirect to correct dashboard instead of home
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        if (user.role === 'delivery') return <Navigate to="/delivery" replace />;
        return <Navigate to="/customer" replace />;
    }
    return children;
};

export default ProtectedRoute;
