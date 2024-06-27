// components/game/DealerSection.js
import React, { useState, useCallback } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import CardHand from './CardHand';
import DeckPreview from './DeckPreview';
import { useSession } from 'next-auth/react';

const DealerSection = ({ handCards, deckCards, onMoveCardToDeck, onMoveCardToHand, isLoading, user, addNewCards, session }) => {
  const [draggingCard, setDraggingCard] = useState(null);
  const [isDeckOpen, setIsDeckOpen] = useState(false);

  const handleDragStart = (event) => {
    setDraggingCard(event.active.data.current);
  };

  const handleDragEnd = (event) => {
    if (event.over) {
      if (event.over.id === 'deck-preview') {
        onMoveCardToDeck(event.active.data.current.card);
      } else if (event.over.id === 'card-hand') {
        onMoveCardToHand(event.active.data.current.card);
      }
    }
    setDraggingCard(null);
  };

  const renderDragOverlay = (card) => {
    return (
      <div style={{ transform: 'scale(1.05)', zIndex: 9999 }}>
        {/* This div will be styled to look like a card without using PlayingCard component */}
        <div className="w-40 h-60 sm:w-48 sm:h-72 rounded-lg bg-primary text-white p-3">
          <h3 className="text-base sm:text-lg font-bold">{card.title}</h3>
          {card.mediaSrc && (
            <img src={card.mediaSrc} alt={card.title} className="w-full h-3/4 object-cover rounded-lg mt-2" />
          )}
        </div>
      </div>
    );
  };

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
              {!session && (
                <p>Please sign in to view and save your cards.</p>
              )}
            </div>
          </header>
          <div className="w-full h-[120vh] md:h-[160vh] relative">
            <CardHand 
              cardData={handCards} 
              onSwipeDown={onMoveCardToDeck}
              onMoveCardToDeck={onMoveCardToDeck}
              renderDragOverlay={renderDragOverlay}
              isDeckOpen={isDeckOpen}
            />
          </div>
        </div>
        <DeckPreview 
          deckCards={deckCards}
          onMoveCardToHand={onMoveCardToHand}
          renderDragOverlay={renderDragOverlay}
          isDeckOpen={isDeckOpen}
          setIsDeckOpen={setIsDeckOpen}
        />
        <DragOverlay>
          {draggingCard && draggingCard.renderDragOverlay(draggingCard.card)}
        </DragOverlay>
      </section>
    </DndContext>
  );
};

export default DealerSection;
