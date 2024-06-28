// components/game/DealerSection.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import CardHand from './CardHand';
import DeckPreview from './DeckPreview';
import PlayingCard from './PlayingCard';

const DealerSection = ({ handCards: initialHandCards, deckCards: initialDeckCards, onMoveCardToDeck, onMoveCardToHand, isLoading, user, addNewCards, session }) => {
  const [handCards, setHandCards] = useState(initialHandCards || []);
  const [deckCards, setDeckCards] = useState(initialDeckCards || []);
  const [draggingCard, setDraggingCard] = useState(null);
  const [isDeckOpen, setIsDeckOpen] = useState(false);

  useEffect(() => {
    console.log("Initial handCards:", initialHandCards);
    console.log("Initial deckCards:", initialDeckCards);
    setHandCards(initialHandCards || []);
    setDeckCards(initialDeckCards || []);
  }, [initialHandCards, initialDeckCards]);

  const handleDragStart = useCallback((event) => {
    setDraggingCard(event.active.data.current);
  }, []);

  const handleDragEnd = useCallback((event) => {
    if (event.over) {
      if (event.over.id === 'card-hand') {
        handleMoveCardToHand(event.active.data.current.card);
      } else if (event.over.id === 'deck-preview') {
        // Card was dragged back to the deck, do nothing
      }
    }
    setDraggingCard(null);
  }, []);

  const handleMoveCardToHand = useCallback((card) => {
    setHandCards(prevHand => {
      if (!prevHand.some(c => c.id === card.id)) {
        return [...prevHand, card];
      }
      return prevHand;
    });
    setDeckCards(prevDeck => prevDeck.filter(c => c.id !== card.id));
    onMoveCardToHand(card);
  }, [onMoveCardToHand]);

  const handleMoveCardToDeck = useCallback((card) => {
    setDeckCards(prevDeck => [...prevDeck, card]);
    setHandCards(prevHand => prevHand.filter(c => c.id !== card.id));
    onMoveCardToDeck(card);
  }, [onMoveCardToDeck]);

  const memoizedCardHand = useMemo(() => (
    <CardHand
      cardData={handCards}
      onSwipeDown={handleMoveCardToDeck}
      onMoveCardToDeck={handleMoveCardToDeck}
      isDeckOpen={isDeckOpen}
    />
  ), [handCards, handleMoveCardToDeck, isDeckOpen]);

  const memoizedDeckPreview = useMemo(() => (
    <DeckPreview
      deckCards={deckCards}
      onMoveCardToHand={handleMoveCardToHand}
      isDeckOpen={isDeckOpen}
      setIsDeckOpen={setIsDeckOpen}
    />
  ), [deckCards, handleMoveCardToHand, isDeckOpen]);

  console.log("Rendering DealerSection with handCards:", handCards);
  console.log("Rendering DealerSection with deckCards:", deckCards);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <section className="bg-neutral text-neutral-content relative min-h-screen overflow-hidden">
        <div className="relative hero-overlay bg-opacity-90"></div>
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center h-full">
          <header className="bg-neutral text-neutral-content w-full px-4 py-2 mb-4 rounded-lg">
            <div className="flex items-center justify-between">
              {session && (
                <div className="flex items-center">
                  <p className="mr-4">Welcome, {session.user.email}!</p>
                  <button onClick={addNewCards} className="btn btn-primary">
                    Add New Cards
                  </button>
                </div>
              )}
              {!session && <br />}
            </div>
          </header>
          <div className="w-full h-[100vh] md:h-[140vh] relative">
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
