// utils/fetchCards.js
export async function fetchCards(provider, identifier) {
    console.log(`Fetching cards for ${provider}: ${identifier}`);
    const response = await fetch(`/api/cards?provider=${provider}&identifier=${encodeURIComponent(identifier)}`);
    if (!response.ok) {
      throw new Error(`Error fetching cards: ${response.status}`);
    }
    const data = await response.json();
    console.log("Fetched cards data:", data);
    return data;
  }
  