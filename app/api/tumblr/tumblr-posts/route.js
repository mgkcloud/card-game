// app/api/tumblr/tumblr-posts/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const blogIdentifier = searchParams.get('blogIdentifier');
  const offset = searchParams.get('offset') || 0;

  const url = `https://api.tumblr.com/v2/blog/${blogIdentifier}/posts?api_key=${process.env.NEXT_PUBLIC_TUMBLR_CONSUMER_KEY}&limit=40&offset=${offset}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (!data.response || !data.response.posts) {
      throw new Error('Invalid response structure');
    }

    const posts = data.response.posts.map(post => {
      let mediaUrl = null;
      let mediaType = null;

      if (post.type === 'photo' && post.photos && post.photos.length > 0) {
        mediaUrl = post.photos[0].original_size.url;
        mediaType = 'photo';
      } else if (post.type === 'video') {
        // Check for different video sources
        if (post.video_url) {
          mediaUrl = post.video_url;
        } else if (post.player && post.player.length > 0) {
          mediaUrl = post.player[post.player.length - 1].embed_code;
        }
        mediaType = 'video';
      } else if (post.type === 'text' && post.body) {
        const match = post.body.match(/<img.+?src=["'](.+?)["'].*?>/);
        if (match) {
          mediaUrl = match[1];
          mediaType = 'photo';
        }
      }

      return {
        type: mediaType,
        url: mediaUrl,
        caption: post.caption || post.title || '',
        body: post.body || '',
      };
    }).filter(post => post.url !== null);

    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch Tumblr posts' }, { status: 500 });
  }
}
