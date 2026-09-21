import React from "react";

interface ClockIllustrationProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const EmptyEventsClockIcon: React.FC<ClockIllustrationProps> = ({
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
      <path
        d="M35 50C35 30 50 20 70 20C90 20 100 35 100 55C100 75 85 90 65 90C45 90 35 70 35 50Z"
        fill="#F0F4FF"
      />

      <path
        d="M48 28C53 30 56 38 52 46C48 50 40 48 38 42C36 34 42 26 48 28Z"
        fill="#FFC107"
      />

      <path
        d="M41 45C46 47 48 55 43 62C38 66 31 63 30 57C28 50 35 43 41 45Z"
        fill="#03A9F4"
      />

      <path
        d="M40 60C45 61 48 68 44 75C40 80 32 78 30 72C27 65 34 58 40 60Z"
        fill="#CE93D8"
      />

      <circle
        cx="65"
        cy="58"
        r="28"
        fill="#FFFFFF"
        stroke="#00A3FF"
        strokeWidth="2.5"
      />

      <g
        stroke="#00A3FF"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <line x1="65" y1="34" x2="65" y2="37" />
        <line x1="77" y1="37" x2="75.5" y2="39.6" />
        <line x1="86" y1="46" x2="83.4" y2="47.5" />
        <line x1="89" y1="58" x2="86" y2="58" />
        <line x1="86" y1="70" x2="83.4" y2="68.5" />
        <line x1="77" y1="79" x2="75.5" y2="76.4" />
        <line x1="65" y1="82" x2="65" y2="79" />
        <line x1="53" y1="79" x2="54.5" y2="76.4" />
        <line x1="44" y1="70" x2="46.6" y2="68.5" />
        <line x1="41" y1="58" x2="44" y2="58" />
        <line x1="44" y1="46" x2="46.6" y2="47.5" />
        <line x1="53" y1="37" x2="54.5" y2="39.6" />
      </g>

      <line
        x1="65"
        y1="58"
        x2="72"
        y2="48"
        stroke="#00A3FF"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <line
        x1="65"
        y1="58"
        x2="60"
        y2="43"
        stroke="#EC407A"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <circle
        cx="65"
        cy="58"
        r="1.5"
        fill="#EC407A"
      />
    </svg>
  );
};

export default EmptyEventsClockIcon;