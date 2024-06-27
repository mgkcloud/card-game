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

const PlayingCard = ({ card, isActive }) => {
  return (
    <motion.div
      className={`w-40 h-60 sm:w-48 sm:h-72 rounded-lg ${card.color} ${card.textColor}`}
      initial={false}
      animate={{
        boxShadow: isActive 
          ? '0 0 0 3px #00BFFF, 0 0 15px #00BFFF' 
          : '0 3px 7px rgba(0,0,0,0.2)',
        opacity: isActive ? 1 : 0.7,
        scale: isActive ? 1.1 : 1,
      }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: isActive ? 1.15 : 1.05 }}
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
    </motion.div>
  );
};

export default PlayingCard;
