// app/cards/page.js
"use client";
import React from "react";
import Player from "@/components/game/Player";
import DealerSection from "@/components/game/DealerSection";

export default function Table({ params }) {
  return (
    <Player>
      {({
        user,
        visibleCards,
        deckCards,
        moveCardToDeck,
        moveCardToHand,
        isLoading,
        onAddNewCards,
        onClearCards,
        setVisibleCards,
        setDeckCards,
        onClearHand,
      }) => (
        <>
          <DealerSection
            user={user}
            title={params.title}
            className="max-h-[100%]"
            handCards={visibleCards}
            deckCards={deckCards}
            onMoveCardToDeck={moveCardToDeck}
            onMoveCardToHand={moveCardToHand}
            isLoading={isLoading}
            onAddNewCards={onAddNewCards}
            onClearCards={onClearCards}
            setVisibleCards={setVisibleCards}
            visibleCards={visibleCards}
            setDeckCards={setDeckCards}
            onClearHand={onClearHand}
          />
        </>
      )}
    </Player>
  );
}
