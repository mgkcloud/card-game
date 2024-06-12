import React from 'react';
import PlayingCard from './PlayingCard';

const DealerTable = ({ cardData }) => {
  return (
    <div className="relative w-full h-full" style={{ height: 'calc(20vw * 1.4)', minHeight: '200px' }}>
      {cardData.map((card, index) => (
        <PlayingCard key={index} card={card} />
      ))}
    </div>
  );
};

export default DealerTable;
