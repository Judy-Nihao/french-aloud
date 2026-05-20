"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { X } from "lucide-react";
import PlayPhraseButton from "./PlayPhraseButton";
import ShapeBlock from "./ShapeBlock";
import type { CardData } from "./data";

const WHEEL_SCROLL_COOLDOWN = 320;
const WHEEL_SCROLL_THRESHOLD = 180;
const CAROUSEL_SCROLL_DURATION = 32;
const DRAG_THRESHOLD = 18;
const FOCUS_RELEASE_DISTANCE = 78;
const SNAP_LOCK_DURATION = 360;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const SHORT_PHRASE_MAX = 10;
const MEDIUM_PHRASE_MAX = 24;

const frenchTextSizeClass = (phrase: string) => {
  if (phrase.length < SHORT_PHRASE_MAX) return "text-[clamp(2rem,5vw,2.75rem)]";
  if (phrase.length < MEDIUM_PHRASE_MAX)
    return "text-[clamp(1.375rem,4.4vw,1.85rem)]";
  return "text-[clamp(1.05rem,3.8vw,1.45rem)]";
};

const COLOR_CLASSES: Record<
  CardData["color"]["name"],
  {
    bg: string;
    text: string;
    annotation: string;
    icon: string;
  }
> = {
  sunset: {
    bg: "bg-fa-sunset",
    text: "text-white/95",
    annotation: "text-white/65",
    icon: "text-fa-sunset",
  },
  dusty: {
    bg: "bg-fa-dusty",
    text: "text-fa-primary/90",
    annotation: "text-fa-primary/55",
    icon: "text-fa-accent",
  },
  denim: {
    bg: "bg-fa-denim",
    text: "text-white/95",
    annotation: "text-white/65",
    icon: "text-fa-denim",
  },
  evergreen: {
    bg: "bg-fa-evergreen",
    text: "text-white/95",
    annotation: "text-white/65",
    icon: "text-fa-evergreen",
  },
  chestnut: {
    bg: "bg-fa-chestnut",
    text: "text-white/95",
    annotation: "text-white/65",
    icon: "text-fa-chestnut",
  },
  mustard: {
    bg: "bg-fa-mustard",
    text: "text-fa-primary/90",
    annotation: "text-fa-primary/55",
    icon: "text-fa-accent",
  },
};

const CarouselCard = ({
  card,
  isFocused,
  onSelect,
  onDelete,
}: {
  card: CardData;
  isFocused: boolean;
  onSelect: () => void;
  onDelete?: (id: string) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const colorClasses = COLOR_CLASSES[card.color.name];
  const hasImage = Boolean(card.imageUrl);
  const isLightText = colorClasses.text.startsWith("text-white");
  const deleteButtonClass = isLightText
    ? "bg-white/20 text-white/70 hover:bg-white/35 hover:text-white"
    : "bg-fa-primary/10 text-fa-primary/55 hover:bg-fa-primary/20 hover:text-fa-primary";

  return (
    <div
      role="button"
      tabIndex={0}
      className="w-[82vw] max-w-104 flex-none cursor-grab appearance-none border-0 bg-transparent p-0 text-left active:cursor-grabbing"
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      aria-pressed={isFocused}
      aria-label={`Focus ${card.french} card`}
    >
      <div
        className={cn(
          "relative mx-auto flex h-[min(72vh,35rem)] w-full origin-center transform-gpu flex-col overflow-hidden rounded-2xl transition-[opacity,transform,box-shadow] motion-reduce:transition-none",
          colorClasses.bg,
          isFocused
            ? "scale-100 opacity-100 shadow-[0_10px_34px_rgba(28,26,23,0.2),0_3px_10px_rgba(28,26,23,0.08)] duration-380 ease-[cubic-bezier(0.34,1.52,0.64,1)]"
            : "scale-[0.91] opacity-55 shadow-[0_3px_14px_rgba(28,26,23,0.12),0_1px_4px_rgba(28,26,23,0.05)] duration-180 ease-[cubic-bezier(0.16,1,0.3,1)]",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {onDelete && (
          <button
            type="button"
            className={cn(
              "absolute top-3 right-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-opacity duration-150 active:scale-90",
              isHovered ? "opacity-100" : "opacity-0",
              deleteButtonClass,
            )}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(card.id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            aria-label={`Delete ${card.french}`}
          >
            <X size={14} strokeWidth={2} />
          </button>
        )}
        {hasImage ? (
          <div className="h-[60%] flex-none p-4">
            <div className="h-full w-full">
              <ShapeBlock
                shapeIndex={card.shapeIndex}
                color={card.color.hex}
                imageSrc={card.imageUrl ?? undefined}
              />
            </div>
          </div>
        ) : null}
        <div
          className={cn(
            "flex flex-1 flex-col overflow-hidden px-5 pt-2 pb-6",
            hasImage ? "" : "py-8 text-center",
          )}
        >
          <div
            className={cn(
              "flex flex-col",
              hasImage ? "" : "flex-1 justify-center",
            )}
          >
            <p
              lang="fr"
              className={cn(
                "font-display text-center leading-tight",
                colorClasses.text,
                hasImage
                  ? frenchTextSizeClass(card.french)
                  : "text-[clamp(2rem,6vw,4rem)]",
              )}
            >
              {card.french}
            </p>
            {card.english && (
              <p
                className={cn(
                  "font-hand mt-3 text-center text-2xl leading-tight",
                  colorClasses.annotation,
                )}
              >
                {card.english}
              </p>
            )}
          </div>
          <div className="mt-auto flex justify-center pt-4">
            <PlayPhraseButton
              text={card.french}
              imageUrl={card.imageUrl}
              iconClassName={colorClasses.icon}
              iconSize={22}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Carousel = ({
  cards,
  focusCardId,
  onDelete,
}: {
  cards: CardData[];
  focusCardId?: string | null;
  onDelete?: (id: string) => void;
}) => {
  const startIndex = Math.floor(cards.length / 2);
  const [selectedIndex, setSelectedIndex] = useState(startIndex);
  const selectedIndexRef = useRef(startIndex);
  const sectionRef = useRef<HTMLElement>(null);
  const focusFrame = useRef<number | null>(null);
  const snapLockTimer = useRef<number | null>(null);
  const lockedSnapIndex = useRef<number | null>(null);
  const isTrackingFocus = useRef(false);
  const pointerDownX = useRef(0);
  const pointerDownY = useRef(0);
  const pointerDeltaX = useRef(0);
  const pointerTravelX = useRef(0);
  const pointerStartIndex = useRef(startIndex);
  const isPointerGesture = useRef(false);
  const suppressClick = useRef(false);
  const wheelAccumulator = useRef(0);
  const wheelReadyAt = useRef(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    containScroll: false,
    duration: CAROUSEL_SCROLL_DURATION,
    dragThreshold: DRAG_THRESHOLD,
    skipSnaps: false,
    slidesToScroll: 1,
    startIndex,
  });

  const wrapSlideIndex = useCallback(
    (index: number) => (index + cards.length) % cards.length,
    [cards.length],
  );

  const lockSnapTarget = useCallback(
    (index: number) => {
      const targetIndex = wrapSlideIndex(index);
      lockedSnapIndex.current = targetIndex;

      if (snapLockTimer.current !== null) {
        window.clearTimeout(snapLockTimer.current);
      }

      snapLockTimer.current = window.setTimeout(() => {
        lockedSnapIndex.current = null;
        snapLockTimer.current = null;
      }, SNAP_LOCK_DURATION);

      return targetIndex;
    },
    [wrapSlideIndex],
  );

  const getClosestSlideIndex = useCallback(() => {
    if (!emblaApi) return startIndex;
    const rootBounds = emblaApi.rootNode().getBoundingClientRect();
    const viewportCenter = rootBounds.left + rootBounds.width / 2;
    const closestSlide = emblaApi.slideNodes().reduce(
      (closest, slide, index) => {
        const bounds = slide.getBoundingClientRect();
        const center = bounds.left + bounds.width / 2;
        const distance = Math.abs(center - viewportCenter);

        return distance < closest.distance ? { index, distance } : closest;
      },
      {
        index: emblaApi.selectedScrollSnap(),
        distance: Number.POSITIVE_INFINITY,
      },
    );

    return closestSlide.index;
  }, [emblaApi, startIndex]);

  const updateFocusedCard = useCallback(() => {
    setSelectedIndex((currentIndex) => {
      const closestIndex = lockedSnapIndex.current ?? getClosestSlideIndex();
      return currentIndex === closestIndex ? currentIndex : closestIndex;
    });
  }, [getClosestSlideIndex]);

  const scheduleFocusedCardUpdate = useCallback(() => {
    if (focusFrame.current !== null) return;
    focusFrame.current = window.requestAnimationFrame(() => {
      focusFrame.current = null;
      updateFocusedCard();
    });
  }, [updateFocusedCard]);

  const stopFocusTracking = useCallback(() => {
    isTrackingFocus.current = false;
  }, []);

  const startFocusTracking = useCallback(() => {
    if (isTrackingFocus.current) return;
    isTrackingFocus.current = true;

    const tick = () => {
      updateFocusedCard();

      if (!isTrackingFocus.current) {
        focusFrame.current = null;
        return;
      }

      focusFrame.current = window.requestAnimationFrame(tick);
    };

    if (focusFrame.current !== null) {
      window.cancelAnimationFrame(focusFrame.current);
    }

    focusFrame.current = window.requestAnimationFrame(tick);
  }, [updateFocusedCard]);

  const magnetizeToClosestCard = useCallback(() => {
    if (!emblaApi) return;
    stopFocusTracking();

    let closestIndex = lockedSnapIndex.current ?? getClosestSlideIndex();

    if (isPointerGesture.current) {
      if (pointerTravelX.current < FOCUS_RELEASE_DISTANCE) {
        closestIndex = pointerStartIndex.current;
      } else {
        const direction = pointerDeltaX.current < 0 ? 1 : -1;
        closestIndex = pointerStartIndex.current + direction;
      }

      closestIndex = lockSnapTarget(closestIndex);
    }

    isPointerGesture.current = false;

    setSelectedIndex((currentIndex) =>
      currentIndex === closestIndex ? currentIndex : closestIndex,
    );

    if (emblaApi.selectedScrollSnap() !== closestIndex) {
      emblaApi.scrollTo(closestIndex);
    }
  }, [emblaApi, getClosestSlideIndex, lockSnapTarget, stopFocusTracking]);

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (!emblaApi) return;
      const wheelDelta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      if (wheelDelta === 0) return;

      event.preventDefault();
      const now = Date.now();
      if (now < wheelReadyAt.current) return;

      startFocusTracking();
      wheelAccumulator.current += wheelDelta;

      if (Math.abs(wheelAccumulator.current) < WHEEL_SCROLL_THRESHOLD) return;

      if (wheelAccumulator.current > 0) {
        const targetIndex = lockSnapTarget(selectedIndexRef.current + 1);
        setSelectedIndex(targetIndex);
        emblaApi.scrollTo(targetIndex);
      }

      if (wheelAccumulator.current < 0) {
        const targetIndex = lockSnapTarget(selectedIndexRef.current - 1);
        setSelectedIndex(targetIndex);
        emblaApi.scrollTo(targetIndex);
      }

      wheelAccumulator.current = 0;
      wheelReadyAt.current = now + WHEEL_SCROLL_COOLDOWN;
    },
    [emblaApi, lockSnapTarget, startFocusTracking],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      pointerDownX.current = event.clientX;
      pointerDownY.current = event.clientY;
      pointerDeltaX.current = 0;
      pointerTravelX.current = 0;
      pointerStartIndex.current = selectedIndexRef.current;
      isPointerGesture.current = true;
      suppressClick.current = false;
      startFocusTracking();
    },
    [startFocusTracking],
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const travelX = Math.abs(event.clientX - pointerDownX.current);
      const travelY = Math.abs(event.clientY - pointerDownY.current);
      pointerDeltaX.current = event.clientX - pointerDownX.current;
      pointerTravelX.current = travelX;
      suppressClick.current = travelX > 8 || travelY > 8;
    },
    [],
  );

  const handleCardSelect = useCallback(
    (index: number) => {
      if (!emblaApi || suppressClick.current) return;
      const targetIndex = lockSnapTarget(index);
      setSelectedIndex(targetIndex);
      startFocusTracking();
      emblaApi.scrollTo(targetIndex);
    },
    [emblaApi, lockSnapTarget, startFocusTracking],
  );

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("init", updateFocusedCard);
    emblaApi.on("scroll", startFocusTracking);
    emblaApi.on("select", scheduleFocusedCardUpdate);
    emblaApi.on("settle", magnetizeToClosestCard);
    emblaApi.on("pointerUp", magnetizeToClosestCard);
    return () => {
      emblaApi.off("init", updateFocusedCard);
      emblaApi.off("scroll", startFocusTracking);
      emblaApi.off("select", scheduleFocusedCardUpdate);
      emblaApi.off("settle", magnetizeToClosestCard);
      emblaApi.off("pointerUp", magnetizeToClosestCard);
    };
  }, [
    emblaApi,
    magnetizeToClosestCard,
    scheduleFocusedCardUpdate,
    startFocusTracking,
    updateFocusedCard,
  ]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
    emblaApi.scrollTo(startIndex, true);
    window.requestAnimationFrame(updateFocusedCard);
  }, [emblaApi, cards.length, startIndex, updateFocusedCard]);

  useEffect(() => {
    if (!emblaApi || !focusCardId) return;
    const focusIndex = cards.findIndex((card) => card.id === focusCardId);
    if (focusIndex < 0) return;

    const frameId = window.requestAnimationFrame(() => {
      setSelectedIndex(focusIndex);
      emblaApi.scrollTo(focusIndex);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [cards, emblaApi, focusCardId]);

  useEffect(
    () => () => {
      stopFocusTracking();
      if (focusFrame.current !== null) {
        window.cancelAnimationFrame(focusFrame.current);
      }
      if (snapLockTimer.current !== null) {
        window.clearTimeout(snapLockTimer.current);
      }
    },
    [stopFocusTracking],
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    section.addEventListener("wheel", handleWheel, { passive: false });
    return () => section.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  return (
    <section
      ref={sectionRef}
      aria-label="Featured cards"
      className="relative w-full overflow-hidden"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex min-h-[calc(100vh-2rem)] items-center gap-2 sm:gap-3 lg:gap-4">
          {cards.map((card, i) => (
            <CarouselCard
              key={card.id}
              card={card}
              isFocused={i === selectedIndex}
              onSelect={() => handleCardSelect(i)}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default function CarouselCards({
  cards,
  focusCardId = null,
  onDeleteCard,
}: {
  cards: CardData[];
  focusCardId?: string | null;
  onDeleteCard?: (id: string) => void;
}) {
  return (
    <div className="bg-fa-bg font-ui min-h-screen">
      <Carousel
        cards={cards}
        focusCardId={focusCardId}
        onDelete={onDeleteCard}
      />
    </div>
  );
}
