// components/toolbar/Dropdown.tsx
"use client";
import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';

interface DropdownProps {
  children: React.ReactNode;
  content: React.ReactNode;
  placement?: 'top' | 'bottom';
  align?: 'left' | 'right' | 'center';
  className?: string;
  contentClassName?: string;
  onOpenChange?: (open: boolean) => void;
  usePortal?: boolean; // Nova prop para controlar o uso do portal
}

const Dropdown: React.FC<DropdownProps> = ({
  children,
  content,
  placement = 'bottom',
  align = 'left',
  className,
  contentClassName,
  onOpenChange,
  usePortal = false, // Por padrão, não usa portal
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onOpenChange?.(newState);

    // Calcular posição quando abrir e estiver usando portal
    if (newState && usePortal && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      // Para mobile com toolbar no bottom, não precisamos calcular top baseado no trigger
      const isMobileToolbarAtBottom = window.innerWidth < 768;
      
      setPosition({
        top: isMobileToolbarAtBottom ? 0 : rect.top + scrollTop + (placement === 'bottom' ? rect.height + 8 : -8),
        left: rect.left + scrollLeft,
        width: rect.width
      });
    }
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

    const handleScroll = () => {
      if (isOpen && usePortal) {
        closeDropdown();
      }
    };

    const handleResize = () => {
      if (isOpen && usePortal) {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      if (usePortal) {
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleResize);
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, usePortal]);

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

  // Função para calcular o alinhamento quando usar portal
  const getPortalAlignmentStyle = () => {
    if (!usePortal) return {};
    
    // Para mobile, sempre abrir acima da toolbar quando ela estiver no bottom
    const isMobileToolbarAtBottom = window.innerWidth < 768; // assumindo breakpoint de 768px
    
    const baseStyle = {
      position: 'fixed' as const,
      zIndex: 9999,
    };

    // Se for mobile e toolbar estiver no bottom, sempre abrir acima
    if (isMobileToolbarAtBottom) {
      const dropdownHeight = 160; // altura estimada do dropdown
      const toolbarHeight = 60; // altura estimada da toolbar
      
      return {
        ...baseStyle,
        bottom: toolbarHeight + 8, // 8px de margem da toolbar
        left: position.left + (position.width / 2),
        transform: 'translateX(-50%)',
      };
    }

    // Caso contrário, usar a lógica original
    const topPosition = placement === 'bottom' ? position.top : position.top - 160;
    
    switch (align) {
      case 'left':
        return { ...baseStyle, top: topPosition, left: position.left };
      case 'right':
        return { ...baseStyle, top: topPosition, right: window.innerWidth - position.left - position.width };
      case 'center':
        return { ...baseStyle, top: topPosition, left: position.left + (position.width / 2), transform: 'translateX(-50%)' };
      default:
        return { ...baseStyle, top: topPosition, left: position.left };
    }
  };

  const dropdownContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={dropdownVariants}
          className={`
            ${usePortal ? '' : 'absolute'}
            ${usePortal ? 'z-[9999]' : 'z-[99]'}
            min-w-[160px]
            bg-white dark:bg-gray-800 rounded-lg shadow-lg
            border border-gray-200 dark:border-gray-700
            overflow-hidden
            ${usePortal ? '' : dropdownPlacementClasses}
            ${usePortal ? '' : dropdownAlignmentClasses}
            ${contentClassName}
          `}
          style={usePortal ? getPortalAlignmentStyle() : {}}
          role="menu"
          onClick={(e) => {
            // Don't close dropdown when clicking inside the content
            e.stopPropagation();
          }}
        >
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={triggerRef}
        onClick={toggleDropdown} 
        className="cursor-pointer"
      >
        {children}
      </div>
      {usePortal && typeof window !== 'undefined' ? 
        createPortal(dropdownContent, document.body) : 
        dropdownContent
      }
    </div>
  );
};

export default Dropdown;