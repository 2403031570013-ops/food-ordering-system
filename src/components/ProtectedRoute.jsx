import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, isLoading } = useAuthStore();

    if (isLoading) {
        return <div>Loading...</div>; // Or a proper spinner
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If user has not selected a role yet, force them to select-role page.
    // Unless they are already ON the select-role page (handled by App routing)
    // Check if current path is select-role? No, this component wraps other pages.
    if (user.firstLogin) {
        return <Navigate to="/select-role" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
