// components/game/DraggableCard.js
import React from 'react';
import { motion } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';
import PlayingCard from './PlayingCard';

const DraggableCard = ({ card, isDummy, isActive, position, onDragStart, onDragEnd, onMoveCardToDeck, containerRef, renderDragOverlay, isDeckOpen, onClick, isExpanded, setIsExpanded, isThumbnailView, isInDeck, isInRevealSection }) => {
  const [longPressStarted, setLongPressStarted] = React.useState(false);
  const longPressTimer = React.useRef(null);

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  // Haptic feedback helper
  const triggerHaptic = () => {
    // Try iOS Safari haptic feedback (newer iOS versions)
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50); // Short vibration
    }
    // Alternative: check for newer iOS haptic feedback API
    if (typeof window !== 'undefined' && window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
      // iOS 13+ haptic simulation via brief audio context feedback
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
      } catch (e) {
        // Fallback silently
      }
    }
  };

  const handlePointerDown = (e) => {
    if (!isInDeck || !isDeckOpen) {
      if (onDragStart) onDragStart(e);
      return;
    }
    
    // Don't prevent default to allow scrolling
    longPressTimer.current = setTimeout(() => {
      setLongPressStarted(true);
      triggerHaptic();
      if (onDragStart) onDragStart(e);
    }, 500); // 500ms for long press
    e.stopPropagation(); // Stop propagation to prevent parent re-renders
  };

  const handlePointerUp = (e) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!longPressStarted && onClick) {
      onClick(); // Regular click if not long press
    }
    setLongPressStarted(false);
    e.stopPropagation(); // Stop propagation to prevent parent re-renders
  };

  const handlePointerMove = (e) => {
    if (longPressTimer.current && !longPressStarted) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    // Don't prevent default to allow scrolling
    e.stopPropagation(); // Stop propagation to prevent parent re-renders
  };

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card?.id || 'dummy',
    data: { card, renderDragOverlay },
    disabled: !isDeckOpen || isInRevealSection || (isInDeck && !longPressStarted), // Only allow dragging after long press for deck cards
  });

  // Z-index hierarchy:
  // Deck cards: 100-999
  // Hand cards: 1000-1999  
  // Reveal section: 2000-2999
  // TopMenu: 3000-3999 (when open: 20000)
  // Deck container: 6000 (when open)
  // Expanded cards: 25000
  // Dragging cards: 30000 (highest priority, except deck cards)
  
  const getBaseZIndex = () => {
    if (isInRevealSection) return 2000;
    if (isInDeck) return 100;
    return 1000; // hand cards
  };
  
  const baseZIndex = getBaseZIndex();
  const activeZIndex = baseZIndex + 500;
  const expandedZIndex = 25000;
  // Deck cards when dragging should stay below the opened deck (z-index 6000)
  const draggingZIndex = isInDeck ? 5000 : 30000;

  const calculateScale = () => {
    if (typeof window === 'undefined') {
      return 1;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const maxWidth = viewportWidth * 0.8;
    const maxHeight = viewportHeight * 0.8;
    const scaleX = maxWidth / 192;
    const scaleY = maxHeight / 288;
    return Math.min(scaleX, scaleY, 2);
  };

  const expandedScale = calculateScale();

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? draggingZIndex : (isExpanded ? expandedZIndex : (isActive ? activeZIndex : baseZIndex + position.zIndex)),
    transition: isDragging ? 'none' : undefined,
  } : {};

  const expandedStyle = isExpanded ? {
    transform: `scale(${expandedScale})`,
    zIndex: expandedZIndex,
  } : {};

  const handleHold = () => {
    if (isActive) {
      setIsExpanded(true);
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      className={`playing-card ${isActive ? 'active' : ''}`}
      style={{
        ...style,
        ...expandedStyle,
        position: isInRevealSection ? 'relative' : (isInDeck ? 'relative' : 'absolute'),
        opacity: isDummy ? 0 : 1,
        height: isInRevealSection ? '100%' : (isInDeck ? (isDragging ? 'unset' : '100%') : 'unset'),
        width: isInRevealSection ? '100%' : (isInDeck ? (isDragging ? 'unset' : '100%') : 'unset'),
        touchAction: isInDeck ? 'pan-y' : 'none', // Allow vertical scrolling for deck cards, prevent native actions for others
        WebkitTouchCallout: 'none', // Disable iOS force touch context menu
        userSelect: 'none', // Prevent selection and context menu
      }}
      animate={isDragging ? {} : {
        ...position,
        scale: isExpanded ? expandedScale : position.scale,
        zIndex: isExpanded ? expandedZIndex : (isActive ? activeZIndex : baseZIndex + position.zIndex),
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      {...attributes}
      {...(isInDeck ? {} : listeners)} // Don't use dnd-kit listeners for deck cards
      drag={!isDummy && !isInRevealSection && (!isInDeck || longPressStarted) && !isThumbnailView} // Disable dragging for thumbnails and only allow after long press for deck cards
      dragConstraints={false} // Allow dragging beyond the container when dragging
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      dragElastic={0.2}
      onPointerDown={isInDeck ? handlePointerDown : undefined}
      onPointerUp={isInDeck ? handlePointerUp : undefined}
      onPointerMove={isInDeck ? handlePointerMove : undefined}
      onClick={!isInDeck ? onClick : undefined} // Only use onClick for non-deck cards
    >
      {!isDummy && card && (
        <PlayingCard
          card={card}
          isActive={isActive}
          isExpanded={isExpanded}
          isDragging={isDragging}
          isThumbnailView={isThumbnailView}
          isInRevealSection={isInRevealSection}
          isInDeck={isInDeck}
          style={{ WebkitTouchCallout: 'none', userSelect: 'none' }} // Disable iOS force touch on inner elements
        />
      )}
    </motion.div>
  );
};

export default DraggableCard;
