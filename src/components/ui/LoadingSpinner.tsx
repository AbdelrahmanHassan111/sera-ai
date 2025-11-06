import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div className="relative">
        {/* Outer ring */}
        <motion.div
          className={`${sizes[size]} border-4 border-primary/30 rounded-full`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Inner ring */}
        <motion.div
          className={`${sizes[size]} border-4 border-transparent border-t-primary border-r-secondary rounded-full absolute inset-0`}
          animate={{ rotate: -360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Center dot */}
        <motion.div
          className="absolute inset-0 m-auto w-3 h-3 bg-accent rounded-full"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      </div>
      
      {text && (
        <motion.p
          className="text-text-secondary font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

