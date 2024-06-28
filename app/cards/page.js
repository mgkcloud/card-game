// app/cards/page.js
"use client";

import React from 'react';
import Player from '@/components/game/Player';
import DealerSection from '@/components/game/DealerSection';
import { BubbleChat } from 'flowise-embed-react';

export default function Cards() {
  return (
    <main className='max-h-[90vh] overflow-hidden bg-neutral text-neutral-content'>
      <Player>
        {({ user, visibleCards, deckCards, moveCardToDeck, moveCardToHand, isLoading }) => (
          <>
            <BubbleChat chatflowid="8ee9b276-744b-4838-b1b7-9f0561d0b65b" apiHost="http://supa.centaur-cloud.ts.net:3000" />
            <DealerSection 
              handCards={visibleCards}
              deckCards={deckCards}
              onMoveCardToDeck={moveCardToDeck}
              onMoveCardToHand={moveCardToHand}
              isLoading={isLoading}
              user={user}
            />
          </>
        )}
      </Player>
    </main>
  );
}
