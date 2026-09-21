import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const EmptyDppIcon: React.FC<IconProps> = ({
  size = 120,
  className = "",
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle cx="60" cy="58" r="32" fill="#E6F4FE" />

      <g transform="rotate(-12 48 58)">
        <rect x="36" y="32" width="28" height="38" rx="2" fill="#38BDF8" />
      </g>

      <g transform="rotate(3 60 55)">
        <path
          d="M44 32 H68 L74 38 V74 C74 75.1 73.1 76 72 76 H44 C42.9 76 42 75.1 42 74 V34 C42 32.9 42.9 32 44 32 Z"
          fill="#BAE6FD"
        />

        <path d="M68 32 L74 38 H68 V32 Z" fill="#7DD3FC" />

        <rect
          x="46"
          y="38"
          width="18"
          height="2.5"
          rx="1"
          fill="#FFFFFF"
          opacity="0.9"
        />
        <rect
          x="46"
          y="43"
          width="22"
          height="2.5"
          rx="1"
          fill="#FFFFFF"
          opacity="0.9"
        />
        <rect
          x="46"
          y="48"
          width="14"
          height="2.5"
          rx="1"
          fill="#FFFFFF"
          opacity="0.9"
        />
        <rect
          x="46"
          y="53"
          width="20"
          height="2.5"
          rx="1"
          fill="#FFFFFF"
          opacity="0.9"
        />
        <rect
          x="46"
          y="58"
          width="8"
          height="2.5"
          rx="1"
          fill="#FFFFFF"
          opacity="0.9"
        />
      </g>

      <g>
        <circle
          cx="66"
          cy="64"
          r="14"
          fill="#FFFFFF"
          stroke="#F97316"
          strokeWidth="3"
        />

        <path
          d="M62.5 59.5 C62.5 57.5 64 56 66 56 C68 56 69.5 57.2 69.5 58.8 C69.5 60 68.7 60.7 67.5 61.6 C66.5 62.4 65.8 63.3 65.8 64.5 V65.5"
          stroke="#F97316"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />

        <circle cx="65.8" cy="68.5" r="1.2" fill="#F97316" />

        <rect
          x="77"
          y="74"
          width="4.5"
          height="12"
          rx="2.25"
          transform="rotate(-40 77 74)"
          fill="#EA580C"
        />
      </g>
    </svg>
  );
};

export default EmptyDppIcon;