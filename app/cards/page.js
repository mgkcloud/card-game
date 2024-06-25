"use client"

import React, { useState, useEffect } from 'react';
import DealerSection from '@/components/game/DealerSection';
import { BubbleChat } from 'flowise-embed-react';

async function fetchCards(provider, identifier) {
  const response = await fetch(`/api/cards?provider=${provider}&identifier=${encodeURIComponent(identifier)}`);
  if (!response.ok) {
    throw new Error(`Error fetching cards: ${response.status}`);
  }
  return response.json();
}

export default function Cards() {
  const [visibleCards, setVisibleCards] = useState([]);
  const [deckCards, setDeckCards] = useState([]);

  useEffect(() => {
    async function loadMedia() {
      const blogIdentifier = 'sabertoothwalrus.tumblr.com';
      try {
        const media = await fetchCards('tumblr', blogIdentifier);
        const allCards = media.map((item, index) => ({
          id: index,
          title: `Media ${index + 1}`,
          color: 'bg-primary',
          textColor: 'text-white',
          mediaSrc: item.url,
          mediaType: item.type, // Add this line to include the media type
          items: [item.caption],
        }));
        setVisibleCards(allCards.slice(0, 9));
        setDeckCards(allCards.slice(9));
      } catch (error) {
        console.error('Error loading media:', error);
      }
    }
    loadMedia();
  }, []);

  return (
    <>
      <main className='max-h-[90vh] overflow-hidden'>
        <BubbleChat chatflowid="8ee9b276-744b-4838-b1b7-9f0561d0b65b" apiHost="http://supa.centaur-cloud.ts.net:3000" />
        <DealerSection cardData={visibleCards} />
      </main>
    </>
  );
}
