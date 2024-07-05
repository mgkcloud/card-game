import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import DraggableCard from './DraggableCard';
import { VariableSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { addNewCardsForUser } from '@/app/utils/playerTools';

const DeckPreview = ({ user, deckCards, onMoveCardToHand, isDeckOpen, setIsDeckOpen, tumblrUsername, setTumblrUsername, caseSelector, setCaseSelector, tag, setTag, setDeckCards }) => {
  const { setNodeRef } = useDroppable({ id: 'deck-preview' });
  const [visibleCards, setVisibleCards] = useState(60);
  const [isThumbnailView, setIsThumbnailView] = useState(true);
  const containerRef = useRef(null);
  const gridRef = useRef(null);
  const [columnCount, setColumnCount] = useState(4);

  const onAddNewCards = useCallback(() => {
    addNewCardsForUser(user, tumblrUsername, caseSelector, tag, setVisibleCards, setDeckCards);
  }, [user, tumblrUsername, caseSelector, tag, setVisibleCards, setDeckCards]);

  const loadMoreCards = useCallback(() => {
    setVisibleCards((prev) => Math.min(prev + 20, deckCards.length));
    console.log('Loading more cards...');
    onAddNewCards();
  }, [deckCards.length, onAddNewCards]);

  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.resetAfterIndices({ columnIndex: 0, rowIndex: 0 });
    }
  }, [deckCards, columnCount]);

  useEffect(() => {
    const handleResize = () => {
      const newColumnCount = window.innerWidth < 768 ? 3 : 4;
      if (newColumnCount !== columnCount) {
        setColumnCount(newColumnCount);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, [columnCount]);

  const Cell = useCallback(({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= visibleCards || index >= deckCards.length) return null;
    const card = deckCards[index];
    if (!card) return null;

    return (
      <div style={{
        ...style,
        padding: '0.5rem',
        boxSizing: 'border-box',
      }}>
        <DraggableCard
          key={card.id || `deck-card-${index}`}
          card={card}
          isDummy={false}
          isActive={false}
          position={{ x: 0, y: 0, rotate: 0, scale: 1, zIndex: index }}
          onDragStart={() => {}}
          onDragEnd={(_, info) => {
            if (info.offset.y < -85) {
              onMoveCardToHand(card);
            }
          }}
          onMoveCardToDeck={onMoveCardToHand}
          containerRef={false}
          renderDragOverlay={null}
          isDeckOpen={isDeckOpen}
          dragConstraints={false}
          onClick={() => onMoveCardToHand(card)}
          isExpanded={false}
          setIsExpanded={() => {}}
          isThumbnailView={isThumbnailView}
          isInDeck={true}
        />
      </div>
    );
  }, [visibleCards, deckCards, columnCount, onMoveCardToHand, isDeckOpen, isThumbnailView]);

  return (
    <motion.div
      ref={setNodeRef}
      className="fixed bottom-0 left-0 w-full bg-neutral"
      style={{ zIndex: 400 }}
      animate={{ height: isDeckOpen ? '55vh' : '10vh' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div
        className="w-full h-10 flex justify-center items-center cursor-pointer bg-gray-800 rounded-t-2xl"
        onClick={() => setIsDeckOpen(!isDeckOpen)}
        style={{ touchAction: 'none' }}
      >
        <div className="w-10 h-1 bg-gray-400 rounded-full" />
      </div>
      <div className="h-[calc(100%-2.5rem)] bg-gray-800" ref={containerRef}>
        <AutoSizer>
          {({ height, width }) => {
            const columnWidth = width / columnCount;
            const rowHeight = columnWidth;
            const rowCount = Math.ceil(Math.min(visibleCards, deckCards.length) / columnCount);

            return (
              <Grid
                ref={gridRef}
                className="p-4"
                style={{ overflow: 'visible' }}
                columnCount={columnCount}
                columnWidth={() => columnWidth}
                height={height}
                rowCount={rowCount}
                rowHeight={() => rowHeight}
                width={width}
                onItemsRendered={({ visibleRowStartIndex, visibleRowStopIndex }) => {
                  const totalRows = Math.ceil(deckCards.length / columnCount);
                  if (visibleRowStopIndex >= totalRows - 2 && visibleCards < deckCards.length) {
                    loadMoreCards();
                  }
                }}
              >
                {Cell}
              </Grid>
            );
          }}
        </AutoSizer>
      </div>
    </motion.div>
  );
};

export default DeckPreview;
