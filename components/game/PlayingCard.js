// components/game/PlayingCard.js
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const MediaContent = ({ src }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [shouldContain, setShouldContain] = useState(false);
  const imgRef = useRef(null);

  const isVideo = /\.(mp4|webm|ogg)$/i.test(src);
  const isImage = /\.(jpeg|jpg|gif|png|gifv)$/i.test(src);

  useEffect(() => {
    const checkImageFit = () => {
      if (imgRef.current) {
        const img = imgRef.current;
        const { naturalWidth, naturalHeight, clientWidth, clientHeight } = img;
        const aspectRatio = naturalWidth / naturalHeight;
        const containerAspectRatio = clientWidth / clientHeight;

        if (aspectRatio > containerAspectRatio) {
          setShouldContain(true);
        } else {
          setShouldContain(false);
        }
      }
    };

    checkImageFit();
    window.addEventListener('resize', checkImageFit);
    return () => window.removeEventListener('resize', checkImageFit);
  }, []);

  if (isVideo) {
    return (
      <motion.video
        className="w-full h-full object-cover"
        controls
        whileHover={{ scale: 0.8 }}
        transition={{ duration: 0.3 }}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </motion.video>
    );
  }

  if (isImage) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <motion.img
          ref={imgRef}
          src={src}
          alt="Card media"
          className={`w-full h-full transition-all duration-300 ${isHovered && shouldContain ? 'object-contain' : 'object-cover'}`}
          draggable="false"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          onAnimationComplete={() => {
            if (isHovered && shouldContain) {
              imgRef.current.style.objectFit = 'contain';
            } else {
              imgRef.current.style.objectFit = 'cover';
            }
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px)',
            transform: 'scale(1.2)',
            zIndex: -1,
          }}
        ></div>
      </div>
    );
  }

  return null;
};

const PlayingCard = ({ card, isActive }) => {
  return (
    <motion.div
      className={`w-40 h-60 sm:w-48 sm:h-72 rounded-lg  ${card.color} ${card.textColor}`}
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
    >
      {card.mediaSrc ? (
        <MediaContent src={card.mediaSrc} />
      ) : (
        <div className="p-3 h-full flex flex-col justify-between">
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
