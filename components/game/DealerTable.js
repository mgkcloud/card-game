import React, { useState } from 'react';
import PlayingCard from './PlayingCard';

const DealerTable = ({ cardData }) => {
  const [activeCardIndex, setActiveCardIndex] = useState(0); 

  const handleCardSwipe = (direction) => {
    const newIndex = activeCardIndex + (direction === 'right' ? 1 : -1);
    setActiveCardIndex(Math.max(0, Math.min(cardData.length - 1, newIndex))); 
  };

  return (
    <div className="relative w-full h-full" style={{ height: 'calc(20vw * 1.4)', minHeight: '200px' }}>
      {cardData.map((card, index) => (
        <PlayingCard
          key={index}
          card={card}
          index={index}
          totalCards={cardData.length}
          isActive={index === activeCardIndex} 
          onSwipe={handleCardSwipe} 
        />
      ))}
    </div>
  );
};

export default DealerTable;
