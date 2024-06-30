import { NextResponse } from 'next/server';
import axios from 'axios';
import cheerio from 'cheerio';

const ZENROWS_KEY = process.env.ZENROWS_KEY;
const IMAGES_PER_ALBUM = 3;
const MAX_ALBUMS = 10;

async function piwigoCategoriesCall(url, method, params = {}) {
  const apiUrl = `https://${url}/ws.php?format=json&method=${method}`;
  const queryParams = new URLSearchParams(params).toString();
  const fullUrl = `${apiUrl}&${queryParams}`;

  try {
    const response = await axios({
      method: 'GET',
      url: 'https://scrape.abstractapi.com/v1/',
      params: {
        url: fullUrl,
        api_key: '26ef364e34b049168905b2cbde75ae40',
        render_js: 'true',
        use_proxy: 'true',
      },
    });

    const html = response.data;
    const jsonString = html.match(/<pre>(.*?)<\/pre>/s)[1];
    const data = JSON.parse(jsonString);
    return data;
  } catch (error) {
    console.error(`Error in piwigoCategoriesCall (${method}):`, error);
    throw error;
  }
}

async function getLatestAlbums(url, tag) {
  const params = {
    order: 'date_last',
    limit: MAX_ALBUMS.toString(),
  };

  if (tag) {
    params.cat_id = tag; // Include the tag as a category ID if provided
  }

  const data = await piwigoCategoriesCall(url, 'pwg.categories.getList', params);

  // Check if data and data.result are defined
  if (!data || !data.result) {
    console.error('Invalid response from Piwigo API:', data);
    throw new Error('Invalid response from Piwigo API');
  }

  // Check if data.result.categories is defined
  if (!data.result.categories) {
    console.error('No categories found in the response:', data.result);
    throw new Error('No categories found in the response');
  }

  return data.result.categories;
}

async function getImagesFromAlbum(url, albumId) {
  const data = await piwigoCategoriesCall(url, 'pwg.categories.getImages', {
    cat_id: albumId,
    order: 'date_creation',
    limit: IMAGES_PER_ALBUM.toString(),
  });

  return data.result.images;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const tag = searchParams.get('tag');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const latestAlbums = await getLatestAlbums(url, tag);
    let allImages = [];

    for (const album of latestAlbums) {
      const images = await getImagesFromAlbum(url, album.id);
      allImages = allImages.concat(images.map(image => ({
        ...image,
        albumName: album.name,
        albumId: album.id,
      })));
    }

    // Format the response
    const formattedImages = allImages.map(image => ({
      type: 'photo',
      url: image.element_url,
      caption: `${image.name} (Album: ${image.albumName})`,
      body: `Created: ${image.date_creation}, Album ID: ${image.albumId}`,
    }));

    return NextResponse.json(formattedImages);
  } catch (error) {
    console.error('Failed to fetch Piwigo images:', error);
    return NextResponse.json({ error: `Failed to fetch Piwigo images: ${error.message}` }, { status: 500 });
  }
}
