import React from 'react';

export interface Column<T> {
    header: string;
    key: keyof T | string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    onSort?: (key: string) => void;
    sortConfig?: { key: string; direction: 'asc' | 'desc' } | null;
    emptyMessage?: string;
    pagination?: React.ReactNode;
}

const DataTable = <T extends { id?: string | number; _id?: string }>({
    columns,
    data,
    loading,
    onSort,
    sortConfig,
    emptyMessage = 'No data found',
    pagination
}: DataTableProps<T>) => {
    return (
        <div className="rounded-xl shadow-sm overflow-hidden bg-white/60 backdrop-blur-[62.8px]">
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-[#D5D7DA] bg-[#F8F8F8]">
                                {columns.map((column, idx) => (
                                    <th
                                        key={idx}
                                        className={`px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider ${column.sortable ? 'cursor-pointer hover:text-gray-700 transition-colors' : ''} ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                                            }`}
                                        onClick={() => column.sortable && onSort?.(column.key as string)}
                                        style={{ width: column.width }}
                                    >
                                        <div className={`flex items-center gap-1 ${column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : 'justify-start'
                                            }`}>
                                            {column.header}
                                            {column.sortable && (
                                                <svg
                                                    className={`w-3 h-3 transition-transform ${sortConfig?.key === column.key && sortConfig.direction === 'desc' ? 'rotate-180' : ''}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                                </svg>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D5D7DA]">
                            {data.length > 0 ? (
                                data.map((item, rowIdx) => (
                                    <tr key={(item as any)._id ?? (item as any).id ?? rowIdx} className="hover:bg-gray-50/50 transition-colors group">
                                        {columns.map((column, idx) => (
                                            <td
                                                key={idx}
                                                className={`px-6 py-4 ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                                                    }`}
                                                style={{ width: column.width }}
                                            >
                                                {column.render ? column.render(item) : (item[column.key as keyof T] as React.ReactNode)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-12 text-center text-[#667085]">
                                        {emptyMessage}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            {!loading && pagination && (
                <div className="border-t border-[#D5D7DA]">
                    {pagination}
                </div>
            )}
        </div>
    );
};

export default DataTable;
