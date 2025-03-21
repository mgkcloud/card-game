// components/game/CardHand.js
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import DraggableCard from "./DraggableCard";

const CardHand = ({
  isHome,
  cardData,
  onSwipeDown,
  onMoveCardToDeck,
  renderDragOverlay,
  isDeckOpen,
  onCardReveal,
}) => {
  const totalCards = 60;
  const visibleCards = Math.min(cardData.length, 9);
  const initialActiveIndex = Math.floor(visibleCards / 2);

  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [expandedCard, setExpandedCard] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const deckRef = useRef(null);

  const updateContainerSize = useCallback(() => {
    if (deckRef.current) {
      const rect = deckRef.current.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    }
  }, []);

  useEffect(() => {
    updateContainerSize();
    window.addEventListener("resize", updateContainerSize);
    return () => window.removeEventListener("resize", updateContainerSize);
  }, [updateContainerSize]);

  useEffect(() => {
    setActiveIndex((prevIndex) =>
      Math.min(prevIndex, Math.max(0, cardData.length - 1)),
    );
  }, [cardData]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "ArrowDown") {
        handleRemoveCard(cardData[activeIndex]);
      }
    },
    [activeIndex, cardData],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const calculateCardPosition = useCallback(
    (index) => {
      const angleStep = (2 * Math.PI) / totalCards;
      const angle =
        ((index - initialActiveIndex + totalCards) % totalCards) * angleStep;
      const radius = Math.min(containerSize.width, containerSize.height) * 0.35;

      const x = Math.sin(angle) * radius;
      const y = -Math.cos(angle) * radius;

      return {
        x,
        y,
        rotate: (angle * 180) / Math.PI,
        scale: index === initialActiveIndex ? 1.1 : 1,
        zIndex: totalCards - Math.abs(index - initialActiveIndex),
      };
    },
    [containerSize, initialActiveIndex],
  );

  const handleRemoveCard = useCallback(
    (card) => {
      const cardElement = document.querySelector(".playing-card.active");
      if (cardElement) {
        const rect = cardElement.getBoundingClientRect();
        onSwipeDown(card, {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
        setActiveIndex((prevIndex) =>
          Math.max(
            0,
            prevIndex === cardData.length - 1 ? prevIndex - 1 : prevIndex,
          ),
        );
        setExpandedCard(null);
      }
    },
    [cardData.length, onSwipeDown],
  );

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(
    (_, info, card) => {
      setIsDragging(false);
      if (info.offset.y < -85) {
        onCardReveal(card);
      } else if (info.offset.y > 85) {
        handleRemoveCard(card);
      } else {
        const threshold = 20;
        if (Math.abs(info.offset.x) > threshold) {
          const direction = info.offset.x > 0 ? -1 : 1;
          setActiveIndex((prev) => {
            const newIndex =
              (prev + direction + cardData.length) % cardData.length;
            if (expandedCard) {
              setExpandedCard(cardData[newIndex]);
            }
            return Math.max(0, Math.min(newIndex, cardData.length - 1));
          });
        }
      }
    },
    [cardData, expandedCard, handleRemoveCard, onCardReveal],
  );

  const handleCardClick = useCallback(
    (card, index) => {
      if (!isDragging) {
        setExpandedCard((prev) => (prev ? null : card));
        setActiveIndex(index);
      }
    },
    [isDragging],
  );

  const visibleIndices = useMemo(
    () =>
      Array.from(
        { length: visibleCards },
        (_, i) =>
          (activeIndex - initialActiveIndex + i + cardData.length) %
          cardData.length,
      ),
    [activeIndex, initialActiveIndex, visibleCards, cardData.length],
  );

  const renderCard = useCallback(
    (index) => {
      const visibleIndex = index % visibleCards;
      const cardIndex = visibleIndices[visibleIndex];
      const card = cardData[cardIndex];
      const { x, y, rotate, scale, zIndex } = calculateCardPosition(index);
      const isActive = cardIndex === activeIndex;
      const isDummy = index >= visibleCards;

      return (
        <DraggableCard
          isHome={isHome}
          key={isDummy ? `dummy-${index}` : card?.id || cardIndex}
          card={card}
          isDummy={isDummy}
          isActive={isActive}
          position={{
            x,
            y,
            rotate,
            scale,
            zIndex: expandedCard
              ? isActive
                ? totalCards + 1
                : zIndex
              : zIndex,
          }}
          onDragStart={handleDragStart}
          onDragEnd={(_, info) => handleDragEnd(_, info, card)}
          onMoveCardToDeck={onMoveCardToDeck}
          containerRef={deckRef}
          renderDragOverlay={renderDragOverlay}
          isDeckOpen={isDeckOpen}
          onClick={() => handleCardClick(card, cardIndex)}
          isExpanded={expandedCard === card}
        />
      );
    },
    [
      visibleCards,
      visibleIndices,
      cardData,
      activeIndex,
      calculateCardPosition,
      expandedCard,
      handleDragStart,
      handleDragEnd,
      onMoveCardToDeck,
      renderDragOverlay,
      isDeckOpen,
      handleCardClick,
    ],
  );

  return (
    <div ref={deckRef} className="relative w-full h-full overflow-visible">
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence initial={false}>
          {Array.from({ length: totalCards }).map((_, index) =>
            renderCard(index),
          )}
        </AnimatePresence>
      </div>
      {expandedCard && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75"
          style={{ zIndex: 9999 }}
          onClick={() => handleCardClick(null, null)}
        ></div>
      )}
    </div>
  );
};

export default React.memo(CardHand);
