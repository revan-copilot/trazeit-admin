import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import companyService, { ICompany } from '../services/CompanyService';
import CompanyLogo from '../components/common/CompanyLogo';
import Avatar from '../components/common/Avatar';
import productService, { IProductStep } from '../services/ProductService';
import SuccessPopup from '../components/common/SuccessPopup';
import AssignProductModal from '../components/company/AssignProductModal';
import TablePagination from '../components/common/TablePagination';



interface AssignedProduct {
    id: string;
    _id?: string;
    product?: any; // Nested product object if returned by /product-assigned-steps
    name: string;
    description: string;
    image: string;
    status: string;
    type: string;
    [key: string]: any;
}

const CompanyDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [company, setCompany] = useState<ICompany | null>(null);
    const [assignedProducts, setAssignedProducts] = useState<AssignedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
    const [productSteps, setProductSteps] = useState<Record<string, IProductStep[]>>({});
    const [loadingSteps, setLoadingSteps] = useState<Record<string, boolean>>({});
    const [selectedSteps, setSelectedSteps] = useState<Record<string, string>>({}); // assignmentId -> stepId

    const [isSuccess, setIsSuccess] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<any>(null);

    // Pagination state
    const [productPagination, setProductPagination] = useState({ total: 0, totalPages: 1, currentPage: 1, perPage: 10 });
    const [stepPagination, setStepPagination] = useState<Record<string, { total: number, totalPages: number, currentPage: number, perPage: number }>>({});

    const loadData = useCallback(async (page: number = 1, perPage: number = 10) => {
        if (!id) return;
        try {
            setLoading(true);
            const [companyData, productsResponse] = await Promise.all([
                companyService.getCompanyById(id),
                companyService.getAssignedProducts(id, page, perPage)
            ]);
            setCompany(companyData);
            
            const productsData = productsResponse.data;
            setProductPagination(productsResponse.pagination);

            setAssignedProducts(productsData);

            // Initialize selected steps from data if available
            const initialSelected: Record<string, string> = {};
            productsData.forEach((item: any) => {
                const assignmentId = item._id || item.id;
                // Favor single step if available, else first in steps array
                const stepData = item.step || (Array.isArray(item.steps) && item.steps.length > 0 ? item.steps[0] : null);
                
                if (stepData) {
                    initialSelected[assignmentId] = typeof stepData === 'object' ? (stepData.step || stepData._id) : stepData;
                }
            });
            setSelectedSteps(initialSelected);

        } catch (error) {
            console.error('Failed to load company details:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);


    useEffect(() => {
        loadData(1, 10);
    }, [loadData]);

    const loadProductSteps = async (productId: string, page: number = 1, perPage: number = 12) => {
        try {
            setLoadingSteps(prev => ({ ...prev, [productId]: true }));
            const response = await productService.getStepsByProductId(productId, page, perPage);
            setProductSteps(prev => ({ ...prev, [productId]: response.steps }));
            setStepPagination(prev => ({
                ...prev,
                [productId]: {
                    total: response.pagination.total,
                    totalPages: response.pagination.totalPages,
                    currentPage: page,
                    perPage: perPage
                }
            }));
        } catch (error) {
            console.error(`Failed to fetch steps for product ${productId}:`, error);
        } finally {
            setLoadingSteps(prev => ({ ...prev, [productId]: false }));
        }
    };

    const toggleProduct = async (productId: string) => {
        const isExpanding = !expandedProducts[productId];
        setExpandedProducts(prev => ({ ...prev, [productId]: isExpanding }));

        if (isExpanding && !productSteps[productId]) {
            await loadProductSteps(productId, 1, 12);
        }
    };


    const handleStepSelect = async (assignmentId: string, stepId: string) => {
        try {
            // Optimistic update
            setSelectedSteps(prev => ({ ...prev, [assignmentId]: stepId }));
            
            await companyService.updateAssignedProduct(assignmentId, { step: stepId });
            
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 2000);
        } catch (error) {
            console.error('Failed to update assigned step:', error);
            // Revert on error could be added here if needed, 
            // but for now let's keep it simple as per request
        }
    };


    const handleAssignProduct = async (payload: any) => {
        try {
            if (editingAssignment) {
                await companyService.updateAssignedProduct(editingAssignment._id || editingAssignment.id, payload);
            } else {
                await companyService.assignProduct(payload);
            }
            setIsAssignModalOpen(false);
            setEditingAssignment(null);
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 2000);
            loadData(); // Refresh list
        } catch (error) {
            console.error('Failed to assign product:', error);
            alert('Failed to save assignment. Please try again.');
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center py-24 bg-[#E5EDF9] min-h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!company) return (
        <div className="py-24 text-center">
            <h2 className="text-xl font-bold text-gray-900">Company not found</h2>
            <Link to="/company-management" className="text-primary hover:underline mt-4 inline-block font-bold">Back to Company Management</Link>
        </div>
    );

    const addressParts = [
        company.address1,
        company.address2,
        company.city,
        company.state,
        company.country,
        company.postalCode
    ].filter(Boolean);
    const fullAddress = addressParts.join(', ') || 'No address provided';

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 px-4 sm:px-6 lg:px-10 pb-16">
            <div className="pt-8">
                <Link
                    to="/company-management"
                    className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary transition-colors mb-4 group"
                >
                    <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Company Management
                </Link>
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <Link to="/company-management" className="hover:text-primary transition-colors font-bold">Company Management</Link>
                    <span className="text-gray-300 font-bold">/</span>
                    <span className="text-gray-900 font-bold">{company.name || company.companyName}</span>
                </div>
            </div>

            <div className="bg-white/60 backdrop-blur-[62.8px] border-2 border-white rounded-xl shadow-sm p-10">
                <div className="flex items-start gap-8">
                    <div className="w-32 h-32 flex-shrink-0">
                        <CompanyLogo
                            type={company.companyLogo}
                            imageUrl={company.images?.[0]}
                            name={company.name || company.companyName}
                            className="rounded-2xl w-full h-full text-4xl"
                        />
                    </div>
                    <div className="flex-1 pt-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">
                                    {company.name || company.companyName}
                                </h1>
                                <div className="flex items-center gap-2 mt-3 text-gray-500">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <p className="text-sm font-medium tracking-tight italic">{fullAddress}</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md shadow-sm ${company.status === 'active' ? 'bg-[#E6F9F4] text-[#2DB389]' : 'bg-[#FFF0ED] text-[#FF5C41]'
                                    }`}>
                                    {company.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white/60 backdrop-blur-[62.8px] border-2 border-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-10 py-8 border-b border-white/40 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Assigned Products</h2>
                    </div>
                    <button
                        onClick={() => setIsAssignModalOpen(true)}
                        className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium text-sm shadow-sm flex items-center gap-2"
                    >
                        Assign Product
                    </button>
                </div>


                <div className="divide-y divide-gray-100">
                    {assignedProducts.length === 0 ? (
                        <div className="py-24 text-center">
                            <p className="text-sm font-medium text-gray-400 italic">No products assigned to this company.</p>
                        </div>
                    ) : (
                        assignedProducts.map((item) => {
                            const productData = item.product || item;
                            const productId = productData.id || productData._id || item.id || item._id || '';
                            const assignmentId = item._id || item.id || productId;
                            const isExpanded = expandedProducts[productId];

                            return (
                                <div key={assignmentId} className="transition-all duration-200 border-b border-gray-100 last:border-0 hover:bg-white/40">
                                    <div
                                        className={`flex items-center px-10 py-6 cursor-pointer group ${isExpanded ? 'bg-white/60 border-l-4 border-primary' : ''}`}
                                        onClick={() => toggleProduct(productId)}
                                    >
                                        <div className="flex flex-1 items-center gap-6">
                                            <div className="w-12 h-12 flex-shrink-0">
                                                <Avatar src={productData.image} name={productData.name} size="full" />
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-base font-bold text-gray-900 tracking-tight">
                                                        {productData.name}
                                                    </h3>
                                                </div>
                                                {productData.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 italic">{productData.description}</p>}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-end gap-1">
                                                {productData.type && (
                                                    <span className="text-[10px] font-bold text-[#B0BCCB] bg-white border border-gray-100 px-2.5 py-0.5 rounded-md uppercase tracking-widest shadow-sm">{productData.type}</span>
                                                )}
                                                <span className={`text-[9px] font-black uppercase tracking-wider ${String(productData.status).toUpperCase() === 'ACTIVE' ? 'text-[#2DB389]' : 'text-[#FF5C41]'
                                                    }`}>
                                                    {productData.status}
                                                </span>
                                            </div>
                                            <div className={`p-1 text-gray-300 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[1000px] opacity-100 pb-10' : 'max-h-0 opacity-0'}`}>
                                        <div className="px-10 mt-4">
                                            <div className="bg-white/50 backdrop-blur-md border border-white rounded-2xl p-6 shadow-inner">
                                                <div className="flex items-center justify-between mb-6">
                                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Configure Procedure Steps</h4>
                                                    <span className="text-[10px] font-bold text-gray-400">CHOOSE STEPS FOR THIS CLIENT</span>
                                                </div>

                                                {loadingSteps[productId] ? (
                                                    <div className="flex justify-center py-8">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary opacity-30"></div>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {productSteps[productId]?.map((step, index) => {
                                                            const isStepSelected = selectedSteps[assignmentId] === step.id;
                                                            return (
                                                                <div
                                                                    key={step.id}
                                                                    onClick={() => handleStepSelect(assignmentId, step.id)}
                                                                    className={`
                                                                        relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer group
                                                                        ${isStepSelected
                                                                            ? 'bg-primary/5 border-primary shadow-sm'
                                                                            : 'bg-white/40 border-transparent hover:border-gray-200'
                                                                        }
                                                                    `}
                                                                >
                                                                    <div className={`
                                                                        w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                                                                        ${isStepSelected
                                                                            ? 'border-primary'
                                                                            : 'border-gray-300 group-hover:border-gray-400'
                                                                        }
                                                                    `}>
                                                                        {isStepSelected && (
                                                                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className={`text-sm font-bold ${isStepSelected ? 'text-primary' : 'text-gray-700'}`}>
                                                                            {step.title}
                                                                        </p>
                                                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Phase {index + 1}</p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}


                                                        {(!productSteps[productId] || productSteps[productId].length === 0) && (
                                                            <p className="col-span-full py-4 text-center text-xs text-gray-400 italic font-medium">No steps defined for this product.</p>
                                                        )}
                                                    </div>
                                                )}

                                                {stepPagination[productId] && stepPagination[productId].totalPages > 1 && (
                                                    <div className="mt-6 border-t border-white/40">
                                                        <TablePagination
                                                            currentPage={stepPagination[productId].currentPage}
                                                            totalPages={stepPagination[productId].totalPages}
                                                            rowsPerPage={stepPagination[productId].perPage}
                                                            startIndex={(stepPagination[productId].currentPage - 1) * stepPagination[productId].perPage}
                                                            endIndex={stepPagination[productId].currentPage * stepPagination[productId].perPage}
                                                            totalItems={stepPagination[productId].total}
                                                            onRowsPerPageChange={(rows) => loadProductSteps(productId, 1, rows)}
                                                            onPrevPage={() => loadProductSteps(productId, stepPagination[productId].currentPage - 1, stepPagination[productId].perPage)}
                                                            onNextPage={() => loadProductSteps(productId, stepPagination[productId].currentPage + 1, stepPagination[productId].perPage)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {productPagination.totalPages > 1 && (
                    <div className="border-t border-gray-100">
                        <TablePagination
                            currentPage={productPagination.currentPage}
                            totalPages={productPagination.totalPages}
                            rowsPerPage={productPagination.perPage}
                            startIndex={(productPagination.currentPage - 1) * productPagination.perPage}

                            endIndex={productPagination.currentPage * productPagination.perPage}
                            totalItems={productPagination.total}
                            onRowsPerPageChange={(rows) => loadData(1, rows)}
                            onPrevPage={() => loadData(productPagination.currentPage - 1, productPagination.perPage)}
                            onNextPage={() => loadData(productPagination.currentPage + 1, productPagination.perPage)}
                        />
                    </div>
                )}
            </div>


            <SuccessPopup
                isOpen={isSuccess}
                message="Procedure step updated successfully"
            />

            {isAssignModalOpen && (
                <AssignProductModal
                    companyId={id!}
                    onClose={() => {
                        setIsAssignModalOpen(false);
                        setEditingAssignment(null);
                    }}
                    onAssign={handleAssignProduct}
                    editingAssignment={editingAssignment}
                    existingProductIds={assignedProducts.map(p => {
                        const productData = p.product || p;
                        return productData.id || productData._id;
                    })}
                />
            )}
        </div>

    );
};

export default CompanyDetail;
