import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import DraggableCard from './DraggableCard';

const CardRevealSection = ({ revealedCards, onCardReveal }) => {
  const { setNodeRef } = useDroppable({ id: 'card-reveal-section' });

  const [expandedCard, setExpandedCard] = useState(null);

  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cardWidth = useMemo(() => (viewportWidth < 768 ? 40 : 64), [viewportWidth]);

  const overlapMargin = useMemo(() => {
    // Only compute overlap if we have more than 6 cards to display
    if (revealedCards.length <= 6) return 0;

    const maxRowWidth = viewportWidth * 0.9;
    const spacing = Math.min(cardWidth * 0.6, (maxRowWidth - cardWidth) / (revealedCards.length - 1));
    // Ensure we still show a slight visible edge of each card
    return Math.max(0, cardWidth - spacing);
  }, [revealedCards.length, viewportWidth, cardWidth]);

  const handleCardClick = useCallback((card) => {
    setExpandedCard((prev) => (prev && prev.id === card.id ? null : card));
  }, []);

  return (
    <motion.div
      ref={setNodeRef}
      className="w-max bg-gray-700 p-4 fixed top-[10vh] left-0 right-0 m-auto rounded-lg"
      initial={{ height: 0 }}
      animate={{ height: 'auto' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ zIndex: 2500 }}
    >
      <div className="flex items-center justify-center" style={{ overflow: 'visible' }}>
        {revealedCards.map((card, index) => (
          <div
            key={index}
            className="w-10 h-10 md:w-16 md:h-16 bg-gray-600 rounded-lg border-2 border-dashed border-gray-500 flex items-center justify-center flex-shrink-0"
            style={{
              overflow: expandedCard && expandedCard.id === card?.id ? 'visible' : 'hidden',
              marginLeft: index === 0 ? 0 : (overlapMargin > 0 ? `-${overlapMargin}px` : '1rem'),
              zIndex: expandedCard && expandedCard.id === card?.id ? 10000 : index,
              position: expandedCard && expandedCard.id === card?.id ? 'fixed' : 'relative',
              left: expandedCard && expandedCard.id === card?.id ? '50%' : 'auto',
              top: expandedCard && expandedCard.id === card?.id ? '50%' : 'auto',
              transform: expandedCard && expandedCard.id === card?.id ? 'translate(-50%, -50%)' : 'none',
            }}
          >
            {card ? (
              <DraggableCard
                card={card}
                isDummy={false}
                isActive={false}
                position={{ x: 0, y: 0, rotate: 0, scale: 1, zIndex: 1 }}
                onDragStart={() => {}}
                onDragEnd={() => {}}
                onMoveCardToDeck={() => {}}
                containerRef={false}
                renderDragOverlay={null}
                isDeckOpen={false}
                dragConstraints={false}
                onClick={() => handleCardClick(card)}
                isExpanded={expandedCard && expandedCard.id === card.id}
                isThumbnailView={true}
                isInDeck={false}
                isInRevealSection={true}
              />
            ) : (
              <span className="text-gray-400"></span>
            )}
          </div>
        ))}
      </div>
      {expandedCard && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75"
          style={{ zIndex: 24999 }}
          onClick={() => setExpandedCard(null)}
        ></div>
      )}
    </motion.div>
  );
};

export default CardRevealSection;
