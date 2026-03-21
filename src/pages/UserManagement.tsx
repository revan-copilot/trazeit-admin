import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

import userService, { IUser, IUserQueryParams } from '../services/UserService';
import StatusBadge from '../components/common/StatusBadge';
import Avatar from '../components/common/Avatar';
import DataTable from '../components/common/DataTable';
import TablePagination from '../components/common/TablePagination';
import AddUserDrawer from '../components/common/AddUserDrawer';
import SuccessPopup from '../components/common/SuccessPopup';
import Toast from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/** Format userType array into a human-readable label */
function formatUserType(types: string[]): string {
    const labels: Record<string, string> = {
        super_admin: 'Super Admin',
        admin: 'Administrator',
        producer: 'Producer',
        processor: 'Processor',
        retailer: 'Retailer',
    };
    return types.map(t => labels[t] || t).join(', ');
}

/** Build full location string from user fields */
function formatLocation(user: IUser): string {
    return [user.city, user.state, user.country].filter(Boolean).join(', ');
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

const UserManagement: React.FC = () => {
    const { user: authUser } = useAuth();
    const isSuperAdmin = authUser?.userType?.includes('super_admin') ?? false;
    const [users, setUsers] = useState<IUser[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<IUser | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
        { key: 'createdAt', direction: 'asc' }
    );
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastAction, setLastAction] = useState<'added' | 'updated'>('added');

    // ── Fetch Data ──────────────────────────────

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);

            const params: IUserQueryParams = {
                page: currentPage,
                limit: rowsPerPage,
                sort: sortConfig ? `${sortConfig.key}|${sortConfig.direction.toUpperCase()}` : 'createdAt|ASC',
                textSearch: searchTerm || undefined,
            };

            const result = await userService.getNonAdminUsers(params);

            setUsers(result.users);
            setTotalCount(result.totalCount);
        } catch (error) {
            console.error('Failed to load users:', error);
            setUsers([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, rowsPerPage, sortConfig, searchTerm]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // Reset to page 1 when search or rows-per-page changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, rowsPerPage]);

    // ── Sorting ─────────────────────────────────

    const handleSort = (key: string) => {
        setSortConfig((prev) => {
            if (prev && prev.key === key && prev.direction === 'asc') {
                return { key, direction: 'desc' };
            }
            return { key, direction: 'asc' };
        });
    };

    // ── Pagination ──────────────────────────────

    const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + users.length, totalCount);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    // ── Render ──────────────────────────────────

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Easily toggle between activating and deactivating users to manage their access and visibility.
                    </p>
                </div>
            </div>

            {/* Search and Actions Bar */}
            <div className="flex items-center gap-3">
                {/* Search Input */}
                <div className="flex-1 bg-white/60 backdrop-blur-md rounded-xl border-2 border-white shadow-sm">
                    <div className="relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#101828]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by name, keywords & more"
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 bg-transparent border-none rounded-lg focus:outline-none focus:ring-0 text-sm text-[#101828] placeholder-[#101828]/40"
                        />
                    </div>
                </div>

                {/* Filters Button */}
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D5D7DA] rounded-lg hover:bg-gray-50 transition-all font-medium text-sm text-[#344054]">
                    <span>Filters</span>
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Add User Button */}
                <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="py-2.5 bg-primary text-white rounded-lg hover:bg-primary-600 transition-all font-medium text-sm shadow-sm flex items-center justify-center min-w-[124px]"
                    style={{ width: '15%' }}
                >
                    Add User
                </button>
            </div>

            <AddUserDrawer
                isOpen={isDrawerOpen}
                onClose={() => {
                    setIsDrawerOpen(false);
                    setEditingUser(null);
                }}
                type="user"
                initialData={editingUser ? {
                    id: editingUser._id,
                    name: `${editingUser.firstName} ${editingUser.lastName}`,
                    phone: editingUser.phone,
                    email: editingUser.email,
                    location: formatLocation(editingUser),
                    status: editingUser.status,
                    avatar: editingUser.profilePic,
                    role: 'user',
                } : null}
                onAdd={async (newData) => {
                    try {
                        if (editingUser) {
                            const nameParts = newData.name.trim().split(/\s+/);
                            const firstName = nameParts[0] || editingUser.firstName;
                            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : (editingUser.lastName || '');

                            await userService.updateUser(editingUser._id, {
                                ...newData,
                                firstName,
                                lastName
                            });
                            setLastAction('updated');
                        } else {
                            await userService.createUser(newData);
                            setLastAction('added');
                        }
                        setIsDrawerOpen(false);
                        setIsSuccess(true);
                        setTimeout(() => {
                            setIsSuccess(false);
                            setEditingUser(null);
                        }, 2500);
                        loadUsers();
                    } catch (err: any) {
                        console.error('Failed to save user:', err);
                        setError(err.message || 'Failed to save details. Please try again.');
                        setTimeout(() => setError(null), 4000);
                        throw err;
                    }
                }}
            />

            <SuccessPopup
                isOpen={isSuccess}
                message={`You have successfully ${lastAction}\nthe user`}
            />
            {error && <Toast message={error} type="error" />}

            {/* Table */}
            <DataTable
                columns={[
                    {
                        header: 'USER NAME',
                        key: 'firstName',
                        sortable: true,
                        render: (user: IUser) => (
                            <div className="flex items-start gap-3">
                                <Avatar
                                    src={user.profilePic}
                                    firstName={user.firstName}
                                    lastName={user.lastName}
                                    size="sm"
                                    className="border border-[#D5D7DA]"
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-[#101828] mb-1">
                                        {user.firstName} {user.lastName}
                                    </span>
                                    <div className="flex items-center gap-2 text-xs text-[#667085]">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            +{user.countryCode} {user.phone}
                                        </div>
                                        <div className="w-px h-3 bg-[#667085]"></div>
                                        <div className="flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    },
                    {
                        header: 'ROLE',
                        key: 'userType',
                        align: 'center',
                        render: (user: IUser) => (
                            <span className="text-sm text-[#475467]">{formatUserType(user.userType)}</span>
                        )
                    },
                    {
                        header: 'LOCATION',
                        key: 'city',
                        align: 'center',
                        render: (user: IUser) => (
                            <span className="text-sm text-[#475467]">{formatLocation(user)}</span>
                        )
                    },
                    {
                        header: 'STATUS',
                        key: 'status',
                        render: (user: IUser) => <StatusBadge status={user.status} />
                    },
                    {
                        header: 'ACTION',
                        key: 'action',
                        width: '12%',
                        render: (user: IUser) => (
                            <div className="flex items-center gap-1">
                                {isSuperAdmin && (
                                    <button
                                        onClick={() => {
                                             setEditingUser(user);
                                             setIsDrawerOpen(true);
                                         }}
                                         className="p-2 text-[#475467] hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                                         title="Edit"
                                     >
                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                         </svg>
                                     </button>
                                 )}
                                 <Link
                                     to={`/user-management/${user._id}`}
                                     className="p-2 text-[#475467] hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                                     title="View Details"
                                 >
                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                     </svg>
                                 </Link>
                            </div>
                        )
                    }
                ]}
                data={users}
                loading={loading}
                onSort={handleSort}
                sortConfig={sortConfig}
                pagination={
                    !loading && (
                        <TablePagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            rowsPerPage={rowsPerPage}
                            startIndex={startIndex}
                            endIndex={endIndex}
                            totalItems={totalCount}
                            onRowsPerPageChange={setRowsPerPage}
                            onPrevPage={handlePrevPage}
                            onNextPage={handleNextPage}
                        />
                    )
                }
            />
        </div>
    );
};

export default UserManagement;
