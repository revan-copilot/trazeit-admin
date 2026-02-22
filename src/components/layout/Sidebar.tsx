import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

interface NavItem {
    icon: (isActive: boolean) => React.ReactNode;
    label: string;
    path: string;
}

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // TOP MENU ITEMS (main navigation)
    const topNavItems: NavItem[] = [
        {
            icon: (isActive) => (
                <svg className={`w-6 h-6 ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/80'}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 17L12 22L22 17M2 12L12 17L22 12M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            label: 'Products',
            path: '/products',
        },
        {
            icon: (isActive) => (
                <svg className={`w-6 h-6 ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/80'}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            label: 'Documents',
            path: '/documents',
        },
        {
            icon: (isActive) => (
                <svg className={`w-6 h-6 ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/80'}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 11L12 14L22 4M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            label: 'Tasks',
            path: '/tasks',
        },
        {
            icon: (isActive) => (
                <svg className={`w-6 h-6 ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/80'}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5V8M21 8V5C21 4.46957 20.7893 3.96086 20.4142 3.58579C20.0391 3.21071 19.5304 3 19 3H16M16 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.0391 20.7893 21 19.5304 21 19V16M3 16V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            label: 'QR Management',
            path: '/qr-management',
        },
        {
            icon: (isActive) => (
                <svg className={`w-6 h-6 ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/80'}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            label: 'User Management',
            path: '/user-management',
        },
    ];

    const bottomNavItems: NavItem[] = [
        {
            icon: (isActive) => (
                <svg className={`w-6 h-6 ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/80'}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                    <path d="M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M14.83 9.17l4.24-4.24M4.93 19.07l4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            label: 'Help',
            path: '/help',
        },
        {
            icon: (isActive) => (
                <svg className={`w-6 h-6 ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/80'}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            label: 'Settings',
            path: '/settings',
        },
    ];

    const renderNavItem = (item: NavItem) => (
        <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
                `w-12 h-12 rounded-md flex items-center justify-center transition-all duration-200 group relative
        ${isActive
                    ? 'bg-[#07275D] text-white shadow-lg'
                    : 'text-white/50 hover:text-white/80'
                }`
            }
            title={item.label}
        >
            {({ isActive }) => (
                <>
                    {item.icon(isActive)}
                    {/* Tooltip */}
                    <span className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                        {item.label}
                    </span>
                </>
            )}
        </NavLink>
    );

    return (
        <aside className="fixed left-0 top-0 h-screen w-[80px] bg-primary flex flex-col items-center z-50 shadow-xl">
            {/* Logo */}
            <div className="w-full flex justify-center py-6 mb-8 bg-[#07275D]/[0.58]">
                <img
                    src="/assets/Trazeit-logo White 1.png"
                    alt="Trazeit"
                    className="w-auto h-auto object-contain"
                />
            </div>

            {/* TOP Navigation */}
            <nav className="flex flex-col items-center space-y-1">
                {topNavItems.map(renderNavItem)}
            </nav>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* BOTTOM Navigation (Help & Settings) */}
            <nav className="flex flex-col items-center space-y-1 mb-4">
                {bottomNavItems.map(renderNavItem)}
            </nav>

            {/* Divider */}
            <div className="w-10 h-px bg-white/20 mb-4"></div>

            {/* User Profile & Logout */}
            <div className="pb-4 flex flex-col items-center space-y-4">
                {/* Avatar / Profile Link */}
                <button
                    onClick={() => navigate('/settings/details')}
                    className="rounded-full border-[3px] border-[#c4b5e0] hover:border-white/80 transition-colors group relative"
                    title="Profile"
                >
                    <Avatar
                        src={user?.profilePic}
                        firstName={user?.firstName}
                        lastName={user?.lastName}
                        size="md"
                    />
                    <span className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                        Profile
                    </span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
