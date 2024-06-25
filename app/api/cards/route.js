// app/api/cards/route.js
import { NextResponse } from 'next/server';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider');
  const identifier = searchParams.get('identifier');

  if (!provider || !identifier) {
    return NextResponse.json({ error: 'Provider and identifier are required' }, { status: 400 });
  }

  const cacheKey = `cards_${provider}_${identifier}`;
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
      // Add cases for other providers here
      default:
        throw new Error('Unsupported provider');
    }

    const response = await fetch(new URL(url, request.url));
    if (!response.ok) {
      throw new Error(`Error fetching posts from ${provider}: ${response.status}`);
    }

    const data = await response.json();
    cache.set(cacheKey, data);
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error fetching posts from ${provider}:`, error);
    return NextResponse.json({ error: `Failed to fetch posts from ${provider}` }, { status: 500 });
  }
}
