"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AdminMenuModal } from "~/components/AdminMenuModal";

import styles from "./HomeScreenAdminTrigger.module.css";

const HOLD_DURATION_MS = 2000;
const SEQUENCE = ["topLeft", "topRight", "bottomRight", "bottomLeft"] as const;

type ZoneId = (typeof SEQUENCE)[number];

const ZONES: Array<{ id: ZoneId; className: string }> = [
  { id: "topLeft", className: styles.topLeft },
  { id: "topRight", className: styles.topRight },
  { id: "bottomRight", className: styles.bottomRight },
  { id: "bottomLeft", className: styles.bottomLeft },
];

export function HomeScreenAdminTrigger() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const progressRef = useRef(0);
  const isMenuOpenRef = useRef(false);
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const zoneRefs = useRef<Record<ZoneId, HTMLDivElement | null>>({
    topLeft: null,
    topRight: null,
    bottomRight: null,
    bottomLeft: null,
  });

  const getZoneByPoint = useCallback((clientX: number, clientY: number): ZoneId | null => {
    return ZONES.find(({ id }) => {
      const zone = zoneRefs.current[id];

      if (!zone) {
        return false;
      }

      const bounds = zone.getBoundingClientRect();

      return (
        clientX >= bounds.left &&
        clientX <= bounds.right &&
        clientY >= bounds.top &&
        clientY <= bounds.bottom
      );
    })?.id ?? null;
  }, []);

  const clearHold = useCallback(() => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }

    activePointerIdRef.current = null;
  }, []);

  const resetSequence = useCallback(() => {
    clearHold();
    progressRef.current = 0;
  }, [clearHold]);

  const completeSequence = useCallback(() => {
    clearHold();
    progressRef.current = 0;
    setIsMenuOpen(true);
  }, [clearHold]);

  const handleZonePointerDown = useCallback((zoneId: ZoneId, pointerId: number) => {
    if (isMenuOpenRef.current) {
      return;
    }

    const expectedZone = SEQUENCE[progressRef.current];

    if (zoneId !== expectedZone) {
      resetSequence();
      return;
    }

    if (zoneId === "bottomLeft") {
      clearHold();
      activePointerIdRef.current = pointerId;
      holdTimeoutRef.current = setTimeout(completeSequence, HOLD_DURATION_MS);
      progressRef.current = SEQUENCE.length;
      return;
    }

    progressRef.current += 1;
  }, [clearHold, completeSequence, resetSequence]);

  const handleFinalZonePointerEnd = useCallback((pointerId: number) => {
    if (activePointerIdRef.current !== pointerId) {
      return;
    }

    resetSequence();
  }, [resetSequence]);

  const handleFinalZonePointerMove = useCallback((pointerId: number, clientX: number, clientY: number) => {
    if (activePointerIdRef.current !== pointerId) {
      return;
    }

    if (getZoneByPoint(clientX, clientY) !== "bottomLeft") {
      resetSequence();
    }
  }, [getZoneByPoint, resetSequence]);

  useEffect(() => clearHold, [clearHold]);

  useEffect(() => {
    isMenuOpenRef.current = isMenuOpen;
  }, [isMenuOpen]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (event.button > 0) {
        return;
      }

      const zoneId = getZoneByPoint(event.clientX, event.clientY);

      if (!zoneId) {
        resetSequence();
        return;
      }

      handleZonePointerDown(zoneId, event.pointerId);
    };

    const handlePointerUp = (event: PointerEvent) => {
      handleFinalZonePointerEnd(event.pointerId);
    };

    const handlePointerCancel = (event: PointerEvent) => {
      handleFinalZonePointerEnd(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      handleFinalZonePointerMove(event.pointerId, event.clientX, event.clientY);
    };

    window.addEventListener("pointerdown", handlePointerDown, { capture: true, passive: true });
    window.addEventListener("pointerup", handlePointerUp, { capture: true, passive: true });
    window.addEventListener("pointercancel", handlePointerCancel, { capture: true, passive: true });
    window.addEventListener("pointermove", handlePointerMove, { capture: true, passive: true });

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, { capture: true });
      window.removeEventListener("pointerup", handlePointerUp, { capture: true });
      window.removeEventListener("pointercancel", handlePointerCancel, { capture: true });
      window.removeEventListener("pointermove", handlePointerMove, { capture: true });
    };
  }, [
    getZoneByPoint,
    handleFinalZonePointerEnd,
    handleFinalZonePointerMove,
    handleZonePointerDown,
    resetSequence,
  ]);

  return (
    <>
      <div className={styles.layer} aria-hidden="true">
        {ZONES.map((zone) => (
          <div
            key={zone.id}
            ref={(element) => {
              zoneRefs.current[zone.id] = element;
            }}
            className={`${styles.zone} ${zone.className}`}
          />
        ))}
      </div>

      <AdminMenuModal
        isOpen={isMenuOpen}
        onClose={() => {
          clearHold();
          setIsMenuOpen(false);
          progressRef.current = 0;
        }}
      />
    </>
  );
}
