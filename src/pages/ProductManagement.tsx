import React, { useEffect, useState } from 'react';
import productService, { IProduct, IProductListResponse } from '../services/ProductService';
import AddProductModal from '../components/products/add-product/AddProductModal';
import { ProductStepBadge } from '../components/products/ProductStepBadge';
import Avatar from '../components/common/Avatar';

const ProductManagement: React.FC = () => {
    const [data, setData] = useState<IProductListResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await productService.getProducts();
            setData(response);
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredProducts = () => {
        if (!data?.products) return [];
        return data.products.filter((product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const products = getFilteredProducts();

    // Pagination (hardcoded for now to match UI screenshot)
    const startIndex = 1;
    const endIndex = 5;
    const totalItems = 13;

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                <p className="text-gray-500 mt-1 text-sm">
                    Easily toggle between activating and deactivating users to manage their access and visibility.
                </p>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="flex-1">
                    <div className="relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by name, keywords & more"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {/* All Product Dropdown */}
                <button className="flex items-center justify-between gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-w-[160px]">
                    <span className="text-gray-900 text-sm font-medium">All Product</span>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Filters Button */}
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-gray-900 text-sm font-medium">Filters</span>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                </button>

                {/* Add Product Button */}
                <button
                    onClick={() => setIsAddProductOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#1F2937] text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                >
                    Add Product
                </button>
            </div>

            {/* Table Container */}
            <div className="rounded-xl shadow-sm overflow-hidden bg-white/60 backdrop-blur-[62.8px] border border-white/20">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-[#F9FAFB]">
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <div className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                                                PRODUCT NAME
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                                </svg>
                                            </div>
                                        </th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            PRODUCT STEPS
                                        </th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <div className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                                                PRODUCT TYPE
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                                </svg>
                                            </div>
                                        </th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            STATUS
                                        </th>
                                        <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            ACTION
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                                            {/* Product Name */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    {/* Fallback image if local asset missing */}
                                                    <Avatar src={product.image} name={product.name} size="sm" />
                                                    <span className="font-medium text-gray-900 text-sm">{product.name}</span>
                                                </div>
                                            </td>

                                            {/* Product Steps */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-[500px]">
                                                    {product.steps.map((step, idx) => (
                                                        <ProductStepBadge key={idx} name={step.name} quantity={step.quantity} />
                                                    ))}
                                                    {/* +4 Badge */}
                                                    <div className="flex items-center justify-center bg-blue-50 text-blue-600 font-medium text-xs rounded-lg px-2.5 py-1.5 h-[30px] border border-blue-100 min-w-[32px]">
                                                        +4
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Product Type */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-gray-600 text-sm">{product.type}</span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.status === 'ACTIVE'
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'bg-red-50 text-red-700'
                                                    }`}>
                                                    {product.status}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                    <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 bg-[#FAFAFA]/50">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span>Rows per page:</span>
                                    <button className="flex items-center gap-1 font-medium text-gray-900 focus:outline-none">
                                        14
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {startIndex}-{endIndex} of {totalItems}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30" disabled>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button className="p-1 text-gray-400 hover:text-gray-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Add Product Modal */}
                        <AddProductModal
                            isOpen={isAddProductOpen}
                            onClose={() => setIsAddProductOpen(false)}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductManagement;
