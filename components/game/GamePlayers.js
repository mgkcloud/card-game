import OpponentsHand from "./OpponentsHand";
import React, { useCallback } from "react";

const GamePlayers = ({
  isHome,
  cardData,
  onSwipeDown,
  onMoveCardToDeck,
  isDeckOpen,
  onCardReveal,
  players,
}) => {
  const renderPlayers = useCallback(() => {
    return (
      <OpponentsHand
        isHome={isHome}
        cardData={cardData}
        onSwipeDown={onSwipeDown}
        onMoveCardToDeck={onMoveCardToDeck}
        isDeckOpen={isDeckOpen}
        onCardReveal={onCardReveal}
        isOpponentSection={true}
      />
    );
  }, [players]);

  return (
    <div className="fixed flex align-center justify-center h-48 w-full bg-gradient-to-b from-gray-600 to-gray-800">
      {Array.from({ length: players }).map((_, index) => renderPlayers(index))}
    </div>
  );
};

export default GamePlayers;
