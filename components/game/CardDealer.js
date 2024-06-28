// components/game/CardDealer.js
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { fetchCards } from '@/app/utils/fetchCards'; // Import the utility function
import TopMenu from './TopMenu';
const CardDealer = ({ user, onCardsLoaded, onAddNewCards, onClearCards }) => {
  const supabase = createClientComponentClient();

  const addNewCards = useCallback(async (tumblrUsername) => {
    if (!tumblrUsername) {
      toast.error('Please enter a Tumblr username');
      return;
    }

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
        user_id: user ? user.id : null,
      }));

      const existingCards = JSON.parse(localStorage.getItem('userCards')) || [];
      const newUniqueCards = allCards.filter(card => !existingCards.some(existingCard => existingCard.id === card.id));

      const hand = newUniqueCards.slice(0, 9);
      const deck = newUniqueCards.slice(9);

      onCardsLoaded(hand, deck);

      if (user) {
        await saveUserCards(user.id, hand, deck);
      } else {
        const updatedCards = [...existingCards, ...newUniqueCards];
        localStorage.setItem('userCards', JSON.stringify(updatedCards));
      }
    } catch (error) {
      console.error('Error adding new cards:', error);
      toast.error('Failed to add new cards');
    }
  }, [user, onCardsLoaded]);

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
    onCardsLoaded([], []);
    if (user) {
      saveUserCards(user.id, [], []);
    }
    localStorage.removeItem('userCards');
  }, [user, onCardsLoaded]);

  return (
    <TopMenu onAddNewCards={onAddNewCards} onClearCards={onClearCards} />
  );
};

export default CardDealer;
