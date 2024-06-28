// components/game/Player.js
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from 'react-hot-toast';
import DealerSection from './DealerSection';
import { SessionProvider } from 'next-auth/react';

const Player = ({ children, tumblrUsername }) => {
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
      } else {
        await loadInitialCards();
      }
      setCardsLoaded(true);
    } catch (error) {
      console.error('Error loading user cards:', error);
      toast.error('Failed to load user cards');
    }
  }, [cardsLoaded]);
  const loadInitialCards = useCallback(async () => {
    if (cardsLoaded) return;
    try {
      console.log("Loading initial cards...");
      const media = await fetchCards('tumblr', tumblrUsername);
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
      setVisibleCards(hand);
      setDeckCards(deck);
      if (user) {
        await saveUserCards(user.id, hand, deck);
      }
      setCardsLoaded(true);
    } catch (error) {
      console.error('Error loading initial cards:', error);
      toast.error('Failed to load initial cards');
    }
  }, [user, cardsLoaded, tumblrUsername]);
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

  const moveCardToDeck = useCallback((card) => {
    setVisibleCards(prev => {
      const newHand = prev.filter(c => c.id !== card.id);
      setDeckCards(prevDeck => {
        if (prevDeck.some(c => c.id === card.id)) {
          return prevDeck; // Card already in deck, do nothing
        }
        const newDeck = [...prevDeck, card];
        if (user) {
          saveUserCards(user.id, newHand, newDeck);
        }
        return newDeck;
      });
      return newHand;
    });
  }, [user]);

  const moveCardToHand = useCallback((card) => {
    setDeckCards(prev => {
      const newDeck = prev.filter(c => c.id !== card.id);
      setVisibleCards(prevHand => {
        if (prevHand.some(c => c.id === card.id)) {
          return prevHand; // Card already in hand, do nothing
        }
        const newHand = [...prevHand, card];
        if (user) {
          saveUserCards(user.id, newHand, newDeck);
        }
        // Ensure hand size after adding a card
        if (newHand.length > 9) {
          const overflowCard = newHand.shift(); // Remove the first card
          setDeckCards(prevDeck => [...prevDeck, overflowCard]);
        }
        return newHand;
      });
      return newDeck;
    });
  }, [user]);

  const ensureHandSize = useCallback(async (hand, deck) => {
    const newHand = [...hand];
    const newDeck = [...deck];
    while (newHand.length < 9 && newDeck.length > 0) {
      newHand.push(newDeck.shift());
    }
    setVisibleCards(newHand);
    setDeckCards(newDeck);
    if (user) {
      await saveUserCards(user.id, newHand, newDeck);
    }
    return { newHand, newDeck };
  }, [user]);

  const addNewCards = async () => {
    try {
      setIsLoading(true);
      const newCards = await fetchCards('tumblr', tumblrUsername);
      const formattedNewCards = newCards.map((item, index) => ({
        id: `new-card-${Date.now()}-${index}`, // Add a unique id
        title: `New Media ${index + 1}`,
        color: item.background_color || 'bg-primary',
        textColor: 'text-white',
        mediaSrc: item.image_url,
        mediaType: item.type || 'photo',
        items: [item.rarity || 'common'],
        user_id: user ? user.id : null,
      }));
      const updatedDeckCards = [...deckCards, ...formattedNewCards];
      setDeckCards(updatedDeckCards);
      if (user) {
        await saveUserCards(user.id, visibleCards, updatedDeckCards);
        toast.success('New cards added to your deck!');
      }
    } catch (error) {
      console.error('Error adding new cards:', error);
      toast.error('Failed to add new cards');
    } finally {
      setIsLoading(false);
    }
  };

  const memoizedDealerSection = useMemo(() => (
    <DealerSection
      handCards={visibleCards}
      deckCards={deckCards}
      onMoveCardToDeck={moveCardToDeck}
      onMoveCardToHand={moveCardToHand}
      isLoading={isLoading}
      user={user}
      addNewCards={addNewCards}
      session={session}
    />
  ), [visibleCards, deckCards, moveCardToDeck, moveCardToHand, isLoading, user, addNewCards, session]);

  return (
    <main className='max-h-[90vh] overflow-hidden'>
      <SessionProvider session={session}>
        {memoizedDealerSection}
      </SessionProvider>
    </main>
  );
};

export default Player;

async function fetchCards(provider, identifier) {
  console.log(`Fetching cards for ${provider}: ${identifier}`);
  const response = await fetch(`/api/cards?provider=${provider}&identifier=${encodeURIComponent(identifier)}`);
  if (!response.ok) {
    throw new Error(`Error fetching cards: ${response.status}`);
  }
  const data = await response.json();
  console.log("Fetched cards data:", data);
  return data;
}
