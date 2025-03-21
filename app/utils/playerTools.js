import { toast } from "react-hot-toast";
import { fetchCards } from "@/app/utils/fetchCards";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Helper function to add new cards for a user
export const addNewCardsForUser = async (
  user,
  tumblrUsername,
  caseSelector,
  tag,
  setVisibleCards,
  setDeckCards,
  type,
) => {
  const supabase = createClientComponentClient();

  try {
    const media = await fetchCards(caseSelector, tumblrUsername, tag);
    const allCards = media.map((item, index) => ({
      id: `card-${Date.now()}-${index}`,
      title: `Media ${index + 1}`,
      color: item.background_color || "bg-primary",
      textColor: "text-white",
      mediaSrc: item.image_url,
      mediaType: item.type || "photo",
      items: [item.rarity || "common"],
    }));
    const hand = allCards.slice(0, 9);
    let deck = allCards.slice(9);
    if (!type || type != "deck") {
      setVisibleCards((prev) => [...prev, ...hand]);
      setDeckCards((prev) => [...prev, ...deck]);
    }

    if ((type = "deck")) {
      deck = deck.slice(0, 6);
      const cards = JSON.parse(localStorage.getItem("userCards"));

      const {
        data: { session },
        err,
      } = await supabase.auth.getSession();

      if (session.user.id && !err) {
        const { error } = await supabase
          .from("users_final")
          .update({
            user_id: session.user.id,
            deck: [...deck, ...cards.deck],
          })
          .eq("user_id", session.user.id);

        if (error) {
          console.error("Error upserting data:", error);
        } else {
          setDeckCards((prev) => [...prev, ...deck]);
          console.log("Upsert successful");
          localStorage.setItem("updated_deck", [...deck, ...cards.deck]);
        }
      } else {
        console.log("invalid session");
      }
    }
  } catch (error) {
    console.error("Error adding new cards:", error);
    toast.error("Failed to add new cards");
  }
};

// Helper function to clear cards for a user
export const clearCardsForUser = (user, setVisibleCards, setDeckCards) => {
  setVisibleCards([]);
  setDeckCards([]);
  if (user) {
    // Clear user's cards in the database
    // Implement clearUserCards function as needed
  }
  localStorage.setItem("userCards", JSON.stringify({ hand: [], deck: [] }));
};

export const clearHandForUser = (user, setVisibleCards) => {
  setVisibleCards([]);
  if (user) {
    // Clear user's cards in the database
    // Implement clearUserCards function as needed
  }
};
