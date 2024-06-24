"use client"

import React, { useState, useEffect } from 'react';
import DealerSection from '@/components/game/DealerSection';
import { BubbleChat } from 'flowise-embed-react';
import apiClient from "@/libs/api";

async function fetchTumblrPosts(blogIdentifier) {
  const response = await fetch(`/api/tumblr/tumblr-posts?blogIdentifier=${encodeURIComponent(blogIdentifier)}`);
  if (!response.ok) {
    throw new Error(`Error fetching Tumblr posts: ${response.status}`);
  }
  return response.json();
}

export default function Cards() {
  const [cardData, setCardData] = useState([]);

  useEffect(() => {
    async function loadImages() {
      const blogIdentifier = 'sabertoothwalrus.tumblr.com'; // Replace with the desired Tumblr blog

      try {
        const images = await fetchTumblrPosts(blogIdentifier);

        const newCardData = images.map((image, index) => ({
          title: `Image ${index + 1}`,
          color: 'bg-primary',
          textColor: 'text-white',
          mediaSrc: image.url,
          items: [image.caption], // Using the post caption as an item
        }));

        setCardData(newCardData);
      } catch (error) {
        console.error('Error loading images:', error);
      }
    }

    loadImages();
  }, []);

  return (
    <>
      <main>
        <BubbleChat chatflowid="8ee9b276-744b-4838-b1b7-9f0561d0b65b" apiHost="http://supa.centaur-cloud.ts.net:3000" />
        <DealerSection cardData={cardData} />
      </main>
    </>
  );
}
