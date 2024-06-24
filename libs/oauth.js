import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

const oauth = OAuth({
  consumer: {
    key: process.env.NEXT_PUBLIC_TUMBLR_CONSUMER_KEY,
    secret: process.env.NEXT_PUBLIC_TUMBLR_CONSUMER_SECRET,
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  },
});

export default oauth;


