import React, { useEffect, useState } from 'react';
import questionService, { IQuestion, IQuestionListResponse } from '../services/QuestionService';
import StatusBadge from '../components/common/StatusBadge';
import DataTable from '../components/common/DataTable';
import TablePagination from '../components/common/TablePagination';
import UploadQuestionModal from '../components/common/UploadQuestionModal';

const QuestionManagement: React.FC = () => {
    const [data, setData] = useState<IQuestionListResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(14);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'text', direction: 'asc' });
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    useEffect(() => {
        loadQuestions();
    }, []);

    const loadQuestions = async () => {
        try {
            setLoading(true);
            const response = await questionService.getQuestions();
            setData(response);
        } catch (error) {
            console.error('Failed to load questions:', error);
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

    const getSortedQuestions = () => {
        if (!data?.questions) return [];

        let filtered = data.questions.filter((q: IQuestion) =>
            q.text.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortConfig) {
            filtered.sort((a: IQuestion, b: IQuestion) => {
                let aValue = a.text.toLowerCase();
                let bValue = b.text.toLowerCase();

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    };

    const sortedQuestions = getSortedQuestions();

    // Pagination logic
    const totalItems = sortedQuestions.length;
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedQuestions = sortedQuestions.slice(startIndex, endIndex);

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
        <div className="relative h-full w-full flex flex-col">
            <div className="space-y-6 flex-1">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Question Management</h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Easily toggle between activating and deactivating users to manage their access and visibility.
                    </p>
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

                    {/* Upload Questions Button */}
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium text-sm shadow-sm"
                        style={{ width: '15%' }}
                    >
                        Upload Questions
                    </button>
                </div>

                {/* Table */}
                <DataTable
                    columns={[
                        {
                            header: 'List of Question',
                            key: 'text',
                            sortable: true,
                            width: '80%',
                            render: (q: IQuestion) => <p className="text-gray-900 text-sm font-medium">{q.text}</p>
                        },
                        {
                            header: 'STATUS',
                            key: 'status',
                            width: '10%',
                            render: (q: IQuestion) => <StatusBadge status={q.status} />,
                            align: 'center'
                        },
                        {
                            header: 'ACTION',
                            key: 'action',
                            width: '10%',
                            render: () => (
                                <div className="flex items-center gap-1">
                                    <button className="p-2 text-[#475467] hover:text-primary transition-colors" title="Edit">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button className="p-2 text-[#475467] hover:text-primary transition-colors" title="More">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                        </svg>
                                    </button>
                                </div>
                            ),
                            align: 'center'
                        }
                    ]}
                    data={paginatedQuestions}
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
            {/* Upload Question Modal */}
            <UploadQuestionModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onSubmit={async (data: { file?: File; questions?: { text: string }[] }) => {
                    if (data.questions && data.questions.length > 0) {
                        try {
                            const newQs = data.questions.map(q => ({
                                text: q.text
                            }));
                            await questionService.addQuestions(newQs);
                            loadQuestions();
                        } catch (error) {
                            console.error('Failed to add questions:', error);
                        }
                    }
                    setIsUploadModalOpen(false);
                }}
            />
        </div>
    );
};

export default QuestionManagement;
