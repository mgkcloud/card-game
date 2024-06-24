import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const blogIdentifier = searchParams.get('blogIdentifier');

  const url = `https://api.tumblr.com/v2/blog/${blogIdentifier}/posts?api_key=${process.env.NEXT_PUBLIC_TUMBLR_CONSUMER_KEY}&limit=50`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (!data.response || !data.response.posts) {
      throw new Error('Invalid response structure');
    }

    const posts = data.response.posts.map(post => {
      let imageUrl = null;
      if (post.type === 'photo' && post.photos && post.photos.length > 0) {
        imageUrl = post.photos[0].original_size.url;
      } else if (post.type === 'text' && post.body) {
        const match = post.body.match(/<img.+?src=["'](.+?)["'].*?>/);
        imageUrl = match ? match[1] : null;
      }

      return {
        type: post.type,
        url: imageUrl,
        caption: post.caption || post.title || '',
        body: post.body || '',
      };
    }).filter(post => post.url !== null);
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch Tumblr posts' }, { status: 500 });
  }
}
