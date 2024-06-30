import { NextResponse } from 'next/server';
import axios from 'axios';

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

// Helper function to retry API calls
async function retryApiCall(apiCall, url, method, params, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await apiCall(url, method, params);
    } catch (error) {
      if (i === retries - 1) {
        console.error(`Failed after ${retries} retries:`, error);
        throw error;
      }
      console.warn(`Retry ${i + 1} failed:`, error);
    }
  }
}

// Update getLatestAlbums to use the retry function
async function getLatestAlbums(url, tag) {
  const params = {
    order: 'date_last',
    limit: MAX_ALBUMS.toString(),
  };

  if (tag) {
    params.cat_id = tag;
  }

  const data = await retryApiCall(piwigoCategoriesCall, url, 'pwg.categories.getList', params);
  return data.result.categories;
}

// Update getImagesFromAlbum to use the retry function
async function getImagesFromAlbum(url, albumId) {
  const data = await retryApiCall(piwigoCategoriesCall, url, 'pwg.categories.getImages', {
    cat_id: albumId,
    order: 'random',
    limit: IMAGES_PER_ALBUM.toString(),
  });

  return data.result.images;
}

// Update the GET function to handle errors from the retry function
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
