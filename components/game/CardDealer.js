// components/game/CardDealer.js
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { fetchCards } from '@/app/utils/fetchCards'; // Import the utility function

const CardDealer = ({ user, onCardsLoaded }) => {
  const [tumblrUsername, setTumblrUsername] = useState('sabertoothwalrus.tumblr.com'); // Default blog name
  const supabase = createClientComponentClient();

  const handleTumblrUsernameChange = (event) => {
    setTumblrUsername(event.target.value);
  };

  const addNewCards = useCallback(async () => {
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
      const hand = allCards.slice(0, 9);
      const deck = allCards.slice(9);
      onCardsLoaded(hand, deck);
      if (user) {
        await saveUserCards(user.id, hand, deck);
      }
    } catch (error) {
      console.error('Error adding new cards:', error);
      toast.error('Failed to add new cards');
    }
  }, [tumblrUsername, user, onCardsLoaded]);

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

  return (
    <div className="flex gap-4 flex-wrap items-center">
      <input
        type="text"
        value={tumblrUsername}
        onChange={handleTumblrUsernameChange}
        placeholder="sabertoothwalrus.tumblr.com"
        className="input input-bordered mr-2"
      />
      <button onClick={addNewCards} className="btn btn-primary">
        Add New Cards
      </button>
    </div>
  );
};

export default CardDealer;
