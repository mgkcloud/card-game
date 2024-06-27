// components/game/DealerTable.js
import React from 'react';
import CardDeck from './CardHand';

const DealerTable = ({ cardData }) => {
  return (
    <div className="w-full max-w-5xl mx-auto relative h-screen pt-20"> {/* Added pt-20 for top padding */}
        <CardDeck cardData={cardData} />
      </div>
  );
};

export default DealerTable;
