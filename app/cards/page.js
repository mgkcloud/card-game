// app/cards/page.js
"use client";

import React from 'react';
import Player from '@/components/game/Player';
import DealerSection from '@/components/game/DealerSection';
import { BubbleChat } from 'flowise-embed-react';

export default function Cards() {
  return (
    <Player>
      {({ user, visibleCards, deckCards, moveCardToDeck, moveCardToHand, isLoading, addNewCards }) => (
        <main className='max-h-[90vh] overflow-hidden'>
          <BubbleChat chatflowid="8ee9b276-744b-4838-b1b7-9f0561d0b65b" apiHost="http://supa.centaur-cloud.ts.net:3000" />
          {isLoading ? (
            <p>Loading...</p>
          ) : user ? (
            <>
              <p>Welcome, {user.email}!</p>
              <button onClick={addNewCards} className="btn btn-primary mb-4">
                Add New Cards
              </button>
              {visibleCards.length > 0 ? (
                <DealerSection 
                  handCards={visibleCards}
                  deckCards={deckCards}
                  onMoveCardToDeck={moveCardToDeck}
                  onMoveCardToHand={moveCardToHand}
                />
              ) : (
                <p>No cards available. Try refreshing the page.</p>
              )}
            </>
          ) : (
            <p>Please sign in to view and save your cards.</p>
          )}
        </main>
      )}
    </Player>
  );
}
