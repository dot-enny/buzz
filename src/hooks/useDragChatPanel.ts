import { useEffect, useRef, useState } from 'react';

interface UseDragChatPanelProps {
  onClose: () => void;
  onOpenDetail: () => void;
  isOpen: boolean;
  hasChatActive: boolean; // Only allow opening detail if chat is active
  threshold?: number; // Distance in pixels to trigger close/open
}

export const useDragChatPanel = ({ 
  onClose, 
  onOpenDetail, 
  isOpen, 
  hasChatActive,
  threshold = 100 
}: UseDragChatPanelProps) => {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  useEffect(() => {
    if (!isOpen) {
      setDragOffset(0);
      setIsDragging(false);
    }
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.innerWidth >= 768) return; // Only on mobile
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || window.innerWidth >= 768) return;
    
    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - startXRef.current;
    
    // Allow dragging in both directions
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging || window.innerWidth >= 768) return;
    
    setIsDragging(false);
    
    // If dragged right beyond threshold, close the chat
    if (dragOffset > threshold) {
      onClose();
    }
    // If dragged left beyond threshold and chat is active, open detail
    else if (dragOffset < -threshold && hasChatActive) {
      onOpenDetail();
    }
    
    // Reset drag offset
    setDragOffset(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (window.innerWidth >= 768) return; // Only on mobile
    startXRef.current = e.clientX;
    currentXRef.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || window.innerWidth >= 768) return;
    
    currentXRef.current = e.clientX;
    const diff = currentXRef.current - startXRef.current;
    
    // Allow dragging in both directions
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging || window.innerWidth >= 768) return;
    
    setIsDragging(false);
    
    // If dragged right beyond threshold, close the chat
    if (dragOffset > threshold) {
      onClose();
    }
    // If dragged left beyond threshold and chat is active, open detail
    else if (dragOffset < -threshold && hasChatActive) {
      onOpenDetail();
    }
    
    // Reset drag offset
    setDragOffset(0);
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
  }, [isDragging, dragOffset, hasChatActive]);

  return {
    dragOffset,
    isDragging,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
    },
  };
};
