// app/api/piwigo/tags/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const tag = searchParams.get('tag');

  if (!url || !tag) {
    return NextResponse.json({ error: 'URL and tag are required' }, { status: 400 });
  }

  const apiUrl = `https://${url}/ws.php?format=json&method=pwg.tags.getImages&tag_name=${tag}`;

  try {
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.result || !data.result.images) {
      throw new Error('Invalid response structure');
    }

    const images = data.result.images.map(image => ({
      type: 'photo',
      url: image.element_url,
      caption: image.name || '',
      body: image.comment || '',
    }));

    return NextResponse.json(images);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch Piwigo tags' }, { status: 500 });
  }
}
