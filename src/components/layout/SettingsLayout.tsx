import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SettingsLayout: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const settingsNavItems = [
        {
            label: 'My details',
            path: '/settings/details',
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 15C4 15 5 14 8 14C11 14 13 16 16 16C19 16 20 15 20 15V3C20 3 19 4 16 4C13 4 11 2 8 2C5 2 4 3 4 3V15ZM4 15V22" />
                </svg>
            )
        },
        {
            label: 'Profile',
            path: '/settings/profile',
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" />
                </svg>
            ),
            badge: '10'
        },
        {
            label: 'Password',
            path: '/settings/password',
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15.5 7.5L19 4M21 2L19 4L21 2ZM11.39 11.61C11.9063 12.1195 12.3168 12.726 12.5978 13.3948C12.8787 14.0635 13.0246 14.7813 13.027 15.5066C13.0295 16.232 12.8884 16.9507 12.6119 17.6213C12.3354 18.2919 11.9291 18.9012 11.4161 19.4141C10.9032 19.9271 10.2939 20.3334 9.6233 20.6099C8.95268 20.8864 8.234 21.0275 7.50863 21.025C6.78327 21.0226 6.06554 20.8767 5.39679 20.5958C4.72804 20.3148 4.12147 19.9043 3.612 19.388C2.61013 18.3507 2.05576 16.9614 2.06829 15.5193C2.08082 14.0772 2.65925 12.6977 3.679 11.678C4.69874 10.6583 6.07821 10.0798 7.52029 10.0673C8.96238 10.0548 10.3517 10.6091 11.389 11.611L11.39 11.61ZM11.39 11.61L15.5 7.5L11.39 11.61ZM15.5 7.5L18.5 10.5L22 7L19 4L15.5 7.5Z" />
                </svg>
            )
        },
        {
            label: 'Notifications',
            path: '/settings/notifications',
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13.73 21C13.5542 21.3031 13.3018 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" />
                </svg>
            )
        }
    ];

    return (
        <div className="flex -m-6 h-[calc(100vh-0px)] overflow-hidden">
            {/* Secondary Sidebar */}
            <div className="w-64 bg-[#07275D] border-r border-white/10 flex flex-col justify-between">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-white mb-6">Settings</h2>

                    <nav className="space-y-1">
                        {settingsNavItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center justify-between px-3 py-2 rounded-lg transition-colors group
                                    ${isActive
                                        ? 'bg-white/10 text-white shadow-sm'
                                        : 'text-[#C9D9FF]/80 hover:bg-white/5 hover:text-white'}`
                                }
                            >
                                <div className="flex items-center space-x-3">
                                    <span className="flex items-center justify-center">
                                        {item.icon}
                                    </span>
                                    <span className="text-sm font-medium">{item.label}</span>
                                </div>
                                {item.badge && (
                                    <span className="bg-[#F2F4F7] text-[#344054] text-[10px] px-2 py-0.5 rounded-full font-bold">
                                        {item.badge}
                                    </span>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Bottom Navigation / User Profile */}
                {user && (
                    <div className="p-4">
                        <div className="flex items-center justify-between group cursor-pointer p-2 rounded-lg">
                            <div className="flex items-center space-x-3 overflow-hidden">
                                <div className="overflow-hidden">
                                    <p className="text-sm font-semibold text-white truncate">{user.firstName} {user.lastName}</p>
                                    <p className="text-xs text-white/50 truncate">{user.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-white/50 hover:text-white transition-colors ml-2"
                                title="Logout"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto" style={{ background: 'linear-gradient(45deg, #A6C0FE 0%, #E6ECFB 100%)' }}>
                <Outlet />
            </div>
        </div>
    );
};

export default SettingsLayout;
