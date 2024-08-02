import React, { useState, useEffect, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "react-hot-toast";
import { fetchCards } from "@/app/utils/fetchCards";
import { v4 as uuidv4 } from "uuid";

const Player = ({ children }) => {
  const [user, setUser] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [cardsLoaded, setCardsLoaded] = useState(false);
  const supabase = createClientComponentClient();
  const [session, setSession] = useState(null);

  const [visibleCards, setVisibleCards] = useState([]);
  const [deckCards, setDeckCards] = useState([]);

  const loadUserCards = useCallback(
    async (userId) => {
      if (cardsLoaded) return;
      try {
        // random cards, deck cards
        const { data, error } = await supabase
          .from("users_final")
          .select("hand, deck")
          .eq("user_id", userId)
          .single();
        if (error) throw error;
        if (data && (data.hand || data.deck)) {
          // these are random cards and wouldn't be upserted on change to deck
          const deck = data.deck.map((item, index) => ({
            id: `card-${uuidv4()}-${index}`,
            title: `Media ${index + 1}`,
            color: item.color || "bg-primary",
            textColor: "text-white",
            mediaSrc: item.mediaSrc,
            mediaType: item.type || "photo",
            items: [item.rarity || "common"],
          }));
          // these are permanent cards and wouldn't be upserted on change to hand?
          const hand = data.hand.map((item, index) => ({
            id: `card-${uuidv4()}-${index}`,
            title: `Media ${index + 1}`,
            color: item.color || "bg-primary",
            textColor: "text-white",
            mediaSrc: item.mediaSrc,
            mediaType: item.type || "photo",
            items: [item.rarity || "common"],
          }));
          setVisibleCards(hand || []);
          setDeckCards(deck || []);
          localStorage.setItem(
            "userCards",
            JSON.stringify({ hand: data.hand || [], deck: data.deck }),
          );
          setCardsLoaded(true);
        } else {
          await loadInitialCards();
        }
      } catch (error) {
        console.error("Error loading user cards:", error);
        toast.error("Failed to load user cards");
      }
    },
    [cardsLoaded, supabase],
  );

  const loadInitialCards = useCallback(async () => {
    if (cardsLoaded) return;
    try {
      const media = await fetchCards("tumblr", "sabertoothwalrus.tumblr.com");
      console.log(media);
      const allCards = media.map((item, index) => ({
        id: `card-${uuidv4()}-${index}`,
        title: `Media ${index + 1}`,
        color: item.background_color || "bg-primary",
        textColor: "text-white",
        mediaSrc: item.image_url,
        mediaType: item.type || "photo",
        items: [item.rarity || "common"],
      }));
      const hand = allCards.slice(0, 9);
      const deck = allCards.slice(9);
      setVisibleCards(hand);
      setDeckCards(deck);
      setCardsLoaded(true);
    } catch (error) {
      console.error("Error loading initial cards:", error);
      toast.error("Failed to load initial cards");
    }
  }, [cardsLoaded]);

  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true);
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
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
    setDeckCards((prevDeck) => [...prevDeck, card]);
    setVisibleCards((prevHand) => {
      const hand = prevHand.filter((c) => c.id !== card.id);
      localStorage.setItem("updated_hand", JSON.stringify({ hand }));
      return hand;
    });
  }, []);

  const handleMoveCardToHand = useCallback((card) => {
    setVisibleCards((prevHand) => {
      if (!prevHand.some((c) => c.id === card.id)) {
        localStorage.setItem(
          "updated_hand",
          JSON.stringify({ hand: [...prevHand, card] }),
        );
        return [...prevHand, card];
      }
      return prevHand;
    });
    setDeckCards((prevDeck) => prevDeck.filter((c) => c.id !== card.id));
  }, []);

  return (
    <main className="max-h-[100vh]">
      {children({
        user,
        visibleCards,
        deckCards,
        moveCardToDeck: handleMoveCardToDeck,
        moveCardToHand: handleMoveCardToHand,
        isLoading,
        setVisibleCards,
        setDeckCards,
      })}
    </main>
  );
};

export default Player;
