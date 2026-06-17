import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import qrService, { IQRCode } from '../services/QRService';
import DataTable from '../components/common/DataTable';
import TablePagination from '../components/common/TablePagination';
import { assetPath } from '../utils/assetPath';

const QRManagement: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<IQRCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await qrService.getQRScans();
            setData(response.data);
            setTotalCount(response.totalCount);
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
        if (!data) return [];

        let filtered = [...data].filter((item: IQRCode) =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.batch?.batchNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.createdBy.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.createdBy.lastName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortConfig) {
            filtered.sort((a: IQRCode, b: IQRCode) => {
                const key = sortConfig.key as keyof IQRCode;
                
                let aValue: any = a[key] || '';
                let bValue: any = b[key] || '';

                if (key === 'batch') {
                    aValue = a.batch?.batchNo || '';
                    bValue = b.batch?.batchNo || '';
                } else if (key === 'createdBy' as any) {
                    aValue = `${a.createdBy.firstName} ${a.createdBy.lastName}`;
                    bValue = `${b.createdBy.firstName} ${b.createdBy.lastName}`;
                }

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                    return sortConfig.direction === 'asc'
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
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
                    Track and manage batch activities and product QR scans in real-time.
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
                            placeholder="Search by activity, batch, or creator..."
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
                        header: 'BATCH ACTIVITY',
                        key: 'title',
                        sortable: true,
                        render: (item: IQRCode) => (
                            <div className="py-1">
                                <p className="font-medium text-[#101828] text-sm leading-tight">{item.title}</p>
                                <div className="flex items-center gap-1.5 text-[11px] text-[#667085] mt-1 font-normal">
                                    <span className="flex items-center gap-1 whitespace-nowrap">
                                        <img
                                            src={assetPath('assets/Qr-Code-2--Streamline-Rounded-Material.svg')}
                                            alt=""
                                            className="w-4 h-4 object-contain"
                                        />
                                        ID: {item._id.substring(0, 8)}
                                    </span>
                                    {item.batch && (
                                        <>
                                            <span className="text-[#D0D5DD]">|</span>
                                            <span className="whitespace-nowrap">Batch: {item.batch.batchNo}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    },
                    {
                        header: 'PRODUCT',
                        key: 'product',
                        render: (item: IQRCode) => (
                            <div className="flex items-center gap-2">
                                {item.product && item.product.length > 0 ? (
                                    <>
                                        {item.product[0].images?.[0] && (
                                            <img 
                                                src={item.product[0].images[0]} 
                                                alt="" 
                                                className="w-8 h-8 rounded-lg object-cover bg-gray-50"
                                            />
                                        )}
                                        <p className="text-gray-900 text-sm truncate max-w-[150px]">
                                            {item.product[0].name}
                                        </p>
                                    </>
                                ) : (
                                    <span className="text-gray-400 text-xs italic">No product linked</span>
                                )}
                            </div>
                        )
                    },
                    {
                        header: 'CREATED BY',
                        key: 'createdBy',
                        render: (item: IQRCode) => (
                            <div className="flex items-center gap-3">
                                <img 
                                    src={item.createdBy.profilePic?.trim()} 
                                    alt="" 
                                    className="w-8 h-8 rounded-full border border-gray-100 object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${item.createdBy.firstName}+${item.createdBy.lastName}&background=random`;
                                    }}
                                />
                                <div>
                                    <p className="text-sm font-medium text-gray-900 leading-tight">
                                        {item.createdBy.firstName} {item.createdBy.lastName}
                                    </p>
                                    <p className="text-[11px] text-gray-500 mt-0.5">{item.createdBy.phone}</p>
                                </div>
                            </div>
                        )
                    },
                    {
                        header: 'STATUS',
                        key: 'status',
                        render: (item: IQRCode) => (
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                                item.status === 'active' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-gray-50 text-gray-700 border-gray-200'
                            }`}>
                                {item.status}
                            </span>
                        )
                    },
                    {
                        header: 'DATE',
                        key: 'createdAt',
                        render: (item: IQRCode) => (
                            <p className="text-gray-500 text-[11px]">
                                {new Date(item.createdAt).toLocaleDateString(undefined, { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                })}
                            </p>
                        )
                    },
                    {
                        header: 'ACTION',
                        key: '_id',
                        render: (item: IQRCode) => (
                            <button
                                onClick={() => navigate(`/qr-management/${item.batch?._id || item._id}`)}
                                className="p-2 text-[#475467] hover:text-primary transition-colors rounded-lg hover:bg-gray-50 focus:outline-none"
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

export default QRManagement;
