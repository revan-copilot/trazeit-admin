import React from 'react';

interface ProductStepBadgeProps {
    name: string;
    quantity: string;
}

export const ProductStepBadge: React.FC<ProductStepBadgeProps> = ({ name, quantity }) => {
    return (
        <div className="flex items-center bg-white border border-[#E9EAEB] rounded-lg px-3 py-1.5 shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)] whitespace-nowrap">
            <span className="text-xs font-medium text-gray-700 mr-1">{name}</span>
            <span className="text-xs text-gray-400 mx-1">-</span>
            <span className="text-xs font-semibold text-primary-600">{quantity}</span>
        </div>
    );
};
