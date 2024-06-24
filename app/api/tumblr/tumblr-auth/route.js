import oauth from '@/libs/oauth';
import axios from 'axios';


export async function GET(req, res) {
  if (req.method === 'GET') {
    const request_data = {
      url: 'https://www.tumblr.com/oauth/request_token',
      method: 'POST',
      data: { oauth_callback: 'http://localhost:3000/tumblr/tumblr-callback' },
    };

    try {
      const response = await axios.post(request_data.url, null, {
        headers: oauth.toHeader(oauth.authorize(request_data)),
      });

      const params = new URLSearchParams(response.data);
      const oauth_token = params.get('oauth_token');
      const oauth_token_secret = params.get('oauth_token_secret');

      res.cookie('oauth_token', oauth_token, { httpOnly: true, secure: true });
      res.cookie('oauth_token_secret', oauth_token_secret, { httpOnly: true, secure: true });
      res.redirect(`https://www.tumblr.com/oauth/authorize?oauth_token=${oauth_token}`);
    } catch (error) {
      res.status(500).json({ error: 'Failed to obtain request token' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
