import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import qrService, { IQRCode, IQRListResponse } from '../services/QRService';
import DataTable from '../components/common/DataTable';
import TablePagination from '../components/common/TablePagination';

const GradeBadge: React.FC<{ text: string; type: 'green' | 'blue' | 'orange' }> = ({ text, type }) => {
    const styles = {
        green: 'bg-[#ECFDF3] text-[#16A34A] border-[#ABEFC6]',
        blue: 'bg-[#EFF8FF] text-[#2563EB] border-[#B2DDFF]',
        orange: 'bg-[#FFFAEB] text-[#F59E0B] border-[#FEDF89]',
    };

    const icons: Record<'green' | 'blue' | 'orange', string> = {
        green: '/assets/Leaf--Streamline-Lucide.svg',
        blue: '/assets/Shield--Streamline-Lucide.svg',
        orange: '/assets/Award--Streamline-Lucide.svg',
    };

    return (
        <span className={`pl-1 pr-2 py-0.5 rounded-full border text-[10px] font-medium whitespace-nowrap flex items-center gap-1.5 ${styles[type]}`}>
            <img src={icons[type]} alt="" className="w-3 h-3 object-contain" />
            {text}
        </span>
    );
};

const QRManagement: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<IQRListResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(14);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await qrService.getQRScans();
            setData(response);
        } catch (error) {
            console.error('Failed to load QR scans:', error);
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

    const getFilteredData = (): IQRCode[] => {
        if (!data?.qr_scans) return [];

        let filtered = [...data.qr_scans].filter((item: IQRCode) =>
            item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.qrCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.location.company.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortConfig) {
            filtered.sort((a: IQRCode, b: IQRCode) => {
                const key = sortConfig.key as keyof IQRCode;
                if (key === 'location') {
                    const aVal = a.location.company.toLowerCase();
                    const bVal = b.location.company.toLowerCase();
                    return sortConfig.direction === 'asc'
                        ? aVal.localeCompare(bVal)
                        : bVal.localeCompare(aVal);
                }

                let aValue = a[key];
                let bValue = b[key];

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                    return sortConfig.direction === 'asc'
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                }

                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
                }

                return 0;
            });
        }

        return filtered;
    };

    const filteredData = getFilteredData();
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
    const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, rowsPerPage]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">QR Management</h1>
                <p className="text-gray-500 mt-1 text-sm">
                    Easily manage users to control their access and visibility after QR scans.
                </p>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex-1 bg-white/60 backdrop-blur-md rounded-xl border-2 border-white shadow-sm">
                    <div className="relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#101828]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by keywords & more"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 bg-transparent rounded-lg focus:outline-none focus:ring-0 text-sm text-[#101828] placeholder-[#101828]/40"
                        />
                    </div>
                </div>

                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D5D7DA] rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-[#344054]">
                    <span>Filters</span>
                    <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>

            <DataTable
                columns={[
                    {
                        header: 'PRODUCT NAME',
                        key: 'productName',
                        sortable: true,
                        render: (item: IQRCode) => (
                            <div className="py-1">
                                <p className="font-medium text-[#101828] text-sm leading-tight">{item.productName}</p>
                                <div className="flex items-center gap-1.5 text-[11px] text-[#667085] mt-1 font-normal">
                                    <span className="flex items-center gap-1 whitespace-nowrap">
                                        <img
                                            src="/assets/Qr-Code-2--Streamline-Rounded-Material.svg"
                                            alt=""
                                            className="w-4 h-4 object-contain"
                                        />
                                        QR: {item.qrCode}
                                    </span>
                                    <span className="text-[#D0D5DD]">|</span>
                                    <span className="whitespace-nowrap">Batch: {item.batch}</span>
                                </div>
                            </div>
                        )
                    },
                    {
                        header: 'NO. OF USERS SCANNED',
                        key: 'scans',
                        sortable: true,
                        render: (item: IQRCode) => (
                            <p className="text-gray-900 text-sm">{item.scans}</p>
                        )
                    },
                    {
                        header: 'GRADES',
                        key: 'grades',
                        render: (item: IQRCode) => (
                            <div className="flex flex-wrap gap-2">
                                {item.grades.map((grade, idx) => (
                                    <GradeBadge key={idx} text={grade.text} type={grade.type} />
                                ))}
                            </div>
                        )
                    },
                    {
                        header: 'LOCATION',
                        key: 'location.company',
                        render: (item: IQRCode) => (
                            <div>
                                <p className="text-gray-900 text-sm font-medium">{item.location.company}</p>
                                <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {item.location.address}
                                </p>
                            </div>
                        )
                    },
                    {
                        header: 'ACTION',
                        key: 'id',
                        render: (item: IQRCode) => (
                            <button
                                onClick={() => navigate(`/qr-management/${item.id || '123'}`)}
                                className="p-2 text-[#475467] hover:text-primary transition-colors"
                                title="View Details"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                        )
                    }
                ]}
                data={paginatedData}
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
        </div>
    );
};

export default QRManagement;
