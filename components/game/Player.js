// components/game/Player.js
"use client";

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from 'react-hot-toast';

const Player = ({ children }) => {
  const [user, setUser] = useState(null);
  const [visibleCards, setVisibleCards] = useState([]);
  const [deckCards, setDeckCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session) {
          console.log("User data:", session.user);
          setUser(session.user);
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
        setVisibleCards(data.hand || []);
        setDeckCards(data.deck || []);
        ensureHandSize(data.hand || [], data.deck || []);
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
        user_id: user ? user.id : null, // Ensure user_id is set correctly
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
    while (hand.length < 9 && deck.length > 0) {
      hand.push(deck.shift());
    }
    setVisibleCards(hand);
    setDeckCards(deck);
    if (user) {
      await saveUserCards(user.id, hand, deck);
    }
  };

  const saveUserCards = async (userId, hand, deck) => {
    try {
      const { error } = await supabase
        .from('users')
        .upsert({ id: userId, hand, deck });

      if (error) throw error;
      toast.success('Cards saved successfully');
    } catch (error) {
      console.error('Error saving user cards:', error);
      toast.error('Failed to save cards');
    }
  };

  const moveCardToHand = async (card) => {
    if (deckCards.length > 0) {
      const updatedDeck = deckCards.filter(c => c.id !== card.id);
      const updatedHand = [...visibleCards, card];
      setDeckCards(updatedDeck);
      setVisibleCards(updatedHand);
      if (user) {
        await saveUserCards(user.id, updatedHand, updatedDeck);
      }
    }
  };

  const moveCardToDeck = async (card) => {
    const updatedHand = visibleCards.filter(c => c.id !== card.id);
    const updatedDeck = [...deckCards, card];
    setVisibleCards(updatedHand);
    setDeckCards(updatedDeck);
    if (user) {
      await saveUserCards(user.id, updatedHand, updatedDeck);
    }
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
        user_id: user ? user.id : null, // Ensure user_id is set correctly
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

  return children({
    user,
    visibleCards,
    deckCards,
    moveCardToDeck,
    moveCardToHand,
    addNewCards,
    isLoading,
  });
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
