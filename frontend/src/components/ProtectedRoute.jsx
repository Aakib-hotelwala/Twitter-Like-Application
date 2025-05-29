import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuthStore();
  const location = useLocation();

  // If not logged in, redirect to login, but remember the current page
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user exists but their role is not allowed
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
