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
  const [isDraggingCard, setIsDraggingCard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeckFullyOpened, setIsDeckFullyOpened] = useState(false);

  const onAddNewCards = useCallback(() => {
    addNewCardsForUser(user, tumblrUsername, caseSelector, tag, setVisibleCards, setDeckCards);
  }, [user, tumblrUsername, caseSelector, tag, setVisibleCards, setDeckCards]);

  const loadMoreCards = useCallback(() => {
    if (isLoading) {
      console.log('Already loading, skipping...');
      return;
    }
    console.log('Loading more cards...');
    setIsLoading(true);
    // Always attempt to increase the visible card count to enable true infinite scrolling
    setVisibleCards((prev) => Math.max(prev, deckCards.length) + 20);
    onAddNewCards();
    // Reset loading state after a delay to prevent rapid consecutive calls
    setTimeout(() => setIsLoading(false), 2000);
  }, [onAddNewCards, isLoading, deckCards.length]);

  // Fallback scroll listener for infinite scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
      
      // Trigger when scrolled 90% down
      if (scrollPercentage > 0.9 && !isLoading) {
        console.log('Scroll trigger activated:', scrollPercentage);
        loadMoreCards();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [loadMoreCards, isLoading]);

  useEffect(() => {
    if (gridRef.current && deckCards.length > 0) {
      gridRef.current.resetAfterIndices({ columnIndex: 0, rowIndex: 0 });
    }
  }, [deckCards.length, columnCount, visibleCards]);

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

  useEffect(() => {
    let timer;
    if (isDeckOpen) {
      timer = setTimeout(() => {
        setIsDeckFullyOpened(true);
      }, 300); // Match animation duration
    } else {
      setIsDeckFullyOpened(false);
    }
    return () => clearTimeout(timer);
  }, [isDeckOpen]);

  const memoizedDeckCards = React.useMemo(() => deckCards, [deckCards]);

  const Cell = useCallback(({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= visibleCards || index >= deckCards.length) return null;
    const card = deckCards[index];
    if (!card) return null;

    // Allow dragging for top row even when deck is closed
    const isTopRow = rowIndex === 0;
    const canDrag = isDeckOpen || isTopRow;

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
          onDragStart={() => {
            setIsDraggingCard(true);
          }}
          onDragEnd={(_, info) => {
            setIsDraggingCard(false);
            if (info.offset.y < -85) {
              onMoveCardToHand(card);
            }
          }}
          onMoveCardToDeck={onMoveCardToHand}
          containerRef={false}
          renderDragOverlay={null}
          isDeckOpen={canDrag}
          dragConstraints={false}
          onClick={() => onMoveCardToHand(card)}
          isExpanded={false}
          setIsExpanded={() => {}}
          isThumbnailView={isThumbnailView}
          isInDeck={true}
        />
      </div>
    );
  }, [visibleCards, deckCards, columnCount, onMoveCardToHand, isDeckOpen, isThumbnailView, isDraggingCard]);

  const MemoizedCell = React.memo(Cell, (prevProps, nextProps) => {
    return prevProps.columnIndex === nextProps.columnIndex && 
           prevProps.rowIndex === nextProps.rowIndex && 
           prevProps.style === nextProps.style;
  });

  return (
    <motion.div
      ref={setNodeRef}
      className="fixed bottom-0 left-0 w-full bg-neutral flex flex-col"
      style={{ 
        zIndex: isDeckOpen ? 6000 : 400,
        height: isDeckOpen ? `${Math.max(window.innerHeight * 0.55, 300)}px` : '80px',
        minHeight: isDeckOpen ? '300px' : '80px',
      }}
      animate={{ 
        height: isDeckOpen ? `${Math.max(window.innerHeight * 0.55, 300)}px` : '80px',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 1.5 }}
      initial={{ height: '80px' }}
    >
      <div
        className="w-full h-10 flex justify-center items-center cursor-pointer bg-gray-800 rounded-t-2xl"
        onClick={() => setIsDeckOpen(!isDeckOpen)}
        style={{ flex: 'none', touchAction: 'none' }}
      >
        <div className="w-10 h-1 bg-gray-400 rounded-full" />
      </div>
      {!isDeckOpen && memoizedDeckCards.length > 0 && (
        <div className="bg-gray-800 p-2 grid grid-cols-3 md:grid-cols-4 gap-2" style={{ height: 'calc(10vh - 2.5rem)' }}>
          {memoizedDeckCards.slice(0, columnCount).map((card, index) => (
            <DraggableCard
              key={card.id || `preview-card-${index}`}
              card={card}
              isDummy={false}
              isActive={false}
              position={{ x: 0, y: 0, rotate: 0, scale: 1, zIndex: index }}
              onDragStart={() => {
                setIsDraggingCard(true);
              }}
              onDragEnd={(_, info) => {
                setIsDraggingCard(false);
                if (info.offset.y < -85) {
                  onMoveCardToHand(card);
                }
              }}
              onMoveCardToDeck={onMoveCardToHand}
              containerRef={false}
              renderDragOverlay={null}
              isDeckOpen={true}
              dragConstraints={false}
              onClick={() => onMoveCardToHand(card)}
              isExpanded={false}
              setIsExpanded={() => {}}
              isThumbnailView={isThumbnailView}
              isInDeck={true}
            />
          ))}
        </div>
      )}
      {isDeckOpen && memoizedDeckCards.length > 0 && (
        <div 
          className="h-[calc(100%-2.5rem)] bg-gray-800 overflow-auto" 
          ref={containerRef}
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
        >
          <AutoSizer>
            {({ height, width }) => {
              const columnWidth = width / columnCount;
              const rowHeight = columnWidth;
              // Calculate total rows needed for all visible cards, not limited by container
              const totalRowsNeeded = Math.ceil(visibleCards / columnCount);
              const actualRowCount = Math.min(totalRowsNeeded, Math.ceil(deckCards.length / columnCount));

              return (
                <Grid
                  ref={gridRef}
                  className="p-4"
                  style={{ overflow: 'visible' }}
                  columnCount={columnCount}
                  columnWidth={() => columnWidth}
                  height={height}
                  rowCount={actualRowCount}
                  rowHeight={() => rowHeight}
                  width={width}
                  onItemsRendered={({ visibleRowStartIndex, visibleRowStopIndex }) => {
                    const visibleItemsEnd = (visibleRowStopIndex + 1) * columnCount;
                    const remainingCards = deckCards.length - visibleItemsEnd;
                    // Only trigger if we're near the end and have more cards to load
                    if (remainingCards <= 8 && !isLoading && visibleCards < deckCards.length + 20) {
                      loadMoreCards();
                    }
                  }}
                  overscanRowCount={5}
                >
                  {MemoizedCell}
                </Grid>
              );
            }}
          </AutoSizer>
        </div>
      )}
    </motion.div>
  );
};

export default DeckPreview;
