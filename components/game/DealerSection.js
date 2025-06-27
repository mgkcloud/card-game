import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import { DndContext, DragOverlay, useSensor, TouchSensor } from '@dnd-kit/core';
import CardHand from './CardHand';
import DeckPreview from './DeckPreview';
import CardDealer from './CardDealer';
import CardRevealSection from './CardRevealSection';
import DraggableCard from './DraggableCard';

const DealerSection = ({ handCards, deckCards, onMoveCardToDeck, onMoveCardToHand, user, session, onDragStart, visibleCards, setVisibleCards, setDeckCards, sendMessage, messages }) => {
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [revealedCards, setRevealedCards] = useState([]);
  const [tumblrUsername, setTumblrUsername] = useState('sabertoothwalrus.tumblr.com');
  const [tag, setTag] = useState('');
  const [prompt, setPrompt] = useState('');
  const [caseSelector, setCaseSelector] = useState('tumblr');
  const [activeCard, setActiveCard] = useState(null);
  const targetElementRef = useRef(null);

  const handleMoveCardToHand = useCallback((card) => {
    onMoveCardToHand(card);
    setDeckCards((prevDeckCards) => prevDeckCards.filter((c) => c.id !== card.id));
  }, [onMoveCardToHand, setDeckCards]);

  const handleCardReveal = useCallback((card) => {
    console.log('Revealing card:', card);
    setRevealedCards((prev) => {
      const newRevealedCards = [...prev, card];
      console.log('Updated revealedCards:', newRevealedCards);
      return newRevealedCards;
    });
    setVisibleCards((prev) => prev.filter((c) => c.id !== card.id));
  }, [setVisibleCards]);

  const handleDragEnd = useCallback((event) => {
    setActiveCard(null);
    console.log('Drag end event:', event);
    const { active, over } = event;

    // Check if the dragged card is from the deck
    const draggedFromDeck = deckCards.find(card => card.id === active.id);
    const draggedFromHand = handCards.find(card => card.id === active.id);

    if (over && over.id === 'card-reveal-section') {
      if (draggedFromHand) {
        console.log('Dragged card to reveal section:', draggedFromHand);
        handleCardReveal(draggedFromHand);
      } else if (draggedFromDeck) {
        console.log('Dragged deck card to reveal section:', draggedFromDeck);
        handleCardReveal(draggedFromDeck);
        setDeckCards((prevDeckCards) => prevDeckCards.filter((c) => c.id !== draggedFromDeck.id));
      }
    } else if (over && over.id === 'deck-preview') {
      if (draggedFromHand) {
        onMoveCardToDeck(draggedFromHand);
      }
    } else {
      // Handle cards dragged from deck without specific drop target (move to hand)
      if (draggedFromDeck) {
        console.log('Moving deck card to hand:', draggedFromDeck);
        handleMoveCardToHand(draggedFromDeck);
      }
    }
  }, [handCards, deckCards, handleCardReveal, onMoveCardToDeck, handleMoveCardToHand]);

  const handleDragStart = useCallback((event) => {
    const draggedCard = deckCards.find(card => card.id === event.active.id) || 
                       handCards.find(card => card.id === event.active.id);
    setActiveCard(draggedCard);
    if (onDragStart) onDragStart(event);
  }, [deckCards, handCards, onDragStart]);

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
    <DndContext 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
      sensors={[
        useSensor(TouchSensor, {
          activationConstraint: {
            delay: 250,
            tolerance: 5
          }
        })
      ]}
    >
      <section ref={targetElementRef} className="bg-neutral text-neutral-content" style={{ overflow: 'visible' }}>
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
          prompt={prompt}
          setPrompt={setPrompt}
        />
        <CardRevealSection revealedCards={revealedCards} onCardReveal={handleCardReveal} />
        <div className="w-full h-[145vh] sm:h-[180vh] md:h-[220vh] relative" >

          {memoizedCardHand}

        </div>
        {memoizedDeckPreview}
        <DragOverlay style={{ zIndex: 50000 }}>
          {activeCard ? (
            <DraggableCard
              card={activeCard}
              isDummy={false}
              isActive={false}
              position={{ x: 0, y: 0, rotate: 0, scale: 1, zIndex: 1 }}
              onDragStart={() => {}}
              onDragEnd={() => {}}
              onMoveCardToDeck={() => {}}
              containerRef={false}
              renderDragOverlay={null}
              isDeckOpen={true}
              dragConstraints={false}
              onClick={() => {}}
              isExpanded={false}
              setIsExpanded={() => {}}
              isThumbnailView={false}
              isInDeck={true}
              isInRevealSection={false}
            />
          ) : null}
        </DragOverlay>
      </section>
    </DndContext>
  );
};

export default DealerSection;
