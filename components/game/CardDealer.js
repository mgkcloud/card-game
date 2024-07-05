import React, { useState, useEffect, useCallback } from 'react';
// import { toast } from 'react-hot-toast';
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
// import { fetchCards } from '@/app/utils/fetchCards';
import TopMenu from './TopMenu';
import { addNewCardsForUser, clearCardsForUser, clearHandForUser } from '@/app/utils/playerTools'

const CardDealer = ({ user, setVisibleCards, setDeckCards, tumblrUsername, setTumblrUsername, caseSelector, setCaseSelector, tag, setTag }) => {
  // const supabase = createClientComponentClient();


  // Example usage of the helper functions
  const onAddNewCards = useCallback(() => {
    addNewCardsForUser(user, tumblrUsername, caseSelector, tag, setVisibleCards, setDeckCards);
  }, [user, tumblrUsername, caseSelector, tag, setVisibleCards, setDeckCards]);

  const onClearCards = useCallback(() => {
    clearCardsForUser(user, setVisibleCards, setDeckCards);
  }, [user, setVisibleCards, setDeckCards]);

  const onClearHand = useCallback(() => {
    clearHandForUser(user, setVisibleCards);
  }, [user, setVisibleCards]);


  return (
    <TopMenu
      onAddNewCards={onAddNewCards}
      onClearCards={onClearCards}
      tumblrUsername={tumblrUsername}
      setTumblrUsername={setTumblrUsername}
      tag={tag}
      setTag={setTag}
      caseSelector={caseSelector}
      setCaseSelector={setCaseSelector}
      setVisibleCards={setVisibleCards}
      setDeckCards={setDeckCards}
      onClearHand={onClearHand}
    />
  );
};

export default CardDealer;
