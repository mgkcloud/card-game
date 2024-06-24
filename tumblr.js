import axios from 'axios';
import oauth from '@/lib/oauth';

export default async function handler(req, res) {
  const { blogIdentifier } = req.query;
  const oauth_token = req.session.oauth_token;
  const oauth_token_secret = req.session.oauth_token_secret;

  const url = `https://api.tumblr.com/v2/blog/${blogIdentifier}/posts?api_key=${process.env.NEXT_PUBLIC_TUMBLR_CONSUMER_KEY}&limit=20`;

  const request_data = {
    url,
    method: 'GET',
  };

  const headers = oauth.toHeader(oauth.authorize(request_data, {
    key: oauth_token,
    secret: oauth_token_secret,
  }));

  try {
    const response = await axios.get(url, {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });

    const data = response.data;

    if (!data.response || !data.response.posts) {
      throw new Error('Invalid response structure');
    }

    const posts = data.response.posts
      .filter(post => post.type === 'photo')
      .flatMap(post => post.photos.map(photo => ({
        url: photo.original_size.url,
        caption: post.caption,
      })));

    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching Tumblr posts:', error);
    res.status(500).json({ error: 'Failed to fetch Tumblr posts' });
  }
}
