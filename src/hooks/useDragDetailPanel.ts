import { useEffect, useRef, useState } from 'react';

interface UseDragDetailPanelProps {
  onClose: () => void;
  isOpen: boolean;
  threshold?: number; // Distance in pixels to trigger close/open
}

export const useDragDetailPanel = ({ onClose, isOpen, threshold = 100 }: UseDragDetailPanelProps) => {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  // Always reset drag state immediately when closed
  useEffect(() => {
    if (!isOpen) {
      setDragOffset(0);
      setIsDragging(false);
      setIsClosing(false);
    }
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isOpen || window.innerWidth >= 1280) return; // Only on mobile/tablet (below xl breakpoint)
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isOpen || !isDragging || window.innerWidth >= 1280) return;
    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - startXRef.current;
    // Only allow dragging to the right (positive values) to close
    if (diff > 0) {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!isOpen || !isDragging || window.innerWidth >= 1280) return;
    setIsDragging(false);
    // If dragged beyond threshold to the right, close the detail
    if (dragOffset > threshold) {
      setIsClosing(true);
      onClose();
      // Don't reset dragOffset immediately - let it stay for smooth exit animation
    } else {
      // Only reset if not closing
      setDragOffset(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isOpen || window.innerWidth >= 1280) return; // Only on mobile/tablet
    startXRef.current = e.clientX;
    currentXRef.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isOpen || !isDragging || window.innerWidth >= 1280) return;
    currentXRef.current = e.clientX;
    const diff = currentXRef.current - startXRef.current;
    // Only allow dragging to the right (positive values) to close
    if (diff > 0) {
      setDragOffset(diff);
    }
  };

  const handleMouseUp = () => {
    if (!isOpen || !isDragging || window.innerWidth >= 1280) return;
    setIsDragging(false);
    // If dragged beyond threshold to the right, close the detail
    if (dragOffset > threshold) {
      setIsClosing(true);
      onClose();
      // Don't reset dragOffset immediately - let it stay for smooth exit animation
    } else {
      // Only reset if not closing
      setDragOffset(0);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return {
    dragOffset,
    isDragging,
    isClosing,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
    },
  };
};
