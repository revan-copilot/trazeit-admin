import React, { useState, useEffect } from 'react';
import productService, { IProduct, IProductStep } from '../../services/ProductService';
import Avatar from '../common/Avatar';

interface AssignProductModalProps {
    companyId: string;
    onClose: () => void;
    onAssign: (data: any) => Promise<void>;
    existingProductIds: string[];
    editingAssignment?: any;
}

const AssignProductModal: React.FC<AssignProductModalProps> = ({ 
    companyId, 
    onClose, 
    onAssign, 
    existingProductIds,
    editingAssignment 
}) => {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
    const [steps, setSteps] = useState<IProductStep[]>([]);
    const [loadingSteps, setLoadingSteps] = useState(false);
    const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoadingProducts(true);
                const response = await productService.getProducts();
                
                if (editingAssignment) {
                    // When editing, we only care about the currently assigned product
                    const currentProduct = response.products.find(p => p.id === (editingAssignment.product?.id || editingAssignment.product?._id || editingAssignment.product));
                    if (currentProduct) {
                        setProducts([currentProduct]);
                        handleProductSelect(currentProduct);
                        
                        // Set initial step if available
                        const initialStepId = editingAssignment.step?._id || editingAssignment.step?.id || editingAssignment.step || (Array.isArray(editingAssignment.steps) && editingAssignment.steps[0]?.step);
                        if (initialStepId) setSelectedStepId(initialStepId);
                    }
                } else {
                    setProducts(response.products);
                }
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchProducts();
    }, [existingProductIds, editingAssignment]);

    const handleProductSelect = async (product: IProduct) => {
        setSelectedProduct(product);
        if (!editingAssignment) setSelectedStepId(null);
        
        try {
            setLoadingSteps(true);
            const response = await productService.getStepsByProductId(product.id, 1, 1000);
            setSteps(response.steps);
        } catch (error) {
            console.error('Failed to fetch steps:', error);
        } finally {
            setLoadingSteps(false);
        }
    };

    const handleStepSelect = (stepId: string) => {
        setSelectedStepId(stepId);
    };

    const handleSave = async () => {
        if (!selectedProduct || !selectedStepId) return;

        const payload = {
            product: selectedProduct.id,
            company: companyId,
            step: selectedStepId
        };

        try {
            setSubmitting(true);
            await onAssign(payload);
        } catch (error) {
            console.error('Failed to assign product:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" onClick={onClose} />
            <div className="relative w-full max-w-4xl bg-[#F5F8FF] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-[#D5D7DA] flex justify-between items-center bg-white z-10">
                    <div>
                        <h2 className="text-[20px] font-semibold text-[#101828]">
                            {editingAssignment ? 'Edit Assigned Product' : 'Assign New Product'}
                        </h2>
                        <p className="text-[#475467] text-sm mt-1">
                            {editingAssignment ? 'Update the procedure step for this product.' : 'Select a product and configure its procedure steps.'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex">
                    {/* Product Selection */}
                    <div className="w-1/2 border-r border-[#D5D7DA] overflow-y-auto p-8 custom-scrollbar">
                        <h3 className="text-sm font-semibold text-[#101828] mb-6">
                            {editingAssignment ? 'Selected Product' : 'Select Product'}
                        </h3>
                        {loadingProducts ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {products.map(p => (
                                    <div 
                                        key={p.id}
                                        onClick={() => !editingAssignment && handleProductSelect(p)}
                                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all group ${
                                            editingAssignment ? 'cursor-default' : 'cursor-pointer'
                                        } ${
                                            selectedProduct?.id === p.id 
                                                ? 'border-primary bg-primary/5 shadow-sm' 
                                                : 'border-[#EAECF0] bg-white hover:border-primary/30 hover:bg-gray-50/50'
                                        }`}
                                    >
                                        <div className="w-12 h-12 flex-shrink-0">
                                            <Avatar src={p.image} name={p.name} size="full" className="rounded-lg" />
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-semibold ${selectedProduct?.id === p.id ? 'text-primary' : 'text-[#101828]'}`}>{p.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] font-medium text-[#475467] uppercase tracking-tight bg-gray-50 px-2 py-0.5 rounded border border-[#EAECF0]">{p.type}</span>
                                                <span className="text-[10px] text-[#667085] font-medium">ID: {p.id.slice(-6)}</span>
                                            </div>
                                        </div>
                                        {selectedProduct?.id === p.id && (
                                            <div className="text-primary">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {products.length === 0 && (
                                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-[#EAECF0]">
                                        <p className="text-sm font-medium text-[#667085] italic">No new products available.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Steps Selection */}
                    <div className="w-1/2 overflow-y-auto p-8 custom-scrollbar">
                        <h3 className="text-sm font-semibold text-[#101828] mb-6">Configure Step</h3>
                        {!selectedProduct ? (
                            <div className="flex flex-col items-center justify-center h-full text-center opacity-40 mt-[-20px]">
                                <div className="p-6 bg-white rounded-full shadow-sm mb-6 border border-[#EAECF0]">
                                    <svg className="w-10 h-10 text-[#667085]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-[#344054]">Product Required</p>
                                <p className="text-xs text-[#667085] mt-2 max-w-[200px] leading-relaxed">Select a product on the left to configure its procedure steps.</p>
                            </div>
                        ) : loadingSteps ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {steps.map((step, index) => (
                                    <div 
                                        key={step.id}
                                        onClick={() => handleStepSelect(step.id)}
                                        className={`flex items-center gap-4 p-5 rounded-xl border transition-all cursor-pointer group ${
                                            selectedStepId === step.id 
                                                ? 'border-primary bg-white shadow-md' 
                                                : 'border-[#EAECF0] bg-white hover:border-primary/30'
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                            selectedStepId === step.id ? 'border-primary bg-primary' : 'border-[#D0D5DD] bg-white group-hover:border-primary/30'
                                        }`}>
                                            {selectedStepId === step.id && (
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-semibold ${selectedStepId === step.id ? 'text-primary' : 'text-[#101828]'}`}>{step.title}</p>
                                            <p className="text-[10px] text-[#667085] font-semibold uppercase tracking-wider mt-0.5">Phase {index + 1}</p>
                                        </div>
                                    </div>
                                ))}
                                {steps.length === 0 && (
                                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-[#EAECF0]">
                                        <p className="text-sm font-medium text-[#667085] italic">No steps found for this product.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-[#EAECF0] bg-white z-10 flex justify-end items-center gap-4">
                    {selectedProduct && selectedStepId && (
                        <div className="flex-1">
                            <p className="text-xs font-semibold text-[#667085]">
                                Step <span className="text-[#101828]">"{steps.find(s => s.id === selectedStepId)?.title}"</span> Selected
                            </p>
                        </div>
                    )}
                    <button 
                        onClick={onClose} 
                        className="px-6 py-2.5 rounded-xl border border-[#D0D5DD] text-[#344054] font-semibold hover:bg-gray-50 transition-all text-sm"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={!selectedProduct || !selectedStepId || submitting}
                        className={`px-8 py-2.5 rounded-xl text-white font-semibold text-sm transition-all shadow-[0px_4px_10px_rgba(46,73,183,0.25)] min-w-[160px] flex items-center justify-center
                        ${submitting ? 'bg-[#5E85C6] cursor-not-allowed' : (!selectedProduct || !selectedStepId ? 'bg-[#5E85C6] cursor-not-allowed' : 'bg-[#2E49B7] hover:bg-[#103778]')}`}
                    >
                        {submitting ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Saving...</span>
                            </div>
                        ) : (editingAssignment ? 'Update' : 'Confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignProductModal;
