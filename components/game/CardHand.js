// components/game/CardHand.js
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';
import PlayingCard from './PlayingCard';

const CardHand = ({ cardData, onSwipeDown, newCard, onMoveCardToDeck, renderDragOverlay, isDeckOpen }) => {
  const totalCards = 60;
  const visibleCards = Math.min(cardData.length, 9);
  const initialActiveIndex = Math.floor(visibleCards / 2);

  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [expandedCard, setExpandedCard] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previousActiveIndex, setPreviousActiveIndex] = useState(null);
  const deckRef = useRef(null);

  useEffect(() => {
    const updateContainerSize = () => {
      if (deckRef.current) {
        const rect = deckRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    return () => window.removeEventListener('resize', updateContainerSize);
  }, []);

  useEffect(() => {
    // Adjust activeIndex if it's out of bounds after cardData changes
    if (activeIndex >= cardData.length) {
      setActiveIndex(Math.max(0, cardData.length - 1));
    }
  }, [cardData, activeIndex]);

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      handleRemoveCard(cardData[activeIndex]);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIndex, cardData]);

  const calculateCardPosition = (index) => {
    const angleStep = (2 * Math.PI) / totalCards;
    const angle = ((index - initialActiveIndex + totalCards) % totalCards) * angleStep;
    const radius = Math.min(containerSize.width, containerSize.height) * 0.35;

    const x = Math.sin(angle) * radius;
    const y = -Math.cos(angle) * radius;

    return {
      x,
      y,
      rotate: (angle * 180) / Math.PI,
      scale: index === initialActiveIndex ? 1.1 : 1,
      zIndex: totalCards - Math.abs(index - initialActiveIndex),
    };
  };

  const handleRemoveCard = (card) => {
    const cardElement = document.querySelector('.playing-card.active');
    if (cardElement) {
      const rect = cardElement.getBoundingClientRect();
      onSwipeDown(card, { x: rect.x, y: rect.y, width: rect.width, height: rect.height });
      setActiveIndex((prevIndex) => {
        if (prevIndex === cardData.length - 1) {
          return Math.max(0, prevIndex - 1);
        }
        return prevIndex;
      });
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (_, info, card) => {
    setIsDragging(false);
    if (info.offset.y > 85) { // If dragged down more than 100px
      handleRemoveCard(card);
    } else {
      const threshold = 20;
      if (Math.abs(info.offset.x) > threshold) {
        const direction = info.offset.x > 0 ? -1 : 1;
        setActiveIndex((prev) => {
          const newIndex = (prev + direction + cardData.length) % cardData.length;
          if (expandedCard) {
            setExpandedCard(cardData[newIndex]);
          }
          return Math.max(0, Math.min(newIndex, cardData.length - 1));
        });
      }
    }
  };

  const handleCardClick = (card, index) => {
    if (!isDragging) {
      if (expandedCard) {
        // If we're closing the modal
        setExpandedCard(null);
        // Don't change the active index when closing the modal
      } else {
        // If we're opening the modal
        setExpandedCard(card);
        setActiveIndex(index);
      }
    }
  };

  const visibleIndices = Array.from({ length: visibleCards }, (_, i) =>
    (activeIndex - initialActiveIndex + i + cardData.length) % cardData.length
  );

  return (
    <div ref={deckRef} className="relative w-full h-full overflow-visible">
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence initial={false}>
          {Array.from({ length: totalCards }).map((_, index) => {
            const visibleIndex = index % visibleCards;
            const cardIndex = visibleIndices[visibleIndex];
            const card = cardData[cardIndex];
            const { x, y, rotate, scale, zIndex } = calculateCardPosition(index);
            const isActive = cardIndex === activeIndex;
            const isDummy = index >= visibleCards;

            return (
              <DraggableCard
                key={isDummy ? `dummy-${index}` : (card?.id || cardIndex)}
                card={card}
                isDummy={isDummy}
                isActive={isActive}
                position={{ x, y, rotate, scale, zIndex: expandedCard ? (isActive ? totalCards + 1 : zIndex) : zIndex }}
                onDragStart={handleDragStart}
                onDragEnd={(_, info) => handleDragEnd(_, info, card)}
                onMoveCardToDeck={onMoveCardToDeck}
                containerRef={deckRef}
                renderDragOverlay={renderDragOverlay}
                isDeckOpen={isDeckOpen}
                onClick={() => handleCardClick(card, cardIndex)}
                isExpanded={expandedCard === card}
              />
            );
          })}
        </AnimatePresence>
      </div>
      {expandedCard && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75"
          style={{ zIndex: 9999 }}
          onClick={() => handleCardClick(null, null)}
        ></div>
      )}
    </div>
  );
};

const DraggableCard = ({ card, isDummy, isActive, position, onDragStart, onDragEnd, onMoveCardToDeck, containerRef, renderDragOverlay, isDeckOpen, onClick, isExpanded, setIsExpanded }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card?.id || 'dummy',
    data: { card, renderDragOverlay },
    disabled: !isDeckOpen, // Disable dragging if the deck is not open
  });


  const baseZIndex = 100;
  const activeZIndex = 200;
  const draggingZIndex = 10000;
  const expandedZIndex = 20000;

  const cardZIndex = isActive ? activeZIndex : baseZIndex + position.zIndex;

  // Calculate the scale based on viewport size
  const calculateScale = () => {

    if (typeof window === 'undefined') {
      return 1; // Default scale for server-side rendering
    }


    if (typeof window != 'undefined') {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const maxWidth = viewportWidth * 0.8;
      const maxHeight = viewportHeight * 0.8;
      const scaleX = maxWidth / 192; // 48rem = 192px (3 * 16px per rem)
      const scaleY = maxHeight / 288; // 72rem = 288px
      return Math.min(scaleX, scaleY, 2); // Cap the scale at 2x for larger screens
    }


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
        position: 'absolute',
        opacity: isDummy ? 0 : 1,
      }}
      animate={isDragging ? {} : {
        ...position,
        scale: isExpanded ? expandedScale : position.scale,
        zIndex: isExpanded ? expandedZIndex : (isActive ? activeZIndex : baseZIndex + position.zIndex),
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      {...attributes}
      {...listeners}
      drag={!isDummy}
      dragConstraints={containerRef}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      dragElastic={0.2}
      onClick={onClick}

    >
      {!isDummy && card && <PlayingCard card={card} isActive={isActive} isExpanded={isExpanded} isDragging={isDragging} />}

    </motion.div>
  );
};


export default CardHand;
