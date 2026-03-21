import React from 'react';

interface CompanyLogoProps {
    type?: string;
    imageUrl?: string;
    name?: string;
    className?: string;
}

const CompanyLogo: React.FC<CompanyLogoProps> = ({ type, imageUrl, name, className = '' }) => {
    // Generate a branded logo based on type
    const getLogoStyle = () => {
        if (imageUrl) return null;

        const content = name ? name.charAt(0).toUpperCase() : '?';

        switch (type) {
            case 'pg':
                return { bg: 'bg-blue-600', text: 'text-white', content: 'P&G' };
            case 'mcdonalds':
                return { bg: 'bg-red-600', text: 'text-yellow-400', content: 'M' };
            case 'nasa':
                return { bg: 'bg-blue-900', text: 'text-white', content: 'NASA' };
            case 'nbc':
                return { bg: 'bg-gradient-to-r from-red-500 via-yellow-500 to-green-500', text: 'text-white', content: 'NBC' };
            case 'custom':
                return { bg: 'bg-teal-500', text: 'text-white', content: 'C' };
            default:
                return { bg: 'bg-gray-400', text: 'text-white', content: content };
        }
    };

    const style = getLogoStyle();

    return (
        <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold overflow-hidden ${style?.bg || 'bg-gray-100'} ${style?.text || ''} ${className}`}
        >
            {imageUrl ? (
                <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
                style?.content
            )}
        </div>
    );
};

export default CompanyLogo;
