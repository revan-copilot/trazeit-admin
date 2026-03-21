import React, { useState, useMemo } from 'react';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface AvatarProps {
    src?: string | null;
    firstName?: string;
    lastName?: string;
    /** Fallback name if firstName/lastName aren't provided */
    name?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    className?: string;
    /** Additional classes for the initials text */
    textClassName?: string;
    /** Custom rounding class, e.g., 'rounded-xl' or 'rounded-2xl' */
    rounded?: string;
}

// ──────────────────────────────────────────────
// Size Config
// ──────────────────────────────────────────────

const SIZE_MAP: Record<string, { container: string; text: string }> = {
    xs: { container: 'w-8 h-8', text: 'text-xs' },
    sm: { container: 'w-10 h-10', text: 'text-sm' },
    md: { container: 'w-12 h-12', text: 'text-base' },
    lg: { container: 'w-16 h-16', text: 'text-lg' },
    xl: { container: 'w-40 h-40', text: 'text-4xl' },
    full: { container: 'w-full h-full', text: 'text-5xl' },
};

// Deterministic color from name — same name always gets same color
const COLORS = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-violet-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-pink-500',
];

function getColorFromName(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return COLORS[Math.abs(hash) % COLORS.length];
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

const Avatar: React.FC<AvatarProps> = ({
    src,
    firstName,
    lastName,
    name,
    size = 'md',
    className = '',
    textClassName = '',
    rounded = 'rounded-full',
}) => {
    const [imgError, setImgError] = useState(false);

    // Derive initials
    const initials = useMemo(() => {
        if (firstName || lastName) {
            const f = (firstName || '').trim().charAt(0).toUpperCase();
            const l = (lastName || '').trim().charAt(0).toUpperCase();
            return `${f}${l}`.trim() || '?';
        }
        if (name) {
            const parts = name.trim().split(/\s+/);
            if (parts.length >= 2) {
                return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
            }
            return parts[0].charAt(0).toUpperCase();
        }
        return '?';
    }, [firstName, lastName, name]);

    const fullName = useMemo(() => {
        if (firstName || lastName) return `${firstName || ''} ${lastName || ''}`.trim();
        return name || 'User';
    }, [firstName, lastName, name]);

    const bgColor = useMemo(() => getColorFromName(fullName), [fullName]);
    const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;

    const hasValidSrc = src && src.trim() !== '' && !imgError;

    return (
        <div
            className={`${sizeConfig.container} ${rounded} overflow-hidden flex items-center justify-center flex-shrink-0 ${hasValidSrc ? '' : bgColor
                } ${className}`}
            title={fullName}
        >
            {hasValidSrc ? (
                <img
                    src={src}
                    alt={fullName}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                />
            ) : (
                <span className={`font-semibold text-white select-none ${sizeConfig.text} ${textClassName}`}>
                    {initials}
                </span>
            )}
        </div>
    );
};

export default Avatar;
