interface HostelBitesLogoProps {
    className?: string;
}

export default function HostelBitesLogo({className = "h-16 w-auto"}: HostelBitesLogoProps) {
    return (
        <svg
            viewBox="0 0 300 80"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            style={{backgroundColor: 'transparent'}}
        >
            <defs>
                {/* Main gradient for the badge */}
                <linearGradient id="badgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF6B6B"/>
                    <stop offset="50%" stopColor="#4ECDC4"/>
                    <stop offset="100%" stopColor="#45B7D1"/>
                </linearGradient>

                {/* Text gradient */}
                <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2D3748"/>
                    <stop offset="100%" stopColor="#1A202C"/>
                </linearGradient>

                {/* Accent gradient */}
                <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#667EEA"/>
                    <stop offset="100%" stopColor="#764BA2"/>
                </linearGradient>

                {/* Glow effect */}
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#4ECDC4" floodOpacity="0.4"/>
                </filter>
            </defs>

            {/* Main circular badge */}
            <circle
                cx="35"
                cy="40"
                r="28"
                fill="url(#badgeGradient)"
                filter="url(#glow)"
            />

            {/* Building/hostel icon inside badge */}
            <g transform="translate(15, 20)">
                {/* Building base */}
                <rect x="10" y="25" width="30" height="20" rx="2" fill="white" opacity="0.9"/>

                {/* Building floors */}
                <rect x="12" y="27" width="6" height="4" rx="1" fill="url(#badgeGradient)" opacity="0.7"/>
                <rect x="20" y="27" width="6" height="4" rx="1" fill="url(#badgeGradient)" opacity="0.7"/>
                <rect x="28" y="27" width="6" height="4" rx="1" fill="url(#badgeGradient)" opacity="0.7"/>

                <rect x="12" y="33" width="6" height="4" rx="1" fill="url(#badgeGradient)" opacity="0.7"/>
                <rect x="20" y="33" width="6" height="4" rx="1" fill="url(#badgeGradient)" opacity="0.7"/>
                <rect x="28" y="33" width="6" height="4" rx="1" fill="url(#badgeGradient)" opacity="0.7"/>

                {/* Door */}
                <rect x="22" y="39" width="6" height="6" rx="1" fill="url(#badgeGradient)" opacity="0.8"/>

                {/* Food plate icon overlay */}
                <circle cx="25" cy="12" r="8" fill="white" opacity="0.95"/>
                <circle cx="25" cy="12" r="6" fill="none" stroke="url(#badgeGradient)" strokeWidth="1.5" opacity="0.8"/>

                {/* Food items on plate */}
                <circle cx="22" cy="10" r="1.5" fill="#FF6B6B" opacity="0.8"/>
                <circle cx="28" cy="10" r="1.5" fill="#4ECDC4" opacity="0.8"/>
                <circle cx="25" cy="14" r="1.5" fill="#45B7D1" opacity="0.8"/>
            </g>

            {/* "HOSTEL" text */}
            <text
                x="75"
                y="35"
                fontSize="24"
                fontWeight="bold"
                fontFamily="system-ui, -apple-system, sans-serif"
                fill="url(#textGradient)"
                letterSpacing="-0.5px"
            >
                HOSTEL
            </text>

            {/* "BITES" text with food emoji style */}
            <g transform="translate(75, 45)">
                <text
                    x="0"
                    y="20"
                    fontSize="16"
                    fontWeight="600"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fill="url(#accentGradient)"
                    letterSpacing="1px"
                >
                    BITES
                </text>

                {/* Small food icons after BITES */}
                <g transform="translate(65, 8)">
                    {/* Pizza slice */}
                    <path
                        d="M 0,8 L 8,0 L 8,8 Z"
                        fill="#FF6B6B"
                        opacity="0.7"
                    />
                    <circle cx="3" cy="5" r="0.8" fill="white" opacity="0.8"/>
                    <circle cx="6" cy="6" r="0.8" fill="white" opacity="0.8"/>

                    {/* Burger */}
                    <g transform="translate(12, 0)">
                        <ellipse cx="4" cy="7" rx="4" ry="1.5" fill="#8B4513" opacity="0.7"/>
                        <ellipse cx="4" cy="5.5" rx="3.5" ry="1" fill="#4ECDC4" opacity="0.7"/>
                        <ellipse cx="4" cy="4" rx="3.5" ry="1" fill="#FF6B6B" opacity="0.7"/>
                        <ellipse cx="4" cy="2.5" rx="4" ry="1.5" fill="#DEB887" opacity="0.7"/>
                    </g>
                </g>
            </g>

            {/* Decorative underline */}
            <path
                d="M 75 65 Q 120 62 165 65"
                stroke="url(#accentGradient)"
                strokeWidth="2"
                fill="none"
                opacity="0.6"
            />

            {/* Floating particles for dynamism */}
            <g opacity="0.4">
                <circle cx="200" cy="20" r="2" fill="#FF6B6B"/>
                <circle cx="210" cy="30" r="1.5" fill="#4ECDC4"/>
                <circle cx="220" cy="25" r="2" fill="#45B7D1"/>
                <circle cx="230" cy="35" r="1.5" fill="#667EEA"/>

                <circle cx="205" cy="50" r="1.5" fill="#4ECDC4"/>
                <circle cx="215" cy="45" r="2" fill="#FF6B6B"/>
                <circle cx="225" cy="55" r="1.5" fill="#45B7D1"/>
            </g>

            {/* Modern accent element */}
            <g transform="translate(240, 20)" opacity="0.3">
                <rect x="0" y="0" width="20" height="3" rx="1.5" fill="url(#badgeGradient)"/>
                <rect x="0" y="6" width="15" height="3" rx="1.5" fill="url(#accentGradient)"/>
                <rect x="0" y="12" width="18" height="3" rx="1.5" fill="url(#badgeGradient)"/>

                <rect x="0" y="25" width="12" height="3" rx="1.5" fill="url(#accentGradient)"/>
                <rect x="0" y="31" width="16" height="3" rx="1.5" fill="url(#badgeGradient)"/>
                <rect x="0" y="37" width="10" height="3" rx="1.5" fill="url(#accentGradient)"/>
            </g>
        </svg>
    );
}
