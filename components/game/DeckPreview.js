// components/game/DeckPreview.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDroppable, useDraggable } from '@dnd-kit/core';

const DeckPreview = ({ deckCards, onMoveCardToHand, renderDragOverlay, isDeckOpen, setIsDeckOpen }) => {
  const { setNodeRef } = useDroppable({
    id: 'deck-preview',
  });

  return (
    <motion.div
      ref={setNodeRef}
      className="fixed bottom-0 left-0 w-full bg-gray-800 rounded-t-2xl"
      style={{ zIndex: 9998 }}
      animate={{ height: isDeckOpen ? '50vh' : '10vh' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div 
        className="w-full h-10 flex justify-center items-center cursor-pointer"
        onClick={() => setIsDeckOpen(!isDeckOpen)}
      >
        <div className="w-10 h-1 bg-gray-400 rounded-full" />
      </div>
      <div className="p-4 grid grid-cols-5 gap-2 overflow-y-auto h-full">
        <AnimatePresence>
          {deckCards.map((card) => (
            <DraggableDeckCard 
              key={card.id} 
              card={card} 
              onMoveCardToHand={onMoveCardToHand}
              renderDragOverlay={renderDragOverlay}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const DraggableDeckCard = ({ card, onMoveCardToHand, renderDragOverlay }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: { card, renderDragOverlay },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 9999 : undefined,
    transition: isDragging ? 'none' : undefined,
  } : {};

  return (
    <motion.div
      ref={setNodeRef}
      className="aspect-w-2 aspect-h-3 rounded-lg overflow-hidden cursor-move"
      style={style}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
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
