// components/game/Player.js
"use client";

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from 'react-hot-toast';
import DealerSection from './DealerSection'; // Import DealerSection
import { SessionProvider } from 'next-auth/react'; // Import SessionProvider

const Player = ({ children }) => {
  const [user, setUser] = useState(null);
  const [visibleCards, setVisibleCards] = useState([]);
  const [deckCards, setDeckCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();
  const [session, setSession] = useState(null); // Add session state

  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session) {
          console.log("User data:", session.user);
          setUser(session.user);
          setSession(session); // Update session state
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
  }, [supabase.auth]);

  const loadUserCards = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('hand, deck')
        .eq('id', userId)
        .single();

      if (error) throw error;

      console.log("Loaded user cards:", data);
      if (data && (data.hand || data.deck)) {
        const { newHand, newDeck } = await ensureHandSize(data.hand || [], data.deck || []);
        setVisibleCards(newHand);
        setDeckCards(newDeck);
      } else {
        await loadInitialCards();
      }
    } catch (error) {
      console.error('Error loading user cards:', error);
      toast.error('Failed to load user cards');
    }
  };

  const loadInitialCards = async () => {
    try {
      console.log("Loading initial cards...");
      const media = await fetchCards('tumblr', 'sabertoothwalrus.tumblr.com');
      console.log("Fetched initial cards:", media);
      const allCards = media.map((item, index) => ({
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
    } catch (error) {
      console.error('Error loading initial cards:', error);
      toast.error('Failed to load initial cards');
    }
  };

  const ensureHandSize = async (hand, deck) => {
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
  };

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

  const moveCardToDeck = async (card) => {
    setVisibleCards(prev => {
      const newHand = prev.filter(c => c.id !== card.id);
      setDeckCards(prevDeck => {
        const newDeck = [...prevDeck, card];
        if (user) {
          saveUserCards(user.id, newHand, newDeck);
        }
        return newDeck;
      });
      
      // Ensure hand size after removing a card
      ensureHandSize(newHand, deckCards).then(({ newHand, newDeck }) => {
        setVisibleCards(newHand);
        setDeckCards(newDeck);
      });
      
      return newHand;
    });
  };

  const moveCardToHand = async (card) => {
    setDeckCards(prev => {
      const newDeck = prev.filter(c => c.id !== card.id);
      setVisibleCards(prevHand => {
        const newHand = [...prevHand, card];
        
        // Ensure hand size after adding a card
        ensureHandSize(newHand, newDeck).then(({ newHand, newDeck }) => {
          setVisibleCards(newHand);
          setDeckCards(newDeck);
        });
        
        return newHand;
      });
      
      return newDeck;
    });
  };

  const addNewCards = async () => {
    try {
      setIsLoading(true);
      const newCards = await fetchCards('tumblr', 'sabertoothwalrus.tumblr.com');
      const formattedNewCards = newCards.map((item, index) => ({
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

  // Load cards from localStorage on component mount
  useEffect(() => {
    const storedCards = localStorage.getItem('userCards');
    if (storedCards) {
      const { hand, deck } = JSON.parse(storedCards);
      setVisibleCards(hand);
      setDeckCards(deck);
    }
  }, []);

  // Save cards to localStorage whenever the state changes
  useEffect(() => {
    localStorage.setItem('userCards', JSON.stringify({ hand: visibleCards, deck: deckCards }));
  }, [visibleCards, deckCards]);

  return (
    <main className='max-h-[90vh] overflow-hidden'>
      <SessionProvider session={session}> {/* Wrap DealerSection with SessionProvider */}
        <DealerSection
        handCards={visibleCards}
        deckCards={deckCards}
        onMoveCardToDeck={moveCardToDeck}
        onMoveCardToHand={moveCardToHand}
        isLoading={isLoading}
        user={user}
        addNewCards={addNewCards}
          session={session} // Pass session prop
      />
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
