import React, { useCallback } from "react";
import TopMenu from "./TopMenu";
import {
  addNewCardsForUser,
  clearCardsForUser,
  clearHandForUser,
} from "@/app/utils/playerTools";

const CardDealer = ({
  user,
  setVisibleCards,
  setDeckCards,
  tumblrUsername,
  setTumblrUsername,
  caseSelector,
  setCaseSelector,
  tag,
  setTag,
}) => {
  const onAddNewCards = useCallback(() => {
    addNewCardsForUser(
      user,
      tumblrUsername,
      caseSelector,
      tag,
      setVisibleCards,
      setDeckCards,
    );
  }, [user, tumblrUsername, caseSelector, tag, setVisibleCards, setDeckCards]);

  const onAddNewCardsToDeck = useCallback(() => {
    addNewCardsForUser(
      user,
      tumblrUsername,
      caseSelector,
      tag,
      setVisibleCards,
      setDeckCards,
      "deck",
    );
  }, [setDeckCards]);

  const onClearCards = useCallback(() => {
    clearCardsForUser(user, setVisibleCards, setDeckCards);
  }, [user, setVisibleCards, setDeckCards]);

  const onClearHand = useCallback(() => {
    clearHandForUser(user, setVisibleCards);
  }, [user, setVisibleCards]);

  return (
    <TopMenu
      onAddNewCards={onAddNewCards}
      onAddNewCardsToDeck={onAddNewCardsToDeck}
      onClearCards={onClearCards}
      tumblrUsername={tumblrUsername}
      setTumblrUsername={setTumblrUsername}
      tag={tag}
      setTag={setTag}
      caseSelector={caseSelector}
      setCaseSelector={setCaseSelector}
      setVisibleCards={setVisibleCards}
      setDeckCards={setDeckCards}
      onClearHand={onClearHand}
    />
  );
};

export default CardDealer;
