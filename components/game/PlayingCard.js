// components/game/PlayingCard.js
import React from 'react';
import { motion } from 'framer-motion';

const MediaContent = ({ src, type }) => {
  if (type === 'video') {
    return (
      <motion.video
        className="w-full h-full rounded-lg object-cover"
        controls
        whileHover={{ scale: 0.8 }}
        transition={{ duration: 0.3 }}
        draggable="false"
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </motion.video>
    );
  }

  if (type === 'photo') {
    return (
      <div className="relative rounded-lg w-full h-full overflow-hidden">
        <motion.img
          src={src}
          alt="Card media"
          className="w-full h-full transition-all rounded-lg duration-300 object-cover"
          draggable="false"
          onDragStart={(e) => e.preventDefault()}
        />
      </div>
    );
  }

  return null;
};

const PlayingCard = ({ card, isActive, isDragging, isInDeck, isExpanded }) => {
  const baseClassName = `w-40 h-60 sm:w-48 sm:h-72 rounded-lg ${card.color} ${card.textColor}`;
  
  const variants = {
    normal: {
      scale: isActive ? 1.1 : 1,
      boxShadow: isActive 
        ? '0 0 0 3px #00BFFF, 0 0 15px #00BFFF' 
        : '0 3px 7px rgba(0,0,0,0.2)',
      opacity: isActive ? 1 : 0.7,
    },
    dragging: {
      scale: 0.7,
      boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
      opacity: 0.9,
      rotateX: 10,
      rotateY: -10,
      rotateZ: 5,
    },
    expanded: {
      scale: 0.7,
      zIndex: 50,
    }
  };

  return (
    <motion.div
      className={baseClassName}
      initial="normal"
      animate={isDragging ? "dragging" : isExpanded ? "expanded" : "normal"}
      variants={variants}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={!isExpanded ? { scale: isActive ? 1.15 : 1.05 } : { scale: isActive ? 0.7 : 0.7 }}
      whileTap={{ scale: 0.95 }}
      draggable="false"
    >
      {card.mediaSrc ? (
        <MediaContent src={card.mediaSrc} type={card.mediaType} />
      ) : (
        <div className="p-3 h-full rounded-lg flex flex-col justify-between">
          <h3 className="text-base sm:text-lg font-bold">{card.title}</h3>
          <ul className="list-none text-sm">
            {card.items.slice(0, 3).map((item, index) => (
              <li key={index} className="mb-2">{item}</li>
            ))}
          </ul>
        </div>
      )}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 text-white text-center mt-4">
          <h3 className="text-lg font-bold">{card.title}</h3>
          <ul className="list-none text-sm">
            {card.items.map((item, index) => (
              <li key={index} className="mb-2">{item}</li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default PlayingCard;
