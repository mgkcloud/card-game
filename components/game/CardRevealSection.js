// components/game/CardRevealSection.js

import React from 'react';
import { motion } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import DraggableCard from './DraggableCard';

const CardRevealSection = ({ revealedCards, onCardReveal, dealCards }) => {
  const { setNodeRef } = useDroppable({ id: 'card-reveal-section' });

  return (
    <motion.div
      ref={setNodeRef}
      className="w-max bg-gray-700 p-4 fixed top-[10vh] left-0 right-0 m-auto rounded-lg"
      initial={{ height: 0 }}
      animate={{ height: 'auto' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ zIndex: 1000 }}
    >
      <div className="grid grid-cols-6 gap-4">
        {revealedCards.map((card, index) => (
          <div
            key={index}
            className="w-10 h-10 md:w-16 md:h-16 bg-gray-600 rounded-lg border-2 border-dashed border-gray-500 flex items-center justify-center flex-shrink-0 overflow-hidden"
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
                onClick={() => {}}
                isExpanded={false}
                setIsExpanded={() => {}}
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
      <button onClick={dealCards} className="mt-4 btn btn-primary">
        Deal Cards
      </button>
    </motion.div>
  );
};

export default CardRevealSection;
