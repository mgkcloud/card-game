// app/api/cards/route.js
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 });
// app/api/cards/route.js

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const provider = searchParams.get('provider');
  const identifier = searchParams.get('identifier');
  const tag = searchParams.get('tag') || null;

  if (!provider || !identifier) {
    return NextResponse.json({ error: 'Provider and identifier are required' }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });

  // Get the user's session
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  // Use a different cache key for authenticated and unauthenticated requests
  const cacheKey = `cards_${provider}_${identifier}_${userId || 'anon'}`;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return NextResponse.json(cachedData);
  }

  try {
    let url;
    switch (provider) {
      case 'tumblr':
        url = `/api/tumblr/tumblr-posts?blogIdentifier=${encodeURIComponent(identifier)}`;
        break;
      case 'piwigo':
        url = `/api/piwigo/tags?url=${encodeURIComponent(identifier)}&tag=${encodeURIComponent(tag)}`;
        break;
      default:
        throw new Error('Unsupported provider');
    }

    const response = await fetch(new URL(url, req.url));
    if (!response.ok) {
      throw new Error(`Error fetching posts from ${provider}: ${response.status}`);
    }

    const data = await response.json();

    // console.log(data)

    const transformedData = data.map((item, index) => ({
      image_url: item.url,
      background_color: getRandomColor(),
      rarity: calculateRarity(item),
      user_id: userId || null,
    }));

    if (userId) {
      // Store the transformed data in Supabase only for authenticated users
      const { error } = await supabase.from("cards").upsert(transformedData);
      if (error) {
        console.error('Error storing cards in Supabase:', error);
      }
    }

    // For both authenticated and unauthenticated users, cache and return the transformed data
    cache.set(cacheKey, transformedData);
    return NextResponse.json(transformedData);
  } catch (error) {
    console.error(`Error handling cards request:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


function getRandomColor() {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function calculateRarity(item) {
  const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  return rarities[Math.floor(Math.random() * rarities.length)];
}
