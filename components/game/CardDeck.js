// components/game/CardDeck.js
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PlayingCard from './PlayingCard';

const CardDeck = ({ cardData }) => {
  const [activeIndex, setActiveIndex] = useState(Math.floor(cardData.length / 2));
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

  const calculateCardPosition = (index, total) => {
    const angleStep = (2 * Math.PI) / total;
    const angle = ((index - activeIndex + total) % total) * angleStep;
    const radius = Math.min(containerSize.width, containerSize.height) * 0.35; // Adjust as needed
    
    // Position relative to the center (0, 0)
    const x = Math.sin(angle) * radius;
    const y = -Math.cos(angle) * radius;
    
    return {
      x,
      y,
      rotate: (angle * 180) / Math.PI,
      scale: index === activeIndex ? 1.1 : 1,
      zIndex: total - Math.abs(index - activeIndex),
    };
  };

  const handleDragEnd = (_, info) => {
    const threshold = 50;
    if (Math.abs(info.offset.x) > threshold) {
      const direction = info.offset.x > 0 ? -1 : 1;
      setActiveIndex((prev) => (prev + direction + cardData.length) % cardData.length);
    }
  };

  return (
    <div ref={deckRef} className="relative w-full h-full overflow-visible">
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence initial={false}>
          {cardData.map((card, index) => {
            const { x, y, rotate, scale, zIndex } = calculateCardPosition(index, cardData.length);
            const isActive = index === activeIndex;
            return (
              <motion.div
                key={card.id || index}
                style={{
                  position: 'absolute',
                  x,
                  y,
                  rotate,
                  scale,
                  zIndex,
                }}
                animate={{ x, y, rotate, scale, zIndex }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                drag={isActive ? "x" : false}
                dragConstraints={{ left: -100, right: 100 }}
                onDragEnd={handleDragEnd}
              >
                <PlayingCard card={card} isActive={isActive} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CardDeck;
