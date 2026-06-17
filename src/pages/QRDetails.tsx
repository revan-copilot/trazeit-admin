import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import qrService, { IBatchDetail } from '../services/QRService';
import Avatar from '../components/common/Avatar';
import { assetPath } from '../utils/assetPath';
import innerBannerFallback from '../assets/inner-banner.png';


type TabType = 'farming' | 'processing' | 'distribution' | 'retailer';

const QRDetails: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<IBatchDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Tab and Active Step state
    const [activeTab, setActiveTab] = useState<TabType>('farming');
    const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

    useEffect(() => {
        const loadBatchDetail = async () => {
            if (!id) return;
            try {
                setLoading(true);
                setError(null);
                const item = await qrService.getBatchById(id);
                if (item) {
                    setData(item);
                } else {
                    setError('Batch details not found.');
                }
            } catch (err: any) {
                console.error('Failed to load batch details:', err);
                setError(err.message || 'Failed to load batch details.');
            } finally {
                setLoading(false);
            }
        };
        loadBatchDetail();
    }, [id]);

    // Categorize steps dynamically into functional supply chain stages
    const getStepTab = (stepTitle: string): TabType => {
        const title = stepTitle.toLowerCase();
        if (
            title.includes('post-harvest') || 
            title.includes('storage') || 
            title.includes('processing') || 
            title.includes('dehydration') || 
            title.includes('rolling') || 
            title.includes('drying') || 
            title.includes('sorting') || 
            title.includes('packaging') ||
            title.includes('sanitation') ||
            title.includes('cleaning')
        ) {
            return 'processing';
        }
        if (
            title.includes('transport') || 
            title.includes('logistics') || 
            title.includes('buyer') || 
            title.includes('dispatch') || 
            title.includes('ship to') ||
            title.includes('distribut')
        ) {
            return 'distribution';
        }
        if (
            title.includes('record keeping') || 
            title.includes('tracking') || 
            title.includes('retail') || 
            title.includes('store') ||
            title.includes('market')
        ) {
            return 'retailer';
        }
        // Default to farming stage
        return 'farming';
    };

    // Auto-select first step in active tab
    useEffect(() => {
        if (data && data.steps) {
            const filtered = data.steps.filter((s) => getStepTab(s.step?.title || '') === activeTab);
            if (filtered.length > 0) {
                setSelectedStepId(filtered[0]._id);
            } else {
                setSelectedStepId(null);
            }
        }
    }, [activeTab, data]);

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    // Formats date range compactly to prevent wrapping and breaking in design
    const formatDurationRange = (startStr?: string, endStr?: string) => {
        if (!startStr || !endStr) return 'N/A';
        try {
            const startDate = new Date(startStr);
            const endDate = new Date(endStr);
            
            const startMonth = startDate.toLocaleDateString(undefined, { month: 'short' });
            const startDay = startDate.getDate();
            const startYear = startDate.getFullYear();
            
            const endMonth = endDate.toLocaleDateString(undefined, { month: 'short' });
            const endDay = endDate.getDate();
            const endYear = endDate.getFullYear();
            
            if (startYear === endYear) {
                if (startMonth === endMonth) {
                    return `${startMonth} ${startDay} – ${endDay}, ${startYear}`;
                }
                return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${startYear}`;
            }
            return `${startMonth} ${startDay}, ${startYear} – ${endMonth} ${endDay}, ${endYear}`;
        } catch {
            return `${formatDate(startStr)} – ${formatDate(endStr)}`;
        }
    };

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    // Filter steps belonging to the current active tab
    const filteredSteps = data?.steps
        ? data.steps.filter((stepItem) => getStepTab(stepItem.step?.title || '') === activeTab)
        : [];

    // Active selected step object
    const activeStep = data?.steps?.find((s) => s._id === selectedStepId);

    const renderInputValue = (input: { label: string; type: string; value: any }) => {
        if (input.value === null || input.value === undefined || input.value === '') {
            return <span className="text-gray-400 italic text-sm">Not provided</span>;
        }

        if (input.type === 'files') {
            const filesArray = Array.isArray(input.value) ? input.value : [input.value];
            const validFiles = filesArray.filter(f => typeof f === 'string' && f.trim() !== '');

            if (validFiles.length === 0) {
                return <span className="text-gray-400 italic text-sm">No files uploaded</span>;
            }

            return (
                <div className="flex flex-col gap-1.5 mt-1">
                    {validFiles.map((file, idx) => (
                        <a
                            key={idx}
                            href={file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
                        >
                            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            View Attachment {idx + 1}
                        </a>
                    ))}
                </div>
            );
        }

        if (input.type === 'date') {
            return (
                <span className="text-gray-900 text-sm flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(String(input.value))}
                </span>
            );
        }

        return <span className="text-gray-800 text-sm leading-relaxed">{String(input.value)}</span>;
    };

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-6 text-center max-w-lg mx-auto">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 shadow-sm">
                    <p className="font-semibold text-lg mb-2">Error Loading Batch Details</p>
                    <p className="text-sm text-red-500 mb-6">{error || 'Batch not found.'}</p>
                    <button
                        onClick={() => navigate('/qr-management')}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                        Back to List
                    </button>
                </div>
            </div>
        );
    }

    // Resolves image paths dynamically checking for Vite base paths
    const resolveImageUrl = (url?: string) => {
        if (!url || url.trim() === '') return '';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        const cleanPath = url.startsWith('/') ? url.substring(1) : url;
        return assetPath(cleanPath);
    };

    // Rely on real property images first to avoid unneeded stock placeholder images
    const bannerPrimary = resolveImageUrl(data?.property?.images?.[0]);
    const productAvatar = resolveImageUrl(data?.product?.images?.[0]);

    return (
        <div className="space-y-6 pb-20">
            {/* Back link Navigation & Breadcrumbs */}
            <div>
                <Link 
                    to="/qr-management" 
                    className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary transition-colors mb-4 group"
                >
                    <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to QR Management
                </Link>
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <Link to="/qr-management" className="hover:text-primary transition-colors font-bold">QR Management</Link>
                    <span className="text-gray-300 font-bold">/</span>
                    <span className="text-gray-900 font-bold">Batch Details</span>
                </div>
            </div>

            {/* Profile Header Block with overlapping Product Circle */}
            <div className="bg-white/60 backdrop-blur-[62.8px] border-2 border-white rounded-xl shadow-sm overflow-hidden">
                {/* Header Landscape Banner */}
                <div className="h-48 sm:h-64 w-full relative overflow-hidden">
                    <img
                        src={bannerPrimary || innerBannerFallback}
                        alt="banner"
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = innerBannerFallback; }}
                    />
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>

                {/* Product Metadata & Overlay */}
                <div className="p-6 sm:p-8 pt-0 flex flex-col sm:flex-row items-center sm:items-end gap-6 relative">
                    {/* Circular Product Image overlay */}
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-md overflow-hidden bg-white -mt-16 sm:-mt-20 relative z-10 flex-shrink-0">
                        <Avatar 
                            src={productAvatar} 
                            name={data?.product?.name || 'N/A'}
                            size="full" 
                        />
                    </div>

                    {/* Title block */}
                    <div className="flex-1 text-center sm:text-left pb-1">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                                {data?.product?.name || 'N/A'}
                            </h1>
                            <span className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 rounded-full text-xs font-semibold">
                                {data?.product?.description || 'N/A'}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-bold text-gray-400 mt-2.5">
                            <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                QR: {data?._id?.substring(0, 8) || 'N/A'}
                            </span>
                            <span className="text-gray-250">|</span>
                            <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Batch: {data?.batchNo || 'N/A'}
                            </span>
                        </div>
                    </div>

                    {/* Status badge */}
                    <div className="pb-1">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-2xs ${
                            data?.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                            {data?.status || 'unknown'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Split supply chain stage details & steps */}
            <div className="bg-white/60 backdrop-blur-[62.8px] border-2 border-white rounded-xl shadow-sm overflow-hidden p-6 sm:p-8 space-y-8">
                
                {/* Stage tabs selector menu */}
                <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-none gap-8">
                    {(['farming', 'processing', 'distribution', 'retailer'] as TabType[]).map((tab) => {
                        const labels: Record<TabType, string> = {
                            farming: 'Farming',
                            processing: 'Processing Plant',
                            distribution: 'Distribution Centre',
                            retailer: 'Retailer',
                        };
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all duration-200 ${
                                    isActive
                                        ? 'border-primary text-primary font-black'
                                        : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                {labels[tab]}
                            </button>
                        );
                    })}
                </div>

                {/* Columns grid wrapper */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Steps Checklist Stepper */}
                    <div className="lg:col-span-4 bg-gray-50/40 rounded-xl border border-gray-100 p-6 space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                            Steps
                        </h3>
                        
                        {filteredSteps.length > 0 ? (
                            <div className="relative space-y-6">
                                {filteredSteps.map((stepItem, idx) => {
                                    const hasActivity = stepItem.activity && stepItem.activity._id;
                                    const isSelected = selectedStepId === stepItem._id;

                                    return (
                                        <div 
                                            key={stepItem._id}
                                            onClick={() => setSelectedStepId(stepItem._id)}
                                            className={`relative pl-8 group cursor-pointer select-none transition-all duration-200 py-1 rounded-r-xl pr-2 ${
                                                isSelected ? 'bg-primary-50/30' : 'hover:bg-gray-100/40'
                                            }`}
                                        >
                                            {/* Vertical connecting line segment */}
                                            {filteredSteps.length > 1 && (
                                                <div className={`absolute left-3 w-0.5 bg-gray-300 ${
                                                    idx === 0 ? 'top-1/2 bottom-0' : 
                                                    idx === filteredSteps.length - 1 ? '-top-6 bottom-1/2' : 
                                                    '-top-6 bottom-0'
                                                }`} />
                                            )}

                                            {/* Connecting timeline dot */}
                                            <div className={`absolute left-[2px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                isSelected
                                                    ? 'bg-primary text-white shadow-sm shadow-primary/20'
                                                    : hasActivity
                                                    ? 'bg-emerald-500 text-white shadow-2xs'
                                                    : 'bg-gray-200 border border-gray-300 text-gray-400'
                                            }`}>
                                                {hasActivity ? (
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    <span className="text-[9px] font-bold">{idx + 1}</span>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-center gap-2">
                                                <div>
                                                    <h4 className={`font-bold text-sm tracking-tight ${
                                                        isSelected ? 'text-primary font-black' : 'text-gray-700'
                                                    }`}>
                                                        {stepItem.step?.title || 'Procedure'}
                                                    </h4>
                                                    <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">
                                                        {stepItem.activity?.inputs?.length || 0} Parameters
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                                        hasActivity
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                            : 'bg-gray-100 text-gray-400'
                                                    }`}>
                                                        {hasActivity ? 'Completed' : 'Pending'}
                                                    </span>
                                                    <span className="text-primary hover:underline font-bold text-xs">View</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm font-medium text-gray-400 italic py-6 px-1">
                                No steps logged for this stage.
                            </p>
                        )}
                    </div>

                    {/* Right Column: Details display panels */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Card 1: Stage level Summary Metadata */}
                        <div className="bg-white/40 border border-white/60 rounded-xl p-6 shadow-2xs">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                                {activeTab === 'farming' && 'Farming Details'}
                                {activeTab === 'processing' && 'Processing details'}
                                {activeTab === 'distribution' && 'Logistics & Distribution details'}
                                {activeTab === 'retailer' && 'Retailer / Tracking details'}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {activeTab === 'farming' && (
                                    <>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Land Size</p>
                                            <p className="text-base font-bold text-gray-900 mt-1 whitespace-nowrap">{data?.property?.data?.Size || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Duration</p>
                                            <p className="text-base font-bold text-gray-900 mt-1 whitespace-nowrap">
                                                {formatDurationRange(data?.start, data?.end)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Location</p>
                                            <a 
                                                href={`https://maps.google.com/?q=${data?.property?.address1}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline mt-1 break-all"
                                            >
                                                {data?.property?.city || 'N/A'}, {data?.property?.state || ''} →
                                            </a>
                                        </div>
                                    </>
                                )}
                                {activeTab === 'processing' && (
                                    <>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Processing Plant</p>
                                            <p className="text-base font-bold text-gray-900 mt-1">{data?.company?.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Owner Name</p>
                                            <p className="text-base font-bold text-gray-900 mt-1">{data?.company?.data?.ownerName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Facility Address</p>
                                            <p className="text-sm font-semibold text-gray-700 mt-1">
                                                {data?.company?.address1 || 'N/A'}, {data?.company?.city || ''}
                                            </p>
                                        </div>
                                    </>
                                )}
                                {activeTab === 'distribution' && (
                                    <>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Logistics Brand</p>
                                            <p className="text-base font-bold text-gray-900 mt-1">{data?.company?.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Dispatch Point</p>
                                            <p className="text-sm font-semibold text-gray-700 mt-1 truncate" title={data?.property?.name}>
                                                {data?.property?.name || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Destination</p>
                                            <p className="text-sm font-semibold text-gray-700 mt-1 break-words">
                                                {data?.company?.address1 || 'N/A'}
                                            </p>
                                        </div>
                                    </>
                                )}
                                {activeTab === 'retailer' && (
                                    <>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Corporate brand</p>
                                            <p className="text-base font-bold text-gray-900 mt-1">{data?.company?.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Reference Lot</p>
                                            <p className="text-base font-bold text-gray-900 mt-1">{data?.batchNo || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Corporate headquarters</p>
                                            <p className="text-sm font-semibold text-gray-700 mt-1">
                                                {data?.company?.city || 'N/A'}, {data?.company?.country || ''}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Card 2: Active step parameters Q&A logs details */}
                        {activeStep ? (
                            <div className="bg-white/60 backdrop-blur-[62.8px] border-2 border-white rounded-xl shadow-sm p-6 space-y-6">
                                <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                                    <h3 className="font-extrabold text-gray-900 text-lg sm:text-xl">
                                        {activeStep.step?.title || 'Step Parameters'}
                                    </h3>
                                    {activeStep.activity && activeStep.activity._id && (
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold uppercase tracking-wider">
                                            Verified & Approved
                                        </span>
                                    )}
                                </div>

                                {activeStep.activity && activeStep.activity._id ? (
                                    <div className="space-y-6">
                                        {/* Parameters Q&A List */}
                                        {activeStep.activity.inputs && activeStep.activity.inputs.length > 0 ? (
                                            <div className="space-y-6 divide-y divide-gray-50">
                                                {activeStep.activity.inputs.map((input, idx) => {
                                                    const isFirst = idx === 0;
                                                    return (
                                                        <div 
                                                            key={idx} 
                                                            className={`pt-5 flex flex-col justify-between items-stretch gap-4 ${
                                                                isFirst ? 'pt-0 border-t-0' : ''
                                                            }`}
                                                        >
                                                            {/* Question & Answer text content block */}
                                                            <div className="flex-1 space-y-2.5">
                                                                <h4 className="font-black text-gray-900 text-base leading-snug">
                                                                    {idx + 1}. {input.label}
                                                                </h4>
                                                                <div className="text-gray-600 font-medium text-sm leading-relaxed max-w-xl">
                                                                    {renderInputValue(input)}
                                                                </div>

                                                                {/* Bottom right aligned small timestamp for logged input */}
                                                                <div className="text-[10px] text-gray-400 font-semibold pt-1 md:text-left">
                                                                    {formatDateTime(activeStep.activity?.datetime || activeStep.activity?.createdAt)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-sm font-medium text-gray-400 italic">
                                                No parameter fields logs recorded.
                                            </p>
                                        )}

                                        {/* Real uploaded images (Activity Photo Logs) rendered here only if present in the database */}
                                        {activeStep.activity.images && activeStep.activity.images.length > 0 && (
                                            <div className="space-y-3 pt-6 border-t border-gray-100">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                    Activity Photo Logs
                                                </h4>
                                                <div className="flex flex-wrap gap-3">
                                                    {activeStep.activity.images.map((imgUrl, imgIdx) => (
                                                        <a
                                                            key={imgIdx}
                                                            href={imgUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block w-24 h-24 rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity bg-white shadow-2xs"
                                                        >
                                                            <img
                                                                src={imgUrl}
                                                                alt={`Log ${imgIdx + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Profile contact / Logger summary */}
                                        <div className="flex items-center gap-3 border-t border-gray-100 pt-6">
                                            <Avatar
                                                src={activeStep.activity.createdBy?.profilePic}
                                                firstName={activeStep.activity.createdBy?.firstName}
                                                lastName={activeStep.activity.createdBy?.lastName}
                                                size="xs"
                                            />
                                            <div>
                                                <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block">Logged By Operator</span>
                                                <span className="text-xs font-semibold text-gray-900">
                                                    {activeStep.activity.createdBy ? `${activeStep.activity.createdBy.firstName || ''} ${activeStep.activity.createdBy.lastName || ''}`.trim() : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-12 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/20">
                                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <p className="text-sm font-semibold text-gray-500">
                                            This step has not been completed.
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Parameters and operator records are pending validation.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white/60 backdrop-blur-[62.8px] border-2 border-white rounded-xl shadow-sm p-12 text-center text-gray-400 italic">
                                Select a step from the list to view its logged details.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRDetails;
