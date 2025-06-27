// app/api/cards/route.js
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import NodeCache from 'node-cache';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const cache = new NodeCache({ stdTTL: 600 });
// app/api/cards/route.js

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const provider = searchParams.get('provider');
  const identifier = searchParams.get('identifier');
  const tag = searchParams.get('tag') || null;
  const prompt = searchParams.get('prompt') || '';

  if (!provider) {
    return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
  }
  if (provider !== 'gnn' && !identifier) {
    if (provider !== 'bucket') {
      return NextResponse.json({ error: 'Identifier is required for this provider' }, { status: 400 });
    }
  }

  const supabase = createRouteHandlerClient({ cookies });

  // Get the user's session
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  // app/api/cards/route.js

  // Update the cache key to include the tag
  const cacheKey = `cards_${provider}_${identifier || 'none'}_${tag}_${userId || 'anon'}`;

  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return NextResponse.json(cachedData);
  }

  try {
    // Handle R2/S3 bucket directly without intermediate webhook/API
    if (provider === 'bucket') {
      try {
        const bucketName = process.env.R2_BUCKET || 'goon';
        const prefix = identifier ? `${identifier}/` : '';

        const s3 = new S3Client({
          region: 'auto',
          endpoint: process.env.R2_ENDPOINT,
          credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
          },
        });

        const listCmd = new ListObjectsV2Command({ Bucket: bucketName, Prefix: prefix, MaxKeys: 1000 });
        const listResp = await s3.send(listCmd);
        
        // Sort objects by LastModified date (newest first)
        const sortedContents = (listResp.Contents || [])
          .filter(obj => obj.Key) // Filter out invalid objects
          .sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified));
        
        const filenames = sortedContents.map(obj => obj.Key);

        const posts = filenames.map(fn => ({ url: `https://gnn.fy.studio/${fn.split('/').pop()}` }));

        const transformedData = posts.map((item) => ({
          image_url: item.url,
          background_color: getRandomColor(),
          rarity: calculateRarity(item),
          user_id: userId || null,
        }));

        if (userId) {
          const { error } = await supabase.from("cards").upsert(transformedData);
          if (error) {
            console.error('Error storing cards in Supabase:', error);
          }
        }

        cache.set(cacheKey, transformedData);
        return NextResponse.json(transformedData);
      } catch (bucketErr) {
        console.error('Error handling bucket provider:', bucketErr);
        return NextResponse.json({ error: bucketErr.message }, { status: 500 });
      }
    }

    let url;
    switch (provider) {
      case 'tumblr':
        url = `/api/tumblr/tumblr-posts?blogIdentifier=${encodeURIComponent(identifier)}`;
        break;
      case 'piwigo':
        url = `/api/piwigo/tags?url=${encodeURIComponent(identifier)}&tag=${encodeURIComponent(tag)}`;
        break;
      case 'gnn':
        url = `https://n8n.fy.studio/webhook/goongen${prompt ? `?prompt=${encodeURIComponent(prompt)}` : ''}`;
        break;
      default:
        throw new Error('Unsupported provider');
    }

    const response = await fetch(new URL(url, req.url));
    if (provider !== 'gnn' && !response.ok) {
      throw new Error(`Error fetching posts from ${provider}: ${response.status}`);
    }

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error(`Invalid JSON received from ${provider}`);
    }

    let posts;
    if (provider === 'gnn') {
      // The gnn webhook returns an array of objects with a "filename" array field. Flatten to file URLs.
      let filenames = [];
      if (Array.isArray(data)) {
        filenames = data.flatMap(obj => obj.filename || obj.imgs || []);
      } else if (data.filename) {
        filenames = data.filename;
      } else if (data.imgs) {
        filenames = data.imgs;
      }
      posts = filenames.map(fn => ({ url: `https://gnn.fy.studio/${fn}` }));
    } else {
      posts = data;
    }

    const transformedData = posts.map((item) => ({
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
