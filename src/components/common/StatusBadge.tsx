import React from 'react';

interface StatusBadgeProps {
    status: 'active' | 'inactive';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    if (status === 'active') {
        return (
            <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide text-[#27AE60] bg-[#B7FFDE45] min-w-[80px]">
                ACTIVE
            </span>
        );
    }

    return (
        <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide text-[#FF3B30] bg-[#FFF0EF] min-w-[80px]">
            IN ACTIVE
        </span>
    );
};

export default StatusBadge;
