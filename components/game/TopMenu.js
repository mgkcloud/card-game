import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const TopMenu = ({ onAddNewCards, onClearCards, onClearHand, tumblrUsername, setTumblrUsername, tag, setTag, caseSelector, setCaseSelector }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="fixed top-0 left-0 w-full bg-gray-800"
      style={{ zIndex: isOpen ? 20000 : 200 }}
      animate={{ height: isOpen ? '50vh' : '20px' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="pb-4 flex flex-col items-center justify-center h-full">
        {isOpen && (
          <>
            <input
              type="text"
              value={tumblrUsername}
              onChange={(e) => setTumblrUsername(e.target.value)}
              placeholder="sabertoothwalrus.tumblr.com"
              className="input input-bordered mr-2 mb-2"
            />
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Tag (if applicable)"
              className="input input-bordered mr-2 mb-2"
            />
            <select
              value={caseSelector}
              onChange={(e) => setCaseSelector(e.target.value)}
              className="input input-bordered mr-2 mb-2"
            >
              <option value="tumblr">Default (Tumblr)</option>
              <option value="piwigo">Piwigo</option>
              {/* Add more cases as needed */}
            </select>
            <button onClick={onAddNewCards} className="btn btn-primary mb-2">
              Add New Cards
            </button>
            <button onClick={onClearCards} className="btn btn-secondary mb-2">
              Clear Cards
            </button>
            <button onClick={onClearHand} className="btn btn-secondary">
              Clear Hand
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
