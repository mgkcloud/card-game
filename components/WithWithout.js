// components/WithWithout.js
import React, { useState, useEffect, useRef } from 'react';
import { InlineWidget } from 'react-calendly';
import WithWithoutCard from './WithWithoutCard';

const WithWithout = () => {
  const [activeCard, setActiveCard] = useState(0);
  const [isElevated, setIsElevated] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // Add isDragging state
  const cardContainerRef = useRef(null);
  const [email, setEmail] = useState('');

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

  const handleSwipe = (direction) => {
    const newIndex =
      direction === 'left'
        ? (activeCard - 1 + cardData.length) % cardData.length
        : (activeCard + 1) % cardData.length;
    setActiveCard(newIndex);
  };

  const handleCardClick = () => {
    setIsElevated(true);
    setTimeout(() => {
      setIsElevated(false);
    }, 4000); // Reduced timeout for smoother interaction
  };

  // Mouse event handlers for dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const threshold = 20; // Adjust drag threshold as needed 
    if (e.movementX > threshold) {
      handleSwipe('right');
      setIsDragging(false); 
    } else if (e.movementX < -threshold) {
      handleSwipe('left');
      setIsDragging(false);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0; 

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY; 
    };

    const handleTouchEnd = (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY; 
      const touchDiffX = touchStartX - touchEndX;
      const touchDiffY = touchStartY - touchEndY; 

      if (Math.abs(touchDiffX) > Math.abs(touchDiffY) && Math.abs(touchDiffX) > 30) {
        handleSwipe(touchDiffX > 0 ? 'left' : 'right'); 
      } else if (touchDiffY > 50) { 
        handleCardClick();
      }
    };

    const cardContainer = cardContainerRef.current;
    cardContainer.addEventListener('touchstart', handleTouchStart);
    cardContainer.addEventListener('touchend', handleTouchEnd);
    cardContainer.addEventListener('touchmove', (e) => e.preventDefault()); 
    // Add mouse event listeners
    cardContainer.addEventListener('mousedown', handleMouseDown);
    cardContainer.addEventListener('mousemove', handleMouseMove);
    cardContainer.addEventListener('mouseup', handleMouseUp);

    return () => {
      cardContainer.removeEventListener('touchstart', handleTouchStart);
      cardContainer.removeEventListener('touchend', handleTouchEnd);
      cardContainer.removeEventListener('touchmove', (e) => e.preventDefault()); 
      // Remove mouse event listeners
      cardContainer.removeEventListener('mousedown', handleMouseDown);
      cardContainer.removeEventListener('mousemove', handleMouseMove);
      cardContainer.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeCard, isDragging]); // Add isDragging to dependency array

  useEffect(() => {
    // Extract email from URL parameters
    const params = new URLSearchParams(window.location.search);
    const emailFromURL = params.get('email');
    if (emailFromURL) {
      setEmail(emailFromURL);
    }
  }, []);

  return (
    <section className="bg-neutral text-neutral-content relative min-h-[80vh] overflow-hidden">
      <div className="relative hero-overlay bg-opacity-90"></div>
      <div className="container mx-auto px-8 py-8 md:py-8 flex flex-col items-center justify-center">
        <h2 className="max-w-3xl mx-auto font-extrabold text-4xl md:text-5xl tracking-tight text-center mb-2 md:mb-20">
          Make a choice: Outdated Sales or AI Automation?
        </h2>
        <div className="flex flex-col-reverse md:flex-row max-w-[900px] items-center justify-center w-full">
          <div
            ref={cardContainerRef}
            className="relative w-full md:w-1/2" // Added overflow-hidden 
            style={{ height: 'calc(20vw * 1.4)', minHeight: '200px' }}
          >
            {cardData.map((card, index) => (
              <WithWithoutCard
                key={index}
                card={card}
                active={index === activeCard}
                index={index}
                onClick={handleCardClick}
                isElevated={isElevated}
              />
            ))}
          </div>
          <div className="w-full md:w-1/2 mt-8 md:mt-0 md:ml-8">
            <div className="rounded-2xl border-2 border-gray-800 bg-white text-white p-6 overflow-x-hidden overflow-y-scroll relative" style={{ height: '550px' }}>
              <InlineWidget
                url={`https://calendly.com/will-feistyagency/30min?hide_gdpr_banner=1&email=${encodeURIComponent(email)}`}
                styles={{
                  height: '1000px',
                  transform: 'scale(0.9)',
                  transformOrigin: 'middle',
                  marginTop: '-380px'
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
