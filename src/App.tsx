import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import ProductManagement from './pages/ProductManagement';
import QuestionManagement from './pages/QuestionManagement';
import UserManagement from './pages/UserManagement';
import QRManagement from './pages/QRManagement';
import SettingsLayout from './components/layout/SettingsLayout';
import ProfileSettings from './pages/settings/ProfileSettings';
import QRDetails from './pages/QRDetails';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />

                {/* Protected Routes */}
                <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<Navigate to="/user-management" replace />} />
                    <Route path="/admin-management" element={<Navigate to="/user-management" replace />} />
                    <Route path="/user-management" element={<UserManagement />} />
                    <Route path="/products" element={<ProductManagement />} />
                    <Route path="/qr-management" element={<QRManagement />} />
                    <Route path="/qr-management/:id" element={<QRDetails />} />
                    <Route path="/documents" element={<QuestionManagement />} />
                    <Route path="/tasks" element={<ComingSoon title="Tasks" />} />
                    <Route path="/maximize" element={<ComingSoon title="Maximize" />} />
                    <Route path="/help" element={<ComingSoon title="Help" />} />

                    {/* Settings Nested Routes */}
                    <Route path="/settings" element={<SettingsLayout />}>
                        <Route index element={<Navigate to="/settings/details" replace />} />
                        <Route path="details" element={<ProfileSettings />} />
                        <Route path="profile" element={<ComingSoon title="Profile" />} />
                        <Route path="password" element={<ComingSoon title="Password" />} />
                        <Route path="notifications" element={<ComingSoon title="Notifications" />} />
                    </Route>
                </Route>

                {/* Redirect root to login */}
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

// Placeholder component for pages not yet implemented
function ComingSoon({ title }: { title: string }) {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
                <p className="text-gray-500">This page is coming soon.</p>
            </div>
        </div>
    );
}

export default App;
