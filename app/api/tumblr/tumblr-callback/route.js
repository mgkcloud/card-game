import axios from 'axios';
import oauth from '@/libs/oauth';

export async function POST(req, res) {
  const { oauth_token, oauth_verifier } = req.query;
  const oauth_token_secret = req.session.oauth_token_secret;

  const request_data = {
    url: 'https://www.tumblr.com/oauth/access_token',
    method: 'POST',
    data: { oauth_verifier },
  };

  try {
    const response = await axios.post(request_data.url, null, {
      headers: oauth.toHeader(oauth.authorize(request_data, { key: oauth_token, secret: oauth_token_secret })),
    });

    const params = new URLSearchParams(response.data);
    const oauth_token = params.get('oauth_token');
    const oauth_token_secret = params.get('oauth_token_secret');

    // Store the oauth_token and oauth_token_secret in session or database
    req.session.oauth_token = oauth_token;
    req.session.oauth_token_secret = oauth_token_secret;

    res.redirect('/cards');
  } catch (error) {
    res.status(500).json({ error: 'Failed to obtain access token' });
  }
}
