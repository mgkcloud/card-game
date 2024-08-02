// components/game/DraggableCard.js
import React from "react";
import { motion } from "framer-motion";
import { useDraggable } from "@dnd-kit/core";
import PlayingCard from "./PlayingCard";

const DraggableCard = ({
  isHome,
  card,
  isDummy,
  isActive,
  position,
  onDragStart,
  onDragEnd,
  onMoveCardToDeck,
  containerRef,
  renderDragOverlay,
  isDeckOpen,
  onClick,
  isExpanded,
  setIsExpanded,
  isThumbnailView,
  isInDeck,
  isInRevealSection,
  isOpponentSection,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: card?.id || "dummy",
      data: { card, renderDragOverlay },
      disabled: !isDeckOpen || isInRevealSection, // Disable dragging if the deck is not open or if the card is not in the deck
    });

  const baseZIndex = 100;
  const activeZIndex = 200;
  const draggingZIndex = 10000;
  const expandedZIndex = 20000;

  const calculateScale = () => {
    if (typeof window === "undefined") {
      return 1;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const maxWidth = viewportWidth * 0.8;
    const maxHeight = viewportHeight * 0.8;
    const scaleX = maxWidth / 192;
    const scaleY = maxHeight / 288;
    return Math.min(scaleX, scaleY, 2);
  };

  const expandedScale = calculateScale();

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging
          ? draggingZIndex
          : isExpanded
            ? expandedZIndex
            : isActive
              ? activeZIndex
              : baseZIndex + position.zIndex,
        transition: isDragging ? "none" : undefined,
      }
    : {};

  const expandedStyle = isExpanded
    ? {
        transform: `scale(${expandedScale})`,
        zIndex: expandedZIndex,
      }
    : {};

  const handleHold = () => {
    if (isActive) {
      setIsExpanded(true);
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      className={`playing-card ${isActive ? "active" : ""}`}
      style={{
        ...style,
        ...expandedStyle,
        position: isInRevealSection
          ? "relative"
          : isInDeck
            ? isDragging
              ? "absolute"
              : "relative"
            : "absolute",
        opacity: isDummy ? 0 : 1,
        height: isInRevealSection ? "100%" : isInDeck ? "100%" : "unset",
        width: isInRevealSection ? "100%" : isInDeck ? "100%" : "unset",
      }}
      animate={
        isDragging
          ? {}
          : {
              ...position,
              scale: isExpanded ? expandedScale : position.scale,
              zIndex: isExpanded
                ? expandedZIndex
                : isActive
                  ? activeZIndex
                  : baseZIndex + position.zIndex,
            }
      }
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      {...attributes}
      {...listeners}
      drag={!isDummy && !isInRevealSection && !isOpponentSection} // Only allow dragging if the card is in the deck
      dragConstraints={false} // Allow dragging beyond the container when dragging
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      dragElastic={0.2}
      onClick={isOpponentSection ? undefined : onClick}
    >
      {!isDummy && card && (
        <PlayingCard
          isHome={isHome}
          card={card}
          isActive={isActive}
          isExpanded={isExpanded}
          isDragging={isDragging}
          isThumbnailView={isThumbnailView}
          isInRevealSection={isInRevealSection}
          isInDeck={isInDeck}
          isOpponentSection={isOpponentSection}
        />
      )}
    </motion.div>
  );
};

export default DraggableCard;
