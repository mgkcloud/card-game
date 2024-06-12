import React, { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

const PlayingCard = ({ card }) => {
  const [isElevated, setIsElevated] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0, rotateZ: 0 });

  const [{ x, y, rotateZ }, api] = useSpring(() => ({
    x: position.x,
    y: position.y,
    rotateZ: position.rotateZ,
    config: { tension: 300, friction: 30 },
  }));

  const bind = useDrag(
    ({ down, movement: [mx, my], direction: [dx], velocity, swipe: [swipeX, swipeY] }) => {
      const trigger = velocity > 0.2;
      const dir = dx > 0 ? 1 : -1; // Direction should either point left or right

      if (!down && trigger) {
        if (swipeX) {
          const newX = swipeX > 0 ? 1000 : -1000;
          setPosition({ x: newX, y: 0, rotateZ: dir * 45 });
        } else if (swipeY > 0) {
          setIsElevated(!isElevated);
        }
        api.start({ x: 0, y: 0, rotateZ: 0 });
      } else {
        api.start({ x: down ? mx : 0, y: down ? my : 0, rotateZ: down ? mx / 10 : 0 });
      }
    },
    { axis: 'xy', filterTaps: true }
  );

  return (
    <animated.div
      {...bind()}
      style={{
        x,
        y,
        rotateZ,
        zIndex: 10,
        cursor: 'pointer',
        userSelect: 'none',
      }}
      className={`absolute inset-0 transform transition-transform duration-300 ease-in-out
        ${isElevated ? '-translate-y-48 md:-translate-y-0' : ''}
      `}
    >
      <div className={`relative w-full h-full p-6 rounded-lg`}>
        <div
          className={`absolute -top-12 md:top-0 rounded-2xl border-2 border-gray-800
            ${card.color} ${card.textColor} transform transition-transform
            duration-300 ease-in-out
            w-[80%]`}
        >
          <div className="pb-[140%]"> {/* Aspect ratio: 1:1.4 */}
            <div className="p-6 py-8 absolute top-0 left-0 w-full h-full font-extrabold text-l tracking-tight">
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
    </animated.div>
  );
};

export default PlayingCard;
