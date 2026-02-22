import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();

    // Loading state while hydrating from localStorage
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-body flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-gradient-body">
            <Sidebar />
            <main className="ml-[80px] min-h-screen p-6">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
