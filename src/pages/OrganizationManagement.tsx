import React, { useEffect, useState } from 'react';
import adminService, { IAdmin, IAdminListResponse } from '../services/AdminService';
import StatusBadge from '../components/common/StatusBadge';
import CompanyLogo from '../components/common/CompanyLogo';
import Avatar from '../components/common/Avatar';

import CreateAdminSidebar from '../components/admin/CreateAdminSidebar';
import DataTable from '../components/common/DataTable';
import TablePagination from '../components/common/TablePagination';

const OrganizationManagement: React.FC = () => {
    const [data, setData] = useState<IAdminListResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);

    useEffect(() => {
        loadAdmins();
    }, []);

    const loadAdmins = async () => {
        try {
            setLoading(true);
            const response = await adminService.getAdmins();
            setData(response);
        } catch (error) {
            console.error('Failed to load admins:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortedAdmins = () => {
        if (!data?.admins) return [];

        let filtered = data.admins.filter((admin: IAdmin) =>
            admin.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.contactPerson.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortConfig) {
            filtered.sort((a, b) => {
                let aValue = '';
                let bValue = '';

                if (sortConfig.key === 'companyName') {
                    aValue = a.companyName.toLowerCase();
                    bValue = b.companyName.toLowerCase();
                } else if (sortConfig.key === 'contactPerson.name') {
                    aValue = a.contactPerson.name.toLowerCase();
                    bValue = b.contactPerson.name.toLowerCase();
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    };

    const sortedAdmins = getSortedAdmins();

    // Pagination logic
    const totalItems = sortedAdmins.length;
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedAdmins = sortedAdmins.slice(startIndex, endIndex);

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, rowsPerPage]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
                <p className="text-gray-500 mt-1 text-sm">
                    Easily toggle between activating and deactivating users to manage their access and visibility.
                </p>
            </div>

            {/* Search and Actions Bar */}
            <div className="flex items-center gap-3">
                {/* Search Input */}
                <div className="flex-1">
                    <div className="relative">
                        <svg
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by name, keywords & more"
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 bg-white border border-[#D5D7DA] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
                        />
                    </div>
                </div>

                {/* Filters Button */}
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D5D7DA] rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-gray-700 text-sm font-medium">Filters</span>
                    <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Create Admin Button */}
                <button
                    onClick={() => setIsCreateAdminOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium text-sm"
                >
                    Create Admin
                </button>
            </div>

            {/* Table */}
            <DataTable
                columns={[
                    {
                        header: 'Admin Info',
                        key: 'companyName',
                        sortable: true,
                        render: (admin: IAdmin) => (
                            <div className="flex items-center gap-3">
                                <CompanyLogo type={admin.companyLogo} />
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">{admin.companyName}</p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            {admin.phone}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            {admin.email}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    },
                    {
                        header: 'Location',
                        key: 'location',
                        render: (admin: IAdmin) => (
                            <div className="text-gray-700 text-sm max-w-[220px]">
                                {admin.location.split(',').map((part: string, idx: number, arr: string[]) => (
                                    <React.Fragment key={idx}>
                                        {part.trim()}
                                        {idx < arr.length - 1 && ','}
                                        {idx === Math.floor((arr.length - 1) / 2) && <br />}
                                    </React.Fragment>
                                ))}
                            </div>
                        )
                    },
                    {
                        header: 'Contact Person',
                        key: 'contactPerson.name',
                        sortable: true,
                        render: (admin: IAdmin) => (
                            <div className="flex items-center gap-3">
                                <Avatar src={admin.contactPerson.avatar} name={admin.contactPerson.name} size="sm" />
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">{admin.contactPerson.name}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {admin.contactPerson.phone}
                                    </p>
                                </div>
                            </div>
                        )
                    },
                    {
                        header: 'Status',
                        key: 'status',
                        render: (admin: IAdmin) => <StatusBadge status={admin.status} />
                    },
                    {
                        header: 'Action',
                        key: 'action',
                        render: () => (
                            <div className="flex items-center gap-1">
                                <button
                                    className="p-2 text-[#475467] hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                                <button
                                    className="p-2 text-[#475467] hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                                    title="More"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </button>
                            </div>
                        )
                    }
                ]}
                data={paginatedAdmins}
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
                            totalItems={totalItems}
                            onRowsPerPageChange={setRowsPerPage}
                            onPrevPage={handlePrevPage}
                            onNextPage={handleNextPage}
                        />
                    )
                }
            />

            {/* Create Admin Drawer */}
            <CreateAdminSidebar
                isOpen={isCreateAdminOpen}
                onClose={() => setIsCreateAdminOpen(false)}
            />
        </div>
    );
};

export default OrganizationManagement;
