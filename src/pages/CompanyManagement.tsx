import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

import companyService, { ICompany, ICompanyListResponse } from '../services/CompanyService';
import StatusBadge from '../components/common/StatusBadge';
import Avatar from '../components/common/Avatar';
import CompanyLogo from '../components/common/CompanyLogo';
import DataTable from '../components/common/DataTable';
import TablePagination from '../components/common/TablePagination';
import CreateCompanySidebar from '../components/admin/CreateCompanySidebar';
import SuccessPopup from '../components/common/SuccessPopup';

const CompanyManagement: React.FC = () => {
    const [companies, setCompanies] = useState<ICompany[]>([]);
    const [pagination, setPagination] = useState<ICompanyListResponse['pagination'] | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(12);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [isCreateCompanyOpen, setIsCreateCompanyOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<ICompany | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const loadCompanies = useCallback(async () => {
        try {
            setLoading(true);
            const response = await companyService.getCompanies(currentPage, rowsPerPage);
            setCompanies(response.companies || []);
            setPagination(response.pagination || null);
        } catch (error) {
            console.error('Failed to load companies:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, rowsPerPage]);

    useEffect(() => {
        loadCompanies();
    }, [loadCompanies]);

    const handleSort = (key: string) => {
        setSortConfig((prev) => {
            if (prev && prev.key === key && prev.direction === 'asc') {
                return { key, direction: 'desc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (pagination && currentPage < pagination.totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleEdit = (company: ICompany) => {
        setEditingCompany(company);
        setIsCreateCompanyOpen(true);
    };

    const handleCloseSidebar = () => {
        setIsCreateCompanyOpen(false);
        setEditingCompany(null);
    };

    const columns = [
        {
            header: 'COMPANY INFO',
            key: 'name',
            sortable: true,
            render: (company: ICompany) => (
                <div className="flex items-start gap-3">
                    <CompanyLogo
                        type={company.companyLogo}
                        imageUrl={company.images?.[0]}
                        name={company.name || company.companyName}
                        className="rounded-lg w-10 h-10"
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[#101828]">{company.name || company.companyName || 'N/A'}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'LOCATION',
            key: 'address1',
            render: (company: ICompany) => {
                const parts = [
                    company.address1,
                    company.city,
                    company.state,
                    company.country
                ].filter(Boolean);

                const locationStr = parts.length > 0 ? parts.join(', ') : (typeof company.location === 'string' ? company.location : 'N/A');

                return (
                    <span className="text-sm text-[#475467] leading-relaxed block max-w-[280px]">
                        {locationStr}
                    </span>
                );
            }
        },
        {
            header: 'CONTACT PERSON',
            key: 'data.ownerName',
            sortable: true,
            render: (company: ICompany) => (
                <div className="flex items-center gap-3">
                    <Avatar
                        src={company.contactPerson?.avatar}
                        name={company.data?.ownerName || company.contactPerson?.name || 'Unknown'}
                        size="sm"
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-[#101828]">{company.data?.ownerName || company.contactPerson?.name || 'N/A'}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'STATUS',
            key: 'status',
            align: 'center' as const,
            render: (company: ICompany) => <StatusBadge status={company.status} />
        },
        {
            header: 'ACTION',
            key: '_id',
            align: 'right' as const,
            render: (company: ICompany) => (
                <div className="flex items-center justify-end gap-1">
                    <button
                        onClick={() => handleEdit(company)}
                        className="p-2 text-[#475467] hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit Company"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    <Link
                        to={`/company-management/${company._id || (company as any).id}`}
                        className="p-2 text-[#475467] hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Company"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </Link>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">Company Management</h1>
                <p className="text-gray-500 mt-1 text-sm max-w-2xl">
                    Manage your companies, their locations, and contact information efficiently.
                </p>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3">
                {/* Search Input */}
                <div className="flex-1 bg-white/60 backdrop-blur-md rounded-xl border-2 border-white shadow-sm">
                    <div className="relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#101828]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by company name, keywords & more"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 bg-transparent rounded-lg focus:outline-none focus:ring-0 text-sm text-[#101828] placeholder-[#101828]/40"
                        />
                    </div>
                </div>

                {/* Filters Button */}
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D5D7DA] rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-[#344054]">
                    <span>Filters</span>
                    <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                <button
                    onClick={() => setIsCreateCompanyOpen(true)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium text-sm shadow-sm min-w-[140px]"
                >
                    Create Company
                </button>
            </div>

            {/* Table */}
            <DataTable
                columns={columns}
                data={companies.filter(a =>
                    (a.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                    (a.companyName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                    (a.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                    (a.data?.ownerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                    (a.contactPerson?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
                )}
                loading={loading}
                onSort={handleSort}
                sortConfig={sortConfig}
                pagination={
                    pagination && (
                        <TablePagination
                            currentPage={currentPage}
                            totalPages={pagination.totalPages}
                            rowsPerPage={rowsPerPage}
                            startIndex={(currentPage - 1) * rowsPerPage + 1}
                            endIndex={Math.min(currentPage * rowsPerPage, pagination.total)}
                            totalItems={pagination.total}
                            onRowsPerPageChange={setRowsPerPage}
                            onPrevPage={handlePrevPage}
                            onNextPage={handleNextPage}
                        />
                    )
                }
            />

            <CreateCompanySidebar
                isOpen={isCreateCompanyOpen}
                onClose={handleCloseSidebar}
                initialData={editingCompany}
                onSuccess={() => {
                    loadCompanies();
                    setIsSuccess(true);
                    setTimeout(() => setIsSuccess(false), 2500);
                }}
            />

            <SuccessPopup
                isOpen={isSuccess}
                message={`You have successfully ${editingCompany ? 'updated' : 'added'}\nthe company`}
            />
        </div>
    );
};

export default CompanyManagement;
