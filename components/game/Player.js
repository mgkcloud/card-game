// components/game/Player.js
import React, { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from 'react-hot-toast';
import { fetchCards } from '@/app/utils/fetchCards';

const Player = ({ children, onAddNewCards, onClearCards }) => {
  const [user, setUser] = useState(null);
  const [visibleCards, setVisibleCards] = useState([]);
  const [deckCards, setDeckCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cardsLoaded, setCardsLoaded] = useState(false);
  const supabase = createClientComponentClient();
  const [session, setSession] = useState(null);

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
        setVisibleCards(data.hand || []);
        setDeckCards(data.deck || []);
        localStorage.setItem('userCards', JSON.stringify({ hand: data.hand || [], deck: data.deck || [] }));
        setCardsLoaded(true);
      } else {
        await loadInitialCards();
      }
    } catch (error) {
      console.error('Error loading user cards:', error);
      toast.error('Failed to load user cards');
    }
  }, [cardsLoaded]);

  const loadInitialCards = useCallback(async () => {
    if (cardsLoaded) return;
    try {
      const media = await fetchCards('tumblr', 'sabertoothwalrus.tumblr.com');
      const allCards = media.map((item, index) => ({
        id: `card-${Date.now()}-${index}`,
        title: `Media ${index + 1}`,
        color: item.background_color || 'bg-primary',
        textColor: 'text-white',
        mediaSrc: item.image_url,
        mediaType: item.type || 'photo',
        items: [item.rarity || 'common'],
      }));
      const hand = allCards.slice(0, 9);
      const deck = allCards.slice(9);
      setVisibleCards(hand);
      setDeckCards(deck);
      setCardsLoaded(true);
    } catch (error) {
      console.error('Error loading initial cards:', error);
      toast.error('Failed to load initial cards');
    }
  }, [cardsLoaded]);


  const handleAddNewCards = useCallback(async (tumblrUsername) => {
    try {
      const media = await fetchCards('tumblr', tumblrUsername);
      const allCards = media.map((item, index) => ({
        id: `card-${Date.now()}-${index}`,
        title: `Media ${index + 1}`,
        color: item.background_color || 'bg-primary',
        textColor: 'text-white',
        mediaSrc: item.image_url,
        mediaType: item.type || 'photo',
        items: [item.rarity || 'common'],
      }));
      const hand = allCards.slice(0, 9);
      const deck = allCards.slice(9);
      setVisibleCards(prev => [...prev, ...hand]);
      setDeckCards(prev => [...prev, ...deck]);
      if (user) {
        await saveUserCards(user.id, [...visibleCards, ...hand], [...deckCards, ...deck]);
      }
    } catch (error) {
      console.error('Error adding new cards:', error);
      toast.error('Failed to add new cards');
    }
  }, [user, visibleCards, deckCards]);

  const handleClearCards = useCallback(() => {
    setVisibleCards([]);
    setDeckCards([]);
    if (user) {
      saveUserCards(user.id, [], []);
    }
    localStorage.removeItem('userCards');
  }, [user]);

  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session) {
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

  const handleMoveCardToDeck = useCallback((card) => {
    setDeckCards(prevDeck => [...prevDeck, card]);
    setVisibleCards(prevHand => prevHand.filter(c => c.id !== card.id));
  }, []);

  const handleMoveCardToHand = useCallback((card) => {
    setVisibleCards(prevHand => {
      if (!prevHand.some(c => c.id === card.id)) {
        return [...prevHand, card];
      }
      return prevHand;
    });
    setDeckCards(prevDeck => prevDeck.filter(c => c.id !== card.id));
  }, []);

  return (
    <main className='max-h-[100vh] overflow-hidden'>
      {children({
        user,
        visibleCards,
        deckCards,
        moveCardToDeck: handleMoveCardToDeck,
        moveCardToHand: handleMoveCardToHand,
        isLoading,
        onAddNewCards: handleAddNewCards,
        onClearCards: handleClearCards,
        setVisibleCards: setVisibleCards,
        setDeckCards: setDeckCards,
      })}
    </main>
  );
};

export default Player;
