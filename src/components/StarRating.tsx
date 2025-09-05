
"use client";
import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  totalStars?: number;
  size?: number;
  readOnly?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
  showValue?: boolean;
}

export function StarRating({
  rating,
  totalStars = 10,
  size = 16,
  readOnly = false,
  onRatingChange,
  className,
  showValue = false
}: StarRatingProps) {
  
  const handleStarClick = (index: number) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  const handleMouseEnter = (index: number) => {
    // Could add hover effect here if desired
  };

  const handleMouseLeave = () => {
    // Could reset hover effect here
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
        <div className="flex items-center">
        {[...Array(totalStars)].map((_, index) => (
            <Star
            key={index}
            size={size}
            className={cn(
                "transition-colors",
                index < Math.round(rating) ? 'text-primary fill-current' : 'text-muted-foreground/50',
                !readOnly && 'cursor-pointer hover:text-primary/80'
            )}
            onClick={() => handleStarClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            />
        ))}
        </div>
        {showValue && (
            <span className="font-bold text-lg">
              {rating.toFixed(1)} <span className="text-sm text-muted-foreground">/ {totalStars}</span>
            </span>
        )}
    </div>
  );
}
