// components/WithWithout.js

import React, { useState } from 'react';
import { InlineWidget } from 'react-calendly';
import WithWithoutCard from './WithWithoutCard';

const WithWithout = () => {
  const [activeCard, setActiveCard] = useState(0);

  const cardData = [
    {
      title: 'Transform your sales with AI-powered automation',
      color: 'bg-green-500',
      textColor: 'text-white',
      items: [
        'Qualify and engage leads 24/7',
        'Automate personalised follow-ups',
        'Reduce response times',
        'Integrates with your CRM',
        'Tailored customer journeys',
      ],
    },
    {
      title: 'Relying on outdated sales tactics?',
      color: 'bg-red-500',
      textColor: 'text-white',
      items: [
        'Struggling to engage leads',
        'Wasting time on unqualified leads',
        'Experiencing slow response times',
        'Lacking a centralised system for lead data',
        'Not personalising the customer journey.',
      ],
    },
  ];

  const handleSwipe = (index) => {
    setActiveCard(index);
  };

  return (
    <section className="bg-neutral text-neutral-content relative min-h-[80vh] overflow-hidden">
      <div className="relative hero-overlay bg-opacity-90"></div>
      <div className="container mx-auto px-8 py-16 md:py-16 flex flex-col items-center justify-center">
        <h2 className="max-w-3xl mx-auto font-extrabold text-4xl md:text-5xl tracking-tight text-center mb-12 md:mb-20">
          Make a choice: Outdated Sales or AI Automation?
        </h2>
        <div className="flex flex-col-reverse md:flex-row max-w-[900px] items-center justify-center w-full">
          <div
            className="relative w-full md:w-1/2"
            style={{ height: 'calc(20vw * 1.4)', minHeight: '200px' }}
          >
            {cardData.map((card, index) => (
              <WithWithoutCard
                key={index}
                card={card}
                active={index === activeCard}
                index={index}
                handleSwipe={handleSwipe}
              />
            ))}
          </div>
          <div className="w-full md:w-1/2 mt-8 md:mt-0 md:ml-8">
            <div className="rounded-2xl border-2 border-gray-800 bg-white text-white p-6 overflow-x-hidden overflow-y-scroll relative" style={{ height: '500px' }}>
              <InlineWidget
                url="https://calendly.com/will-feistyagency/30min"
                styles={{
                  height: '1000px',
                  transform: 'scale(0.85)',
                  transformOrigin: 'middle',
                  marginTop: '-290px'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WithWithout;
