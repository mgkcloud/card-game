

import { toast } from 'react-hot-toast';
import { fetchCards } from '@/app/utils/fetchCards';


// Helper function to add new cards for a user
export const addNewCardsForUser = async (user, tumblrUsername, caseSelector, tag, setVisibleCards, setDeckCards) => {
    try {
        const media = await fetchCards(caseSelector, tumblrUsername, tag);
        const allCards = media.map((item, index) => ({
            id: `card-${Date.now()}-${index}`,
            title: `Media ${index + 1}`,
            color: item.background_color || 'bg-primary',
            textColor: 'text-white',
            mediaSrc: item.image_url,
            mediaType: item.type || 'photo',
            items: [item.rarity || 'common'],
        }));
        const hand = allCards.slice(0, 9);
        const deck = allCards.slice(9);
        setVisibleCards(prev => [...prev, ...hand]);
        setDeckCards(prev => [...prev, ...deck]);
        if (user) {
            // Save to database if user is logged in
            // Implement saveUserCards function as needed
        }
    } catch (error) {
        console.error('Error adding new cards:', error);
        toast.error('Failed to add new cards');
    }
};

// Helper function to clear cards for a user
export const clearCardsForUser = (user, setVisibleCards, setDeckCards) => {
    setVisibleCards([]);
    setDeckCards([]);
    if (user) {
        // Clear user's cards in the database
        // Implement clearUserCards function as needed
    }
    localStorage.setItem('userCards', JSON.stringify({ hand: [], deck: [] }));
};


export const clearHandForUser = (user, setVisibleCards) => {
    setVisibleCards([]);
    if (user) {
        // Clear user's cards in the database
        // Implement clearUserCards function as needed
    }
};