// components/game/TopMenu.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const TopMenu = ({ onAddNewCards, onClearCards }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tumblrUsername, setTumblrUsername] = useState('sabertoothwalrus.tumblr.com');

  const handleAddNewCards = () => {
    onAddNewCards(tumblrUsername);
  };

  const handleClearCards = () => {
    onClearCards();
  };

  return (
    <motion.div
      className="fixed top-0 left-0 w-full bg-gray-800"
      style={{ zIndex: 9998 }}
      animate={{ height: isOpen ? '40vh' : '6vh' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="p-4 flex flex-col items-center justify-center h-full">
        {isOpen && (
          <>
            <input
              type="text"
              value={tumblrUsername}
              onChange={(e) => setTumblrUsername(e.target.value)}
              placeholder="sabertoothwalrus.tumblr.com"
              className="input input-bordered mr-2 mb-2"
            />
            <button onClick={handleAddNewCards} className="btn btn-primary mb-2">
              Add New Cards
            </button>
            <button onClick={handleClearCards} className="btn btn-secondary">
              Clear Cards
            </button>
          </>
        )}
      </div>

      <div 
        className="w-full h-10 flex justify-center items-center cursor-pointer bg-gray-800 rounded-b-2xl"
        onClick={() => setIsOpen(!isOpen)}
        style={{ touchAction: 'none' }}
      >
        <div className="w-10 h-1 bg-gray-400 rounded-full" />
      </div>
    </motion.div>
  );
};

export default TopMenu;
