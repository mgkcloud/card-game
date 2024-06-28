// components/game/DeckPreview.js
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDroppable, useDraggable } from '@dnd-kit/core';

const DeckPreview = ({ deckCards, onMoveCardToHand, isDeckOpen, setIsDeckOpen }) => {
  const { setNodeRef } = useDroppable({
    id: 'deck-preview',
  });

  return (
    <motion.div
      ref={setNodeRef}
      className="fixed bottom-0 left-0 w-full bg-neutral"
      style={{ zIndex: 9998 }}
      animate={{ height: isDeckOpen ? '50vh' : '10vh' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div 
        className="w-full h-10 flex justify-center items-center cursor-pointer bg-gray-800 rounded-t-2xl"
        onClick={() => setIsDeckOpen(!isDeckOpen)}
        style={{ touchAction: 'none' }}
      >
        <div className="w-10 h-1 bg-gray-400 rounded-full" />
      </div>
      <div className="p-4 grid grid-cols-5 gap-2 overflow-y-auto h-full bg-gray-800">
        <AnimatePresence>
          {(isDeckOpen ? deckCards : deckCards.slice(0, 5)).map((card, index) => (
            <DraggableDeckCard 
              key={card.id || `deck-card-${index}`} // Fallback to index if id is not available
              card={card} 
              onMoveCardToHand={onMoveCardToHand}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const DraggableDeckCard = ({ card, onMoveCardToHand }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: card.id || `draggable-${card.title}`, // Fallback to title if id is not available
    data: { card, isInDeck: true },
  });

  const handleClick = (e) => {
    e.stopPropagation();
    onMoveCardToHand(card);
  };

  return (
    <motion.div
      ref={setNodeRef}
      className={`aspect-w-2 aspect-h-3 rounded-lg overflow-hidden cursor-move ${isDragging ? 'opacity-50' : ''}`}
      whileHover={{ scale: 1.05 }}
      onClick={handleClick}
      {...attributes}
      {...listeners}
    >
      <img 
        src={card.mediaSrc} 
        alt={card.title} 
        className="w-full h-full object-cover" 
        draggable="false"
      />
    </motion.div>
  );
};

export default DeckPreview;
