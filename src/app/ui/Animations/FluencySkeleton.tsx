// src/app/ui/Components/Skeleton/skeleton.tsx
import React from 'react';
import './fluency-skeleton.css'; // Import your custom CSS for the skeleton animation
interface FluencySkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

const FluencySkeleton = React.forwardRef<HTMLDivElement, FluencySkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative overflow-hidden bg-fluency-gray-100 dark:bg-fluency-gray-800 rounded-lg ${className}`}
        {...props}
      >
        {/* Shimmer Animation */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-fluency-gray-700/40 to-transparent animate-shimmer" />
      </div>
    );
  }
);

FluencySkeleton.displayName = 'FluencySkeleton';

export default FluencySkeleton;