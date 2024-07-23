"use client";

import React from 'react';
import Player from '@/components/game/Player';
import DealerSection from '@/components/game/DealerSection';

export default function Cards() {


  return (
    <main className='w-[100vw] overflow-hidden bg-neutral text-neutral-content' style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
       <Player>
    {({ title, user, visibleCards, deckCards, moveCardToDeck, moveCardToHand, isLoading, onAddNewCards, onClearCards, setVisibleCards, setDeckCards, onClearHand }) => (
    <>
        <DealerSection
        title={title}
        className='max-h-[100%]'
        handCards={visibleCards}
        deckCards={deckCards}
        onMoveCardToDeck={moveCardToDeck}
        onMoveCardToHand={moveCardToHand}
        isLoading={isLoading}
        user={user}
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
    </main>
  );
}
