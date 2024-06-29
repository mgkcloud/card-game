import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { fetchCards } from '@/app/utils/fetchCards';
import TopMenu from './TopMenu';

const CardDealer = ({ user, setVisibleCards, setDeckCards  }) => {
  const supabase = createClientComponentClient();
  const [tumblrUsername, setTumblrUsername] = useState('sabertoothwalrus.tumblr.com');
  const [tag, setTag] = useState('');
  const [caseSelector, setCaseSelector] = useState('tumblr');

  const handleAddNewCards = useCallback(async () => {
    try {
      const media = await fetchCards(caseSelector, tumblrUsername, tag);
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
        // Save to database if user is logged in
        // Implement saveUserCards function as needed
      }
    } catch (error) {
      console.error('Error adding new cards:', error);
      toast.error('Failed to add new cards');
    }
  }, [user, tumblrUsername, setVisibleCards, setDeckCards]);

  const handleClearCards = useCallback(() => {
    setVisibleCards([]);
    setDeckCards([]);
    if (user) {
      // Clear user's cards in the database
      // Implement clearUserCards function as needed
    }
    localStorage.removeItem('userCards');
  }, [user, setVisibleCards, setDeckCards]);


  return (
    <TopMenu
    onAddNewCards={handleAddNewCards}
    onClearCards={handleClearCards}
      tumblrUsername={tumblrUsername}
      setTumblrUsername={setTumblrUsername}
      tag={tag}
      setTag={setTag}
      caseSelector={caseSelector}
      setCaseSelector={setCaseSelector}
      setVisibleCards={setVisibleCards}
      setDeckCards={setDeckCards} 
    />
  );
};

export default CardDealer;
