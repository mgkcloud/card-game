// components/game/DealerSection.js
import React from 'react';
import CardDeck from './CardDeck';

const DealerSection = ({ cardData }) => {
  return (
    <section className="bg-neutral text-neutral-content relative min-h-screen overflow-hidden">
      <div className="relative hero-overlay bg-opacity-90"></div>
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center h-full">
        <h2 className="max-w-3xl mx-auto font-extrabold text-2xl md:text-4xl tracking-tight text-center mb-8">
          Make a choice: Outdated Sales or AI Automation?
        </h2>
        <div className="w-full h-[120vh] md:h-[160vh] relative">
          <CardDeck cardData={cardData} />
        </div>
      </div>
    </section>
  );
};

export default DealerSection;
