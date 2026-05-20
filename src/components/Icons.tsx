import React from "react";

type IconProps = { size?: number; color?: string; className?: string };

export const PipeIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8h18M3 16h18"/>
    <rect x="2" y="6" width="20" height="12" rx="2"/>
    <path d="M8 6v12M16 6v12"/>
  </svg>
);

export const HdpeIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12C4 7.58 7.58 4 12 4s8 3.58 8 8-3.58 8-8 8"/>
    <path d="M4 12h8"/>
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 4v3M12 17v3M4 12H1M23 12h-3"/>
  </svg>
);

export const SprinklerIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22V12"/>
    <path d="M5 9c0-3.87 3.13-7 7-7s7 3.13 7 7"/>
    <path d="M7.5 9h9"/>
    <path d="M6 12l-3-3M18 12l3-3"/>
    <path d="M8 6l-2-3M16 6l2-3M12 5V2"/>
  </svg>
);

export const TapeIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>
    <path d="M9 9l-4.5-4.5M15 15l4.5 4.5M15 9l4.5-4.5M9 15l-4.5 4.5"/>
  </svg>
);

export const ValveIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v4M12 18v4"/>
    <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83"/>
    <path d="M2 12h4M18 12h4"/>
    <path d="M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="12" cy="12" r="1.5" fill={color}/>
  </svg>
);

export const PumpIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="10" width="10" height="10" rx="2"/>
    <path d="M12 15h4a2 2 0 0 0 0-4h-4"/>
    <path d="M16 11V7a2 2 0 0 1 2-2h2"/>
    <path d="M7 10V7"/>
    <circle cx="7" cy="5" r="2"/>
  </svg>
);

export const ShieldIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

export const GlobeIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a14.5 14.5 0 0 0 0 20A14.5 14.5 0 0 0 12 2"/>
    <path d="M2 12h20"/>
  </svg>
);

export const HandshakeIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m11 17 2 2a1 1 0 1 0 3-3"/>
    <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/>
    <path d="m21 3 1 11h-2"/>
    <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/>
    <path d="M3 4h8"/>
  </svg>
);

export const TruckIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
    <rect x="9" y="11" width="14" height="10" rx="2"/>
    <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
  </svg>
);

export const PhoneIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 14 19.79 19.79 0 0 1 1 5.38 2 2 0 0 1 2.96 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

export const DropletIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
  </svg>
);
