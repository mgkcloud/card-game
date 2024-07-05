import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import { DndContext } from '@dnd-kit/core';
import CardHand from './CardHand';
import DeckPreview from './DeckPreview';
import CardDealer from './CardDealer';
import CardRevealSection from './CardRevealSection';

const DealerSection = ({ handCards, deckCards, onMoveCardToDeck, onMoveCardToHand, user, session, onDragStart, visibleCards, setVisibleCards, setDeckCards, sendMessage, messages }) => {
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [revealedCards, setRevealedCards] = useState(Array(6).fill(null));
  const [tumblrUsername, setTumblrUsername] = useState('sabertoothwalrus.tumblr.com');
  const [tag, setTag] = useState('');
  const [caseSelector, setCaseSelector] = useState('tumblr');
  const targetElementRef = useRef(null);

  const handleMoveCardToHand = useCallback((card) => {
    onMoveCardToHand(card);
    setDeckCards((prevDeckCards) => prevDeckCards.filter((c) => c.id !== card.id));
  }, [onMoveCardToHand, setDeckCards]);

  const handleCardReveal = useCallback((card) => {
    console.log('Revealing card:', card);
    setRevealedCards((prev) => {
      const emptyIndex = prev.findIndex((c) => c === null);
      if (emptyIndex !== -1) {
        const newRevealedCards = [...prev];
        newRevealedCards[emptyIndex] = card;
        console.log('Updated revealedCards:', newRevealedCards);
        return newRevealedCards;
      }
      return prev;
    });
    setVisibleCards((prev) => prev.filter((c) => c.id !== card.id));
  }, [setVisibleCards]);

  const handleDragEnd = useCallback((event) => {
    console.log('Drag end event:', event);
    const { active, over } = event;

    if (over && over.id === 'card-reveal-section') {
      const draggedCard = handCards.find(card => card.id === active.id);
      if (draggedCard) {
        console.log('Dragged card to reveal section:', draggedCard);
        handleCardReveal(draggedCard);
      }
    } else if (over && over.id === 'deck-preview') {
      const draggedCard = handCards.find(card => card.id === active.id);
      if (draggedCard) {
        onMoveCardToDeck(draggedCard);
      }
    }
  }, [handCards, handleCardReveal, onMoveCardToDeck]);

  useEffect(() => {
    if (targetElementRef.current) {
      disableBodyScroll(targetElementRef.current);
    }
    return () => {
      clearAllBodyScrollLocks();
    };
  }, []);

  const memoizedCardHand = useMemo(() => (
    <CardHand
      cardData={handCards}
      onSwipeDown={onMoveCardToDeck}
      onMoveCardToDeck={onMoveCardToDeck}
      isDeckOpen={isDeckOpen}
      onCardReveal={handleCardReveal}
    />
  ), [handCards, onMoveCardToDeck, isDeckOpen]);

  const memoizedDeckPreview = useMemo(() => (
    <DeckPreview
      deckCards={deckCards}
      onMoveCardToHand={handleMoveCardToHand}
      isDeckOpen={isDeckOpen}
      setIsDeckOpen={setIsDeckOpen}
      tumblrUsername={tumblrUsername}
      setTumblrUsername={setTumblrUsername}
      tag={tag}
      setTag={setTag}
      caseSelector={caseSelector}
      setCaseSelector={setCaseSelector}
      setVisibleCards={setVisibleCards}
      setDeckCards={setDeckCards}
      visibleCards={visibleCards}
      user={user}
    />
  ), [deckCards, handleMoveCardToHand, isDeckOpen, tumblrUsername, tag, caseSelector, visibleCards, user, setVisibleCards, setDeckCards]);

  return (
    <DndContext onDragStart={onDragStart} onDragEnd={handleDragEnd}>
      <section ref={targetElementRef} className="bg-neutral text-neutral-content">
        <CardDealer
          user={user}
          setVisibleCards={setVisibleCards}
          setDeckCards={setDeckCards}
          sendMessage={sendMessage}
          tumblrUsername={tumblrUsername}
          setTumblrUsername={setTumblrUsername}
          tag={tag}
          setTag={setTag}
          caseSelector={caseSelector}
          setCaseSelector={setCaseSelector}
        />
        <CardRevealSection revealedCards={revealedCards} onCardReveal={handleCardReveal} />
        <div className="w-full h-[145vh] sm:h-[180vh] md:h-[220vh] relative" >

          {memoizedCardHand}

        </div>
        {memoizedDeckPreview}
      </section>
    </DndContext>
  );
};

export default DealerSection;
