// components/ui/Dropdown.tsx
"use client";
import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface DropdownProps {
  children: React.ReactNode;
  content: React.ReactNode;
  placement?: 'top' | 'bottom';
  align?: 'left' | 'right' | 'center';
  className?: string;
  contentClassName?: string;
  onOpenChange?: (open: boolean) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  children,
  content,
  placement = 'bottom',
  align = 'left',
  className,
  contentClassName,
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onOpenChange?.(newState);
  };

  const closeDropdown = () => {
    setIsOpen(false);
    onOpenChange?.(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const dropdownPlacementClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
  }[placement];

  const dropdownAlignmentClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  }[align];

  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: placement === 'bottom' ? -5 : 5,
      scale: 0.98
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 25,
        duration: 0.2
      } 
    },
    exit: { 
      opacity: 0, 
      y: placement === 'bottom' ? -5 : 5,
      scale: 0.98,
      transition: { duration: 0.15 } 
    },
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div onClick={toggleDropdown} className="cursor-pointer">
        {children}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dropdownVariants}
            className={`
              absolute z-50 min-w-[160px]
              bg-white dark:bg-gray-800 rounded-lg shadow-lg
              border border-gray-200 dark:border-gray-700
              overflow-hidden
              ${dropdownPlacementClasses}
              ${dropdownAlignmentClasses}
              ${contentClassName}
            `}
            role="menu"
            onClick={(e) => {
              // Don't close dropdown when clicking inside the content
              // Only close on specific actions (like clicking buttons)
              e.stopPropagation();
            }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;