import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import OpponentDraggableCard from "./OpponentDraggableCard";

const OpponentsHand = ({ isHome, cardData, isOpponentSection }) => {
  const totalCards = 60;
  const visibleCards = Math.min(cardData.length, 9);
  const initialActiveIndex = Math.floor(visibleCards / 2);

  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const deckRef = useRef(null);

  useEffect(() => {
    setActiveIndex((prevIndex) =>
      Math.min(prevIndex, Math.max(0, cardData.length - 1)),
    );
  }, [cardData]);

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
        <OpponentDraggableCard
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
            zIndex: isActive ? totalCards + 1 : zIndex,
          }}
          containerRef={deckRef}
          isOpponentSection={isOpponentSection}
        />
      );
    },
    [
      visibleCards,
      visibleIndices,
      cardData,
      activeIndex,
      calculateCardPosition,
    ],
  );

  return (
    <div
      ref={deckRef}
      className="relative w-full h-full overflow-visible flex align-center justify-center"
    >
      <div className="relative">
        <AnimatePresence initial={false}>
          {Array.from({ length: totalCards }).map((_, index) =>
            renderCard(index),
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default React.memo(OpponentsHand);
