import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks,
} from "body-scroll-lock";
import { DndContext } from "@dnd-kit/core";
import CardHand from "./CardHand";
import DeckPreview from "./DeckPreview";
import CardDealer from "./CardDealer";
import CardRevealSection from "./CardRevealSection";
import io from "socket.io-client";

const DealerSection = ({
  title,
  handCards,
  deckCards,
  onMoveCardToDeck,
  onMoveCardToHand,
  user,
  session,
  onDragStart,
  visibleCards,
  setVisibleCards,
  setDeckCards,
  sendMessage,
  messages,
}) => {
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [revealedCards, setRevealedCards] = useState(Array(5).fill(null));
  const [tumblrUsername, setTumblrUsername] = useState(
    "sabertoothwalrus.tumblr.com",
  );
  const [tag, setTag] = useState("");
  const [caseSelector, setCaseSelector] = useState("tumblr");
  const targetElementRef = useRef(null);
  const [socket, setSocket] = useState();
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    const socket = io("http://localhost:3000");
    const room = title;

    socket.emit("join_room", room);

    socket.on("players_update", (playerUpdates) => {
      console.log(updates);
      setUpdates(playerUpdates);
    });

    socket.on("post_card", (card) => {
      setRevealedCards((prev) => {
        const emptyIndex = prev.findIndex((c) => c === null);
        if (emptyIndex !== -1) {
          const newRevealedCards = [...prev];
          newRevealedCards[emptyIndex] = card;
          return newRevealedCards;
        }
        return prev;
      });
      setVisibleCards((prev) => prev.filter((c) => c.id !== card.id));
    });

    setSocket(socket);

    return () => {
      socket.emit("leave_room", room);
      socket.disconnect();
    };
  }, [title]);

  const handleMoveCardToHand = useCallback(
    (card) => {
      setDeckCards((prevDeckCards) =>
        prevDeckCards.filter((c) => c.id !== card.id),
      );
    },
    [onMoveCardToHand, setDeckCards],
  );

  const handleCardReveal = useCallback(
    (card) => {
      setVisibleCards((prev) => prev.filter((c) => c.id !== card.id));
      socket.emit("post_card", { card, room: title });
    },
    [setVisibleCards, socket],
  );

  const dealCards = useCallback(() => {
    const newRevealedCards = deckCards.slice(0, 5);
    setRevealedCards(newRevealedCards);
    setDeckCards((prev) => prev.slice(5));
    newRevealedCards.forEach((card) => {
      socket.emit("post_card", { card, room: title });
    });
  }, [deckCards, setDeckCards]);

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;

      if (over && over.id === "card-reveal-section") {
        const draggedCard = handCards.find((card) => card.id === active.id);
        if (draggedCard) {
          handleCardReveal(draggedCard);
        }
      } else if (over && over.id === "deck-preview") {
        const draggedCard = handCards.find((card) => card.id === active.id);
        if (draggedCard) {
          onMoveCardToDeck(draggedCard);
        }
      }
    },
    [handCards, handleCardReveal, onMoveCardToDeck],
  );

  useEffect(() => {
    if (targetElementRef.current) {
      disableBodyScroll(targetElementRef.current);
    }
    return () => {
      clearAllBodyScrollLocks();
    };
  }, []);

  const memoizedCardHand = useMemo(
    () => (
      <CardHand
        cardData={handCards}
        onSwipeDown={onMoveCardToDeck}
        onMoveCardToDeck={onMoveCardToDeck}
        isDeckOpen={isDeckOpen}
        onCardReveal={handleCardReveal}
      />
    ),
    [handCards, onMoveCardToDeck, isDeckOpen],
  );

  const memoizedDeckPreview = useMemo(
    () => (
      <DeckPreview
        deckCards={deckCards}
        onMoveCardToHand={handleMoveCardToHand}
        isDeckOpen={isDeckOpen}
        setIsDeckOpen={setIsDeckOpen}
        tumblrUsername={tumblrUsername}
        setTumblrUsername={setTumblrUsername}
        tag={tag}
        setTag={setTag}
        caseSelector={caseSelector}
        setCaseSelector={setCaseSelector}
        setVisibleCards={setVisibleCards}
        setDeckCards={setDeckCards}
        visibleCards={visibleCards}
        user={user}
      />
    ),
    [
      deckCards,
      handleMoveCardToHand,
      isDeckOpen,
      tumblrUsername,
      tag,
      caseSelector,
      visibleCards,
      user,
      setVisibleCards,
      setDeckCards,
    ],
  );

  return (
    <DndContext onDragStart={onDragStart} onDragEnd={handleDragEnd}>
      <section
        ref={targetElementRef}
        className="bg-neutral text-neutral-content"
      >
        <CardDealer
          user={user}
          setVisibleCards={setVisibleCards}
          setDeckCards={setDeckCards}
          sendMessage={sendMessage}
          tumblrUsername={tumblrUsername}
          setTumblrUsername={setTumblrUsername}
          tag={tag}
          setTag={setTag}
          caseSelector={caseSelector}
          setCaseSelector={setCaseSelector}
        />
        <CardRevealSection
          revealedCards={revealedCards}
          onCardReveal={handleCardReveal}
          dealCards={dealCards}
        />
        <div className="w-full h-[145vh] sm:h-[180vh] md:h-[220vh] relative">
          {memoizedCardHand}
        </div>
        {memoizedDeckPreview}
      </section>
    </DndContext>
  );
};

export default DealerSection;
