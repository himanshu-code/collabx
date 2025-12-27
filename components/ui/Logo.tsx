import React from "react";

const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        width={48}
        height={48}
        viewBox="0 0 48 48"
        fill="none"
        {...props}
    >
        <rect width="48" height="48" rx="12" fill="#1A202C" />
        <g>
            <circle cx="16" cy="24" r="7" fill="#38BDF8" />
            <circle cx="32" cy="24" r="7" fill="#F472B6" />
            <rect
                x="19"
                y="21"
                width="10"
                height="6"
                rx="3"
                fill="#FBBF24"
                opacity="0.9"
            />
            <text
                x="24"
                y="41"
                textAnchor="middle"
                fontFamily="Inter, Arial, sans-serif"
                fontWeight="bold"
                fontSize="8"
                fill="#fff"
                letterSpacing="1"
            >
                collabX
            </text>
        </g>
    </svg>
);

export default Logo;