// components/game/CardDeck.js
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import PlayingCard from './PlayingCard';

const CardDeck = ({ cardData, onSwipeUp, onSwipeDown }) => {
  const totalCards = 60; // Total cards in the circle, including dummy cards
  const visibleCards = Math.min(cardData.length, 9); // Max number of real cards visible
  const initialActiveIndex = Math.floor(visibleCards / 2);
  
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
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

  const handlers = useSwipeable({
    onSwipedUp: () => onSwipeUp(cardData[activeIndex]),
    onSwipedDown: () => onSwipeDown(cardData[activeIndex]),
    trackMouse: true
  });

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

  const handleDragEnd = (_, info) => {
    const threshold = 20;
    if (Math.abs(info.offset.x) > threshold) {
      const direction = info.offset.x > 0 ? -1 : 1;
      setActiveIndex((prev) => {
        const newIndex = (prev + direction + cardData.length) % cardData.length;
        return Math.max(0, Math.min(newIndex, cardData.length - 1));
      });
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
              <motion.div
                key={isDummy ? `dummy-${index}` : (card.id || cardIndex)}
                style={{
                  position: 'absolute',
                  x,
                  y,
                  rotate,
                  scale,
                  zIndex,
                  opacity: isDummy ? 0 : 1, // Hide dummy cards
                }}
                animate={{ x, y, rotate, scale, zIndex }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                drag={isActive && !isDummy ? "x" : false}
                dragConstraints={{ left: -100, right: 100 }}
                onDragEnd={handleDragEnd}
                {...handlers}
              >
                {!isDummy && <PlayingCard card={card} isActive={isActive} />}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CardDeck;
