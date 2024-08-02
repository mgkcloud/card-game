import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const getMediaTypeFromExtension = (src) => {
  const extension = src.split(".").pop().toLowerCase();
  switch (extension) {
    case "mp4":
    case "webm":
    case "ogg":
      return "video";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "gifv":
    case "webp":
      return "photo";
    default:
      return "unknown";
  }
};

const MediaContent = ({ src, isExpanded, isActive, isOpponentSection }) => {
  const mediaType = getMediaTypeFromExtension(src);
  const [firstFrame, setFirstFrame] = useState(null);

  useEffect(() => {
    if (mediaType === "video") {
      const video = document.createElement("video");
      video.src = src;
      video.addEventListener("loadeddata", () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setFirstFrame(canvas.toDataURL());
      });
    }
  }, [src, mediaType]);

  if (mediaType === "video") {
    return (
      <div
        className={`relative rounded-lg w-full h-full ${isExpanded ? "overflow-visible" : "overflow-hidden"}`}
      >
        {firstFrame && (
          <LazyLoadImage
            src={firstFrame}
            alt="Video first frame"
            className="w-full h-full object-cover blur-md"
            effect="blur"
            style={{
              zIndex: 1,
            }}
            wrapperClassName="h-full w-full flex absolute top-0 left-0"
          />
        )}
        <motion.video
          className={`w-full h-full rounded-lg  ${isExpanded ? "object-contain" : "object-cover"}`}
          controls
          muted={!isActive}
          whileHover={{ scale: 1 }}
          transition={{ duration: 0.3 }}
          draggable="false"
        >
          <source src={src} type={`video/${src.split(".").pop()}`} />
          Your browser does not support the video tag.
        </motion.video>
      </div>
    );
  }

  if (mediaType === "photo") {
    return (
      <div
        className={`relative rounded-lg w-full h-full  ${isExpanded ? "overflow-visible" : "overflow-hidden"}`}
      >
        {isExpanded && (
          <LazyLoadImage
            src={src}
            alt="Card media background"
            className="w-full h-full m-auto object-cover blur-md"
            effect="blur"
            style={{
              zIndex: 1,
            }}
            wrapperClassName="h-full w-full flex absolute top-0 left-0"
          />
        )}
        <LazyLoadImage
          src={src}
          alt="Card media"
          className={`${isExpanded ? "w-full h-auto" : "w-full h-full"} m-auto transition-all rounded-lg duration-300 object-${isExpanded ? "contain" : "cover"}`}
          draggable="false"
          effect="blur"
          style={{
            position: isExpanded ? "absolute" : "relative", // Change to absolute when expanded
            top: isExpanded ? "50%" : "auto", // Center vertically
            left: isExpanded ? "50%" : "auto", // Center horizontally
            transform: isExpanded ? "translate(-50%, -50%)" : "none", // Center using transform
            objectFit: isExpanded ? "contain" : "cover", // Ensure the image fits within the container without cropping
            display: "flex",
            zIndex: isExpanded ? 2 : 1,
            width: isExpanded ? "30vw" : "100%", // Enlarge the image to 85% of the viewport width when expanded
            maxWidth: isExpanded ? "30vw" : "100%", // Ensure the image does not exceed 85% of the viewport width
            height: isExpanded ? "auto" : "100%", // Allow the height to adjust automatically based on the width
          }}
          wrapperClassName="h-full w-full flex"
        />
      </div>
    );
  }

  return null;
};

const PlayingCard = ({
  isHome,
  card,
  isActive,
  isDragging,
  isInDeck,
  isExpanded,
  isThumbnailView,
  isOpponentSection,
}) => {
  // const baseClassName = `w-40 h-60 sm:w-48 sm:h-72 rounded-lg ${card.color} ${card.textColor}`;
  const baseClassName = isOpponentSection
    ? `w-24 h-20 sm:w-14 sm:h-22 rounded-lg ${card.color} ${card.textColor}`
    : !isThumbnailView || isDragging
      ? `w-40 h-60 sm:w-48 sm:h-72 rounded-lg ${card.color} ${card.textColor}`
      : `w-full aspect-square rounded-lg ${card.color} ${card.textColor}`;
  const variants = {
    normal: {
      scale: isActive ? 1.1 : 1,
      boxShadow: isActive
        ? "0 0 0 3px #00BFFF, 0 0 15px #00BFFF"
        : "0 3px 7px rgba(0,0,0,0.2)",
      opacity: isActive ? 1 : 0.7,
      translateY: isInDeck || isExpanded ? "0px" : !isHome ? "130px" : "60px",
    },
    dragging: {
      scale: 0.7,
      boxShadow: "0 10px 0px rgba(0,0,0,0.3)",
      opacity: 0.9,
      rotateX: 10,
      rotateY: -10,
      rotateZ: 5,
      translateY: isInDeck || isExpanded ? "0px" : !isHome ? "130px" : "60px",
    },
    expanded: {
      scale: 0.7,
      zIndex: 50,
      translateY: isInDeck || isExpanded ? "0px" : !isHome ? "130px" : "60px",
    },
  };

  return (
    <motion.div
      className={baseClassName}
      initial="normal"
      animate={isDragging ? "dragging" : isExpanded ? "expanded" : "normal"}
      variants={variants}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      whileHover={
        !isExpanded
          ? {
              scale: isActive ? 1.15 : 1.05,
              translateY:
                isInDeck || isExpanded ? "0px" : !isHome ? "130px" : "60px",
            }
          : {
              scale: isActive ? 0.7 : 0.7,
              translateY:
                isInDeck || isExpanded ? "0px" : !isHome ? "130px" : "60px",
            }
      }
      whileTap={{
        scale: 0.95,
        translateY: isInDeck ? "0px" : !isHome ? "130px" : "60px",
      }}
      draggable="false"
    >
      <MediaContent
        src={isOpponentSection ? "https://random.jpg" : card.mediaSrc}
        isExpanded={isExpanded}
        isActive={isActive}
        isOpponentSection={isOpponentSection}
      />
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 text-white text-center mt-4">
          <h3 className="text-lg font-bold">{card.title}</h3>
          <ul className="list-none text-sm">
            {card.items.map((item, index) => (
              <li key={index} className="mb-2">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default PlayingCard;
