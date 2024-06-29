import { NextResponse } from 'next/server';
import axios from 'axios';
const apikey = `${process.env.ZENROWS_KEY}`;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const tag = searchParams.get('tag');
  if (!url || !tag) {
    return NextResponse.json({ error: 'URL and tag are required' }, { status: 400 });
  }

  const apiUrl = `https://${url}/ws.php?format=json&method=pwg.tags.getImages&tag_name=${encodeURIComponent(tag)}`;
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
  };

  console.log(`Requesting Piwigo API: ${apiUrl}`);

  try {
    const zenrowsUrl = 'https://api.zenrows.com/v1/';
    const response = await axios({
      method: 'GET',
      url: zenrowsUrl,
      params: {
        url: apiUrl,
        apikey,
        js_render: true,
        autoparse: true,
      },
    });

    console.log(`Received response from Zenrows: ${response.status}`);

    const data = response.data;
    if (!data.result || !data.result.images) {
      console.error('Invalid response structure:', data);
      return NextResponse.json({ error: 'Invalid response structure' }, { status: 500 });
    }

// console.log(data.result.images)

    const images = data.result.images.slice(0, 20).map(image => ({
      type: 'photo',
      url: image.element_url,
      caption: image.hit,
      body: image.body || '',
    }));

    // console.log(images)

    return NextResponse.json(images);
  } catch (axiosError) {
    console.error('Failed to fetch Piwigo tags:', axiosError);
    return NextResponse.json({ error: `Failed to fetch Piwigo tags: ${axiosError.message}` }, { status: 500 });
  }
}
