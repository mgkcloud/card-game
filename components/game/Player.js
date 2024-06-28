import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from 'react-hot-toast';
import { SessionProvider } from 'next-auth/react';
import { fetchCards } from '@/app/utils/fetchCards'; // Import the utility function

const Player = ({ children, tumblrBlogName }) => {
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
      const media = await fetchCards('tumblr', tumblrBlogName);
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
  }, [user, cardsLoaded, tumblrBlogName]);

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

  const addNewCards = async () => {
    try {
      setIsLoading(true);
      const newCards = await fetchCards('tumblr', tumblrBlogName);
      const formattedNewCards = newCards.map((item, index) => ({
        id: `new-card-${Date.now()}-${index}`,
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
    <main className='max-h-[90vh] overflow-hidden'>
      <SessionProvider session={session}>
        {children({
          user,
          visibleCards,
          deckCards,
          moveCardToDeck: handleMoveCardToDeck,
          moveCardToHand: handleMoveCardToHand,
          isLoading,
          addNewCards,
        })}
      </SessionProvider>
    </main>
  );
};

export default Player;
