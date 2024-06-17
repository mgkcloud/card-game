import React, { useState, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

const MediaContent = ({ src }) => {
  const isVideo = /\.(mp4|webm|ogg)$/i.test(src);
  const isImage = /\.(jpeg|jpg|gif|png|gifv)$/i.test(src);

  if (isVideo) {
    return (
      <video className="w-full h-full object-cover" controls>
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  }

  if (isImage) {
    return <img src={src} alt="Card media" className="w-full h-full object-cover" />;
  }

  return null;
};

const PlayingCard = ({ card, index, totalCards, isActive, onSwipe }) => {
  const [isElevated, setIsElevated] = useState(false);
  const cardRef = useRef(null); // Ref to track the card element

  // Spring animation for card position
  const [{ x, y, rotateZ, scale }, api] = useSpring(() => ({
    x: 0,
    y: isActive ? -50 : 0,
    rotateZ: 0,
    scale: isActive ? 1.1 : 1,
    config: { tension: 300, friction: 30 },
  }));

  // Function to handle both swipe and drag end
  const handleInteractionEnd = (velocity) => {
    // Check if velocity is sufficient for a swipe
    if (Math.abs(velocity) > 0.5) {
      onSwipe(velocity > 0 ? 'right' : 'left');
    }
  };

  // Gesture handling for touch swipe
  const bindSwipe = useDrag(({ swipe: [swipeX], velocity }) => {
    if (swipeX !== 0 && isActive) {
      handleInteractionEnd(velocity);
    }
  }, { axis: 'x', filterTaps: true, threshold: 50 });

  // Handle mouse down for drag start
  const handleMouseDown = () => {
    api.start({ scale: 1.15 }); // Slight scale up on click
  };

  // Handle mouse up for drag end (and potential card switch)
  const handleMouseUp = () => {
    api.start({ scale: isActive ? 1.1 : 1 });
    const cardElement = cardRef.current;
    if (cardElement) {
      const cardRect = cardElement.getBoundingClientRect();
      const cardCenterX = cardRect.left + cardRect.width / 2;
      const mouseX = window.event.clientX;

      // Determine swipe direction based on mouse position relative to card center
      const velocity = (mouseX - cardCenterX) / cardRect.width;
      handleInteractionEnd(velocity);
    }
  };

  // Calculate rotation based on index for fan effect
  const angle = (index - (totalCards - 1) / 2) * 5;
  const translateX = (index - (totalCards - 1) / 2) * 10;

  return (
    <animated.div
      ref={cardRef}
      {...bindSwipe()}
      style={{
        x,
        y,
        rotateZ,
        scale,
        zIndex: isActive ? 10 : 0, // Ensure active card is on top
        transform: `translateX(${translateX}px) rotate(${angle}deg)`,
      }}
      className={`absolute inset-0 transform transition-transform duration-300 ease-in-out
        ${isElevated ? '-translate-y-48 md:-translate-y-0' : ''}
      `}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className={`relative w-full h-full p-6 rounded-lg`}>
        <div
          className={`absolute -top-12 md:top-0 rounded-2xl border-2 border-gray-800
            ${card.color} ${card.textColor} transform overflow-hidden transition-transform
            duration-300 ease-in-out
            w-[80%]`}
        >
          <div className="pb-[140%]"> {/* Aspect ratio: 1:1.4 */}
            <div className="p-2 py-2 absolute overflow-hidden top-0 left-0 w-full h-full font-extrabold text-l tracking-tight">
              {/* Render MediaContent if mediaSrc is present, otherwise render text content */}
              {card.mediaSrc ? (
                <MediaContent className="rounded-2xl" src={card.mediaSrc} />
              ) : (
                <>
                  <h3 className="text-2xl font-bold mb-2 opacity-40 pb-4">{card.title}</h3>
                  <ul className="list-none">
                    {card.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-l pb-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <div className={` ${card.rank === 'high' ? 'holographic ' : ''} absolute bottom-0 left-0 w-full h-full opacity-20 flex items-center justify-center`}>



            </div>
          </div>
        </div>
      </div>
    </animated.div>
  );
};

export default PlayingCard;


