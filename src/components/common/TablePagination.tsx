import React from 'react';

interface TablePaginationProps {
    currentPage: number;
    totalPages: number;
    rowsPerPage: number;
    startIndex: number;
    endIndex: number;
    totalItems: number;
    onRowsPerPageChange: (rows: number) => void;
    onPrevPage: () => void;
    onNextPage: () => void;
}

const TablePagination: React.FC<TablePaginationProps> = ({
    currentPage,
    totalPages,
    rowsPerPage,
    startIndex,
    endIndex,
    totalItems,
    onRowsPerPageChange,
    onPrevPage,
    onNextPage,
}) => {
    return (
        <div className="flex items-center justify-end px-6 py-4">
            <div className="flex items-center gap-8 text-[13px] text-[#667085]">
                {/* Rows per page */}
                <div className="flex items-center gap-2">
                    <span>Rows per page:</span>
                    <div className="relative group">
                        <select
                            value={rowsPerPage}
                            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
                            className="appearance-none bg-transparent pl-1 pr-6 py-1 font-medium text-[#101828] cursor-pointer outline-none hover:bg-gray-100/50 rounded-md transition-colors"
                        >
                            <option value={10}>10</option>
                            <option value={14}>14</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-[#667085]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Range display */}
                <span className="font-medium text-[#101828]">
                    {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
                </span>

                {/* Navigation */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onPrevPage}
                        disabled={currentPage === 1}
                        className="p-1 text-[#667085] hover:text-[#101828] disabled:opacity-30 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={onNextPage}
                        disabled={currentPage >= totalPages}
                        className="p-1 text-[#667085] hover:text-[#101828] disabled:opacity-30 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TablePagination;
