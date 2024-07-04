import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

import { DndContext, DragOverlay } from '@dnd-kit/core';

import CardHand from './CardHand';
import DeckPreview from './DeckPreview';
import CardDealer from './CardDealer';

const DealerSection = ({ handCards, deckCards, onMoveCardToDeck, onMoveCardToHand, user, session, onDragStart, onDragEnd, draggingCard, onAddNewCards, onClearCards, setVisibleCards, setDeckCards, onClearHand, sendMessage, messages }) => {
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const targetElementRef = useRef(null);

  const handleCardsLoaded = useCallback((hand, deck) => {
    onMoveCardToHand(hand);
    onMoveCardToDeck(deck);
  }, [onMoveCardToHand, onMoveCardToDeck]);

  const memoizedCardHand = useMemo(() => (
    <CardHand
      className="mt-auto"
      cardData={handCards}
      onSwipeDown={onMoveCardToDeck}
      onMoveCardToDeck={onMoveCardToDeck}
      isDeckOpen={isDeckOpen}
    />
  ), [handCards, onMoveCardToDeck, isDeckOpen]);

  const memoizedDeckPreview = useMemo(() => (
    <DeckPreview
      deckCards={deckCards}
      onMoveCardToHand={onMoveCardToHand}
      isDeckOpen={isDeckOpen}
      setIsDeckOpen={setIsDeckOpen}
    />
  ), [deckCards, onMoveCardToHand, isDeckOpen]);

  useEffect(() => {
    if (targetElementRef.current) {
      disableBodyScroll(targetElementRef.current);
    }
    return () => {
      clearAllBodyScrollLocks();
    };
  }, []);

  return (
    <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <section ref={targetElementRef} className="bg-neutral text-neutral-content">
        <CardDealer
          user={user}
          setVisibleCards={setVisibleCards}
          setDeckCards={setDeckCards}
          onClearHand={onClearHand}
          sendMessage={sendMessage}
        />
        <div className="w-full h-[160vh] sm:h-[180vh] md:h-[220vh] relative" >
          {memoizedCardHand}
        </div>
        {memoizedDeckPreview}

      </section>
    </DndContext>
  );
};

export default DealerSection;
