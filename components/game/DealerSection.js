import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import CardHand from './CardHand';
import DeckPreview from './DeckPreview';
import PlayingCard from './PlayingCard';
import CardDealer from './CardDealer';

const DealerSection = ({ handCards, deckCards, onMoveCardToDeck, onMoveCardToHand, user, session, onDragStart, onDragEnd, draggingCard, onAddNewCards, onClearCards }) => {
  const [isDeckOpen, setIsDeckOpen] = useState(false);

  const handleCardsLoaded = useCallback((hand, deck) => {
    onMoveCardToHand(hand);
    onMoveCardToDeck(deck);
  }, [onMoveCardToHand, onMoveCardToDeck]);

  const memoizedCardHand = useMemo(() => (
    <CardHand
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

  return (
    <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <section className="bg-neutral text-neutral-content relative min-h-screen overflow-hidden">
        <div className="relative hero-overlay bg-opacity-90"></div>
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center h-full">
          <header className="bg-neutral text-neutral-content w-full px-4 py-2 mb-4 rounded-lg">
            <div className="flex items-center justify-between">
              {session && (
                <div className="flex items-center">
                  <p className="mr-4">Welcome, {session.user.email}!</p>
                </div>
              )}
              <div className="flex gap-4 flex-wrap items-center">
                <CardDealer user={user} onCardsLoaded={handleCardsLoaded} onAddNewCards={onAddNewCards} onClearCards={onClearCards} />
              </div>
            </div>
          </header>
          <div className="w-full h-[100vh] md:h-[160vh] relative">
            {memoizedCardHand}
          </div>
        </div>
        {memoizedDeckPreview}
        <DragOverlay>
          {draggingCard && (
            <div style={{ zIndex: 9999 }}>
              <PlayingCard
                card={draggingCard.card}
                isActive={false}
                isDragging={true}
                isInDeck={draggingCard.isInDeck}
              />
            </div>
          )}
        </DragOverlay>
      </section>
    </DndContext>
  );
};

export default React.memo(DealerSection);
