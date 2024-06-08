// components/WithWithoutCard.js

import React, { useRef, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';

const WithWithoutCard = ({ card, active, index, handleSwipe }) => {
  const cardRef = useRef(null);

  const swipeableHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe((index + 1) % 2),
    onSwipedRight: () => handleSwipe((index - 1 + 2) % 2),
    trackMouse: true,
  });

  useEffect(() => {
    const bumpInterval = setInterval(() => {
      if (cardRef.current) {
        cardRef.current.style.transform = `translateY(${Math.random() * 6 - 3}px) rotate(${Math.random() * 2 - 1}deg)`;
      }
    }, 150);
    return () => clearInterval(bumpInterval);
  }, [active]);

  return (
    <div
      key={index}
      className={`absolute rounded-2xl border-2 border-gray-800
        ${card.color} ${card.textColor} transform transition-transform
        duration-300 ease-in-out
        ${active ? 'z-10 scale-100' : 'scale-95'}
        ${!active && 'opacity-80'}
         w-[80%]`}
      style={{
        userSelect: 'none',
        transform: active ? 'rotate(-5deg)' : 'none',
        top: 0,
        left: 0,
      }}
      {...swipeableHandlers}
    >
      <div className="pb-[140%]"> {/* Aspect ratio: 1:1.4 */}
        <div className="p-6 py-8 absolute top-0 left-0 w-full h-full font-extrabold text-xl tracking-tight"> {/* Added wrapper div for absolute positioning and full width/height */}
        <h3 className="text-2xl font-bold mb-2 opacity-60 pb-4">{card.title}</h3>
        <ul className="list-none">
          {card.items.map((item, itemIndex) => (
            <li key={itemIndex} className="text-l pb-5">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
    </div>
  );
};

export default WithWithoutCard;
