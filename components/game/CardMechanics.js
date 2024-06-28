// components/game/CardMechanics.js
import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const CardMechanics = ({ user, children, onAddNewCards, onClearCards }) => {
  const [handCards, setHandCards] = useState([]);
  const [deckCards, setDeckCards] = useState([]);
  const [draggingCard, setDraggingCard] = useState(null);

  const supabase = createClientComponentClient();

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
  }, [handleMoveCardToHand]);
  

  const handleMoveCardToDeck = useCallback((card) => {
    setDeckCards(prevDeck => [...prevDeck, card]);
    setHandCards(prevHand => prevHand.filter(c => c.id !== card.id));
  }, []);

  const handleMoveCardToHand = useCallback((card) => {
    setHandCards(prevHand => {
      if (!prevHand.some(c => c.id === card.id)) {
        return [...prevHand, card];
      }
      return prevHand;
    });
    setDeckCards(prevDeck => prevDeck.filter(c => c.id !== card.id));
  }, []);

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
    if (user) {
      saveUserCards(user.id, [], []);
    }
    localStorage.removeItem('userCards');
  }, [user]);


  return (
    <div>
      {React.Children.map(children, child => {
        return React.cloneElement(child, {
          handCards,
          deckCards,
          moveCardToDeck: handleMoveCardToDeck,
          moveCardToHand: handleMoveCardToHand,
          clearCards,
          onDragStart: handleDragStart,
          onDragEnd: handleDragEnd,
          draggingCard,
          onAddNewCards,
          onClearCards,
        });
      })}
    </div>
  );
  
};

export default CardMechanics;
