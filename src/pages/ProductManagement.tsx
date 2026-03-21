import React, { useEffect, useState } from 'react';
import productService, { IProductListResponse } from '../services/ProductService';
import { useNavigate } from 'react-router-dom';
import AddProductModal from '../components/products/add-product/AddProductModal';

import Avatar from '../components/common/Avatar';

const ProductManagement: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<IProductListResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    const handleEditProduct = (product: any) => {
        setSelectedProduct(product);
        setIsAddProductOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddProductOpen(false);
        setSelectedProduct(null);
        loadProducts(); // Reload to reflect changes if any
    };

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
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                <p className="text-gray-500 mt-1 text-sm">
                    Easily toggle between activating and deactivating users to manage their access and visibility.
                </p>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center gap-3">
                {/* Search Input */}
                <div className="flex-1 bg-white/60 backdrop-blur-md rounded-xl shadow-sm">
                    <div className="relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#101828]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by name, keywords & more"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 bg-transparent rounded-lg focus:outline-none focus:ring-0 text-sm text-[#101828] placeholder-[#101828]/40"
                        />
                    </div>
                </div>

                {/* All Product Dropdown */}
                <button className="flex items-center justify-between gap-2 px-4 py-2.5 bg-white border border-[#D5D7DA] rounded-lg hover:bg-gray-50 transition-colors min-w-[160px]">
                    <span className="text-[#344054] text-sm font-medium">All Product</span>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Filters Button */}
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D5D7DA] rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-[#344054]">
                    <span>Filters</span>
                    <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Add Product Button */}
                <button
                    onClick={() => {
                        setSelectedProduct(null);
                        setIsAddProductOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium text-sm shadow-sm min-w-[124px]"
                >
                    Add Product
                </button>
            </div>

            {/* Table Container */}
            <div className="rounded-xl shadow-sm overflow-hidden bg-white">
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
                                            USER TYPE
                                        </th>
                                        <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            STATUS
                                        </th>
                                        <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
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



                                            {/* Product Type */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-600">{(product as any).userType || product.type}</span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-wider ${String(product.status).toUpperCase() === 'ACTIVE'
                                                    ? 'bg-[#E6F9F4] text-[#2DB389]'
                                                    : 'bg-[#FFF0ED] text-[#FF5C41]'
                                                    }`}>
                                                    {String(product.status).toUpperCase() === 'ACTIVE' ? 'ACTIVE' : 'IN ACTIVE'}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleEditProduct(product)}
                                                        className="p-2 text-[#475467] hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="Edit Product"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/products/${product.id}`)}
                                                        className="p-2 text-[#475467] hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
                            onClose={handleCloseModal}
                            initialData={selectedProduct}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductManagement;
