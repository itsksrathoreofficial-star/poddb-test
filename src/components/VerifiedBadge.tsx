import React from 'react';
import { cn } from '@/lib/utils';

interface VerifiedBadgeProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function VerifiedBadge({ className, ...props }: VerifiedBadgeProps) {
  return (
    <svg
      aria-label="Premium Verified"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn("h-6 w-6", className)}
      {...props}
    >
      <title>Premium Verified</title>
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#FFA500', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#DAA520', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="shineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: '#FFD700', stopOpacity: 0.3 }} />
        </linearGradient>
      </defs>
      <g fill="url(#goldGradient)">
        <path
          d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18A8,8,0,1,1,20,12,8,8,0,0,1,12,20Z"
        />
        <path
          d="M16.5,8.5a1,1,0,0,0-1.41,0L12,11.59l-1.59-1.59a1,1,0,0,0-1.41,1.41l2.29,2.29a1,1,0,0,0,1.41,0L16.5,9.91A1,1,0,0,0,16.5,8.5Z"
        />
      </g>
      <path
        d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18A8,8,0,1,1,20,12,8,8,0,0,1,12,20Z"
        fill="none"
        stroke="url(#shineGradient)"
        strokeWidth="0.5"
      />
      <circle cx="12" cy="12" r="10" fill="none" stroke="url(#goldGradient)" strokeWidth="1" />
    </svg>
  );
}