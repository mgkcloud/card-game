// components/game/DealerSection.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import CardHand from './CardHand';
import DeckPreview from './DeckPreview';
import PlayingCard from './PlayingCard';
import { toast } from 'react-hot-toast';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import CardDealer from './CardDealer';

const DealerSection = ({ handCards: initialHandCards, deckCards: initialDeckCards, onMoveCardToDeck, onMoveCardToHand, user, session }) => {
  const [handCards, setHandCards] = useState(initialHandCards || []);
  const [deckCards, setDeckCards] = useState(initialDeckCards || []);
  const [draggingCard, setDraggingCard] = useState(null);
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [cardsLoaded, setCardsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

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

  const loadUserCards = useCallback(async (userId) => {
    if (cardsLoaded) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('hand, deck')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data && (data.hand || data.deck)) {
        setHandCards(data.hand || []);
        setDeckCards(data.deck || []);
        localStorage.setItem('userCards', JSON.stringify({ hand: data.hand || [], deck: data.deck || [] }));
      } else {
        await loadInitialCards();
      }
      setCardsLoaded(true);
    } catch (error) {
      console.error('Error loading user cards:', error);
      toast.error('Failed to load user cards');
    } finally {
      setIsLoading(false);
    }
  }, [cardsLoaded]);

  const loadInitialCards = useCallback(async () => {
    if (cardsLoaded) return;
    try {
      console.log("Loading initial cards...");
      const media = await fetchCards('tumblr', 'sabertoothwalrus.tumblr.com');
      console.log("Fetched initial cards:", media);
      const allCards = media.map((item, index) => ({
        id: `card-${Date.now()}-${index}`,
        title: `Media ${index + 1}`,
        color: item.background_color || 'bg-primary',
        textColor: 'text-white',
        mediaSrc: item.image_url,
        mediaType: item.type || 'photo',
        items: [item.rarity || 'common'],
        user_id: user ? user.id : null,
      }));
      const hand = allCards.slice(0, 9);
      const deck = allCards.slice(9);
      setHandCards(hand);
      setDeckCards(deck);
      if (user) {
        await saveUserCards(user.id, hand, deck);
      }
      setCardsLoaded(true);
    } catch (error) {
      console.error('Error loading initial cards:', error);
      toast.error('Failed to load initial cards');
    } finally {
      setIsLoading(false);
    }
  }, [user, cardsLoaded]);

  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session) {
          console.log("User data:", session.user);
          setUser(session.user);
          setSession(session);
          await loadUserCards(session.user.id);
        } else {
          await loadInitialCards();
        }
      } catch (error) {
        console.error("Error checking user:", error);
        toast.error("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, [supabase.auth, loadUserCards, loadInitialCards]);

  const saveUserCards = async (userId, hand, deck) => {
    try {
      const { error } = await supabase
        .from('users')
        .upsert({ id: userId, hand, deck });

      if (error) throw error;
      console.log('Cards saved successfully');
    } catch (error) {
      console.error('Error saving user cards:', error);
      toast.error('Failed to save cards');
    }
  };

  const clearCards = useCallback(() => {
    setHandCards([]);
    setDeckCards([]);
    localStorage.removeItem('userCards'); // Add this line to clear local storage
    if (user) {
      saveUserCards(user.id, [], []);
    }
  }, [user]);

  const handleCardsLoaded = useCallback((hand, deck) => {
    setHandCards(hand);
    setDeckCards(deck);
  }, []);

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
                </div>
              )}
              <div className="flex gap-4 flex-wrap items-center">
                <CardDealer user={user} onCardsLoaded={handleCardsLoaded} />
                <button onClick={clearCards} className="btn btn-secondary">
                  Clear Cards
                </button>
              </div>
            </div>
          </header>
          <div className="w-full h-[80vh] md:h-[150vh] relative">
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
