import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import qrService, { IQRCode } from '../services/QRService';

const QRDetails: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<IQRCode | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDetail = async () => {
            if (!id) return;
            try {
                const item = await qrService.getQRById(id);
                if (item) {
                    setData(item);
                }
            } catch (error) {
                console.error('Failed to load QR details:', error);
            } finally {
                setLoading(false);
            }
        };
        loadDetail();
    }, [id]);

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Loading details...</div>;
    }

    if (!data) {
        return <div className="p-6 text-center text-red-500">QR Code not found.</div>;
    }

    return (
        <div className="h-full flex flex-col space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <span
                    onClick={() => navigate('/qr-management')}
                    className="text-gray-500 cursor-pointer hover:text-gray-700"
                >
                    QR Management
                </span>
                <span className="text-gray-400">{'>>'}</span>
                <span className="font-semibold text-gray-900">QR Details</span>
            </div>

            {/* Main Content Area - Map Background */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-[#E5E7EB] h-[calc(100vh-100px)]">
                {/* Map Background Image */}
                <div className="absolute top-0 left-0 w-full h-[calc(100%+40px)] -bottom-10 z-0">
                    <iframe
                        width="100%"
                        height="100%"
                        className="w-full h-full object-cover"
                        style={{ border: 0, filter: 'grayscale(0.2) opacity(0.8)', marginTop: '-20px' }}
                        loading="lazy"
                        allowFullScreen
                        title="Location Map"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(data.location.company + ', ' + data.location.address)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    ></iframe>
                    {/* Blocker to disable interaction */}
                    <div className="absolute inset-0 bg-transparent z-10"></div>
                </div>

                {/* Content Overlay Container */}
                <div className="absolute inset-0 z-20 p-4 pointer-events-none">
                    <div className="flex w-full h-full gap-6">
                        {/* Left Details Panel */}
                        <div
                            className="w-[480px] h-full flex flex-col bg-white/60 rounded-[8px] p-6 overflow-y-auto pointer-events-auto"
                            style={{
                                backdropFilter: 'blur(30.299999237060547px)',
                                WebkitBackdropFilter: 'blur(30.299999237060547px)',
                                boxShadow: '0px 2px 10px 0px #0000000F'
                            }}
                        >
                            {/* ... existing header logic ... */}
                            <div className="mb-8">
                                <h1 className="text-[32px] font-medium text-[#101828] mb-2 leading-tight">{data.productName}</h1>
                                <div className="flex items-center gap-4 text-sm text-[#475467] mb-6">
                                    <span className="flex items-center gap-2">
                                        <img
                                            src="/assets/Qr-Code-2--Streamline-Rounded-Material.svg"
                                            alt=""
                                            className="w-5 h-5 object-contain"
                                        />
                                        <span className="font-medium">QR: {data.qrCode}</span>
                                    </span>
                                    <span className="text-gray-300">|</span>
                                    <span>Batch: {data.batch}</span>
                                </div>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-2">
                                    {data.grades.map((grade, idx) => (
                                        <Badge key={idx} text={grade.text} type={grade.type} />
                                    ))}
                                </div>
                            </div>

                            {/* Company & Scan Stats */}
                            <div className="rounded-[8px] p-5 mb-8 border border-gray-100">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-lg font-semibold text-[#101828]">{data.location.company}</p>
                                    <div className="flex items-center gap-2 bg-[#F0F4FF] px-3 py-1.5 rounded-[20px] border border-gray-200 shadow-sm ml-4 shrink-0">
                                        <svg className="w-4 h-4 text-[#344054]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">{data.scans} <span className="font-normal text-gray-500">Users scanned</span></span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-[#475467]">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {data.location.address}
                                </div>
                            </div>

                            {/* Devices Activity */}
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-[#344054] mb-5">Devices Activity</h3>
                                <div className="space-y-5">
                                    <ActivityBar city="New York City" count="35,929" color="bg-[#2DD4BF]" width="w-2/3" />
                                    <ActivityBar city="Los Angeles" count="8,854" color="bg-[#3B82F6]" width="w-1/4" />
                                    <ActivityBar city="Chicago" count="51,843" color="bg-[#8B5CF6]" width="w-4/5" />
                                    <ActivityBar city="Houston" count="49,943" color="bg-[#EC4899]" width="w-3/4" />
                                    <ActivityBar city="Phoenix" count="943" color="bg-[#FCA5A5]" width="w-[10%]" />
                                    <ActivityBar city="Philadelphia" count="22,943" color="bg-[#4F46E5]" width="w-1/2" />
                                </div>
                            </div>
                        </div>

                        {/* Right Area Spacer */}
                        <div className="flex-1 flex flex-col justify-end items-center mb-4">
                            {/* Centered Stats Card */}
                            <div
                                className="bg-white/80 rounded-[8px] p-6 flex divide-x divide-gray-200 pointer-events-auto min-w-[360px]"
                                style={{
                                    backdropFilter: 'blur(10px)',
                                    WebkitBackdropFilter: 'blur(10px)',
                                    boxShadow: '0px 2px 10px 0px #0000000F'
                                }}
                            >
                                <div className="flex-1 px-8 text-center">
                                    <p className="text-2xl font-medium text-[#101828]">35,929</p>
                                    <p className="text-xs text-[#475467] mt-1 font-medium">Iphone</p>
                                </div>
                                <div className="flex-1 px-8 text-center">
                                    <p className="text-2xl font-medium text-[#101828]">51,843</p>
                                    <p className="text-xs text-[#475467] mt-1 font-medium">Android</p>
                                </div>
                                <div className="flex-1 px-8 text-center">
                                    <p className="text-2xl font-medium text-[#101828]">8,854</p>
                                    <p className="text-xs text-[#475467] mt-1 font-medium">Web</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const ActivityBar = ({ city, count, color, width }: { city: string, count: string, color: string, width: string }) => (
    <div>
        <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700 font-medium">{city}</span>
            <span className="text-gray-900 font-bold">{count}</span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full ${width}`}></div>
        </div>
    </div>
);

const Badge: React.FC<{ text: string; type: 'green' | 'blue' | 'orange' }> = ({ text, type }) => {
    const styles = {
        green: 'bg-[#ECFDF3] text-[#16A34A] border-[#ABEFC6]',
        blue: 'bg-[#EFF8FF] text-[#2563EB] border-[#B2DDFF]',
        orange: 'bg-[#FFFAEB] text-[#F59E0B] border-[#FEDF89]',
    };

    const icons: Record<'green' | 'blue' | 'orange', string> = {
        green: '/assets/Leaf--Streamline-Lucide.svg',
        blue: '/assets/Shield--Streamline-Lucide.svg',
        orange: '/assets/Award--Streamline-Lucide.svg',
    };

    return (
        <span className={`pl-1 pr-2 py-0.5 rounded-full border text-[10px] font-medium whitespace-nowrap flex items-center gap-1.5 ${styles[type]}`}>
            <img src={icons[type]} alt="" className="w-3 h-3 object-contain" />
            {text}
        </span>
    );
};

export default QRDetails;
