// utils/fetchCards.js
export async function fetchCards(provider, identifier = '', tag = '', prompt = '') {
    console.log(`Fetching cards for ${provider}: ${identifier}`);
    const params = new URLSearchParams();
    params.append('provider', provider);
    if (identifier) params.append('identifier', identifier);
    if (tag) params.append('tag', tag);
    if (prompt) params.append('prompt', prompt);

    const response = await fetch(`/api/cards?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Error fetching cards: ${response.status}`);
    }
    const data = await response.json();
    console.log("Fetched cards data:", data);
    return data;
  }
  