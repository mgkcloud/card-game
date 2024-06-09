import React from 'react';

const WithWithoutCard = ({ card, active, isElevated, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`absolute inset-0 transform transition-transform duration-300 ease-in-out cursor-pointer
        ${active ? '-translate-y-4 md:-translate-y-6' : 'translate-y-0'}
        ${active ? 'animate-bounce-subtle' : ''}
        ${!active ? 'rotate-[0deg]' : ''}
        ${!active ? 'animate-card-shuffle' : ''}
      `}
      style={{ zIndex: active ? 20 : 10 }}
    >
      <div className={`relative w-full h-full p-6 rounded-lg ${active ? 'rotate-[-4deg]' : ''}`}>
        <div
          className={`absolute ${active ? '-top-14 shadow-lg' : '-top-12'} md:top-0 rounded-2xl border-2 border-gray-800
            ${card.color} ${card.textColor} transform transition-transform
            ${isElevated && active ? '-translate-y-48 md:-translate-y-0' : ''}
            duration-300 ease-in-out
            w-[80%]`}
          style={{
            userSelect: 'none',
            left: 0,
          }}
        >
          <div className="pb-[140%]"> {/* Aspect ratio: 1:1.4 */}
            <div className="p-6 py-8 absolute top-0 left-0 w-full h-full font-extrabold text-l tracking-tight"> {/* Added wrapper div for absolute positioning and full width/height */}
              <h3 className="text-2xl font-bold mb-2 opacity-60 pb-4">{card.title}</h3>
              <ul className="list-none">
                {card.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-l pb-2">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithWithoutCard;
