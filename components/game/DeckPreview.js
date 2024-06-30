// components/game/DeckPreview.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import DraggableCard from './DraggableCard';

const DeckPreview = ({ deckCards, onMoveCardToHand, isDeckOpen, setIsDeckOpen }) => {
  const { setNodeRef } = useDroppable({
    id: 'deck-preview',
  });

  const [visibleCards, setVisibleCards] = useState(10);
  const [isThumbnailView, setIsThumbnailView] = useState(true);

  const containerRef = useRef(null);

  const loadMoreCards = useCallback(() => {
    if (
      containerRef.current &&
      containerRef.current.scrollHeight - containerRef.current.scrollTop <=
      containerRef.current.clientHeight + 100
    ) {
      setVisibleCards((prevVisibleCards) =>
        Math.min(prevVisibleCards + 10, deckCards.length)
      );
    }
  }, [deckCards]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.addEventListener('scroll', loadMoreCards);
      return () =>
        containerRef.current.removeEventListener('scroll', loadMoreCards);
    }
  }, [loadMoreCards]);

  return (
    <motion.div
      ref={setNodeRef}
      className="fixed bottom-0 left-0 w-full bg-neutral"
      style={{ zIndex: 400 }}
      animate={{ height: isDeckOpen ? '55vh' : '10vh' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div
        className="w-full h-10 flex justify-center items-center cursor-pointer bg-gray-800 rounded-t-2xl"
        onClick={() => setIsDeckOpen(!isDeckOpen)}
        style={{ touchAction: 'none' }}
      >
        <div className="w-10 h-1 bg-gray-400 rounded-full " />
      </div>
      <div
        className="p-4 grid grid-cols-6 gap-2 overflow-y-auto h-full bg-gray-800 "
        ref={containerRef}
      >
        <AnimatePresence>
          {deckCards.slice(0, visibleCards).map((card, index) => (
     
                <DraggableCard
                  key={card.id || `deck-card-${index}`}
                  card={card}
                  isDummy={false}
                  isActive={false}
                  position={{ x: 0, y: 0, rotate: 0, scale: 1, zIndex: index }}
                  onDragStart={() => { }}
                  onDragEnd={(_, info) => {
                    if (info.offset.y > 85) {
                      onMoveCardToHand(card);
                    }
                  }}
                  onMoveCardToDeck={onMoveCardToHand}
                  containerRef={false} // Pass the container ref to allow dragging constraints
                  renderDragOverlay={null}
                  isDeckOpen={isDeckOpen}
                  dragConstraints={false}
                  onClick={() => onMoveCardToHand(card)}
                  isExpanded={false}
                  setIsExpanded={() => { }}
                  isThumbnailView={isThumbnailView} // Pass the view mode state
                  isInDeck={true}
                />
         
          ))}
        </AnimatePresence>
      </div >
    </motion.div >
  );
};

export default DeckPreview;
