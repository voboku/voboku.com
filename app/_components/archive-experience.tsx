"use client";

import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import { pluginWorks as works } from "../_data/plugins";

export const sectionIds = [
  "driftfield",
  "colony",
  "ecosystem-drums",
  "bugnote",
  "flower-groove",
] as const;

export type SectionId = (typeof sectionIds)[number];

type ImageLayer = {
  section: SectionId;
  work: number;
  shape: string;
  crop?: string;
};

type ArchiveExperienceProps = {
  active: boolean;
  requestedSection: SectionId | null;
  homeButtonRef: RefObject<HTMLButtonElement | null>;
  onExit: () => void;
};

const layers: readonly ImageLayer[] = [
  { section: "driftfield", work: 0, shape: "wide drift-layer", crop: "crop-drift" },
  { section: "colony", work: 1, shape: "wide colony-layer", crop: "crop-colony" },
  { section: "ecosystem-drums", work: 2, shape: "wide ecosystem-layer", crop: "crop-ecosystem" },
  { section: "bugnote", work: 3, shape: "tall bugnote-layer", crop: "crop-bugnote" },
  { section: "flower-groove", work: 4, shape: "tall flower-layer", crop: "crop-flower" },
] as const;

const startLayers = 0;
const endLayers = 0;
const layerPositions = [0, 164, 328, 492, 676] as const;
const focusThreshold = 79;
const maxScroll = layerPositions[layers.length - 1 - endLayers] - layerPositions[startLayers];

const sectionLayer: Record<SectionId, number> = {
  driftfield: 0,
  colony: 1,
  "ecosystem-drums": 2,
  bugnote: 3,
  "flower-groove": 4,
};

export function ArchiveExperience({
  active,
  requestedSection,
  homeButtonRef,
  onExit,
}: ArchiveExperienceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  const modalCloseRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLButtonElement | null>(null);
  const activeRef = useRef<SectionId>(requestedSection ?? "driftfield");
  const frameRef = useRef<number | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>(
    requestedSection ?? "driftfield",
  );
  const [navOpen, setNavOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState<number | null>(null);
  const modalOpen = selectedWork !== null;

  useEffect(() => {
    if (!active) return;
    const root = scrollRef.current;
    if (!root) return;

    const updateScene = () => {
      frameRef.current = null;
      const stageHeight = Math.max(root.clientHeight, 1);
      const focusPosition = root.scrollTop + layerPositions[startLayers];
      const depthRange = stageHeight * 0.72;

      layerRefs.current.forEach((element, index) => {
        if (!element) return;
        const distance = layerPositions[index] - focusPosition;
        const y = distance * 0.86;
        const normalized = Math.min(Math.abs(y) / depthRange, 1.22);
        const visibleDepth = Math.min(normalized, 1);
        const scale = 1 - visibleDepth * 0.46;
        const fade = Math.max(0, Math.min(1, (1.16 - normalized) / 0.2));
        const focused = Math.abs(distance) < focusThreshold;

        element.style.setProperty("--layer-y", y.toFixed(2) + "px");
        element.style.setProperty("--layer-scale", scale.toFixed(4));
        element.style.setProperty("--layer-opacity", fade.toFixed(3));
        element.style.zIndex = String(1000 - Math.round(normalized * 500));
        element.dataset.focused = focused ? "true" : "false";
        element.toggleAttribute("inert", normalized > 0.72);
      });

      const nearest = sectionIds.reduce((best, section) => {
        const bestDistance = Math.abs(layerPositions[sectionLayer[best]] - focusPosition);
        const nextDistance = Math.abs(layerPositions[sectionLayer[section]] - focusPosition);
        return nextDistance < bestDistance ? section : best;
      }, sectionIds[0]);

      if (nearest !== activeRef.current) {
        activeRef.current = nearest;
        setActiveSection(nearest);
      }
    };

    const scheduleUpdate = () => {
      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(updateScene);
      }
    };

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(root);
    root.addEventListener("scroll", scheduleUpdate, { passive: true });
    updateScene();

    return () => {
      root.removeEventListener("scroll", scheduleUpdate);
      resizeObserver.disconnect();
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const root = scrollRef.current;
    if (!root) return;

    const section = requestedSection ?? activeRef.current;
    const target = Math.max(
      0,
      layerPositions[sectionLayer[section]] - layerPositions[startLayers],
    );
    root.scrollTop = target;
  }, [active, requestedSection]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && active && !modalOpen) setNavOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [active, modalOpen]);

  useEffect(() => {
    if (!modalOpen) return;

    const returnTarget = lastFocusedRef.current;
    const focusTimer = window.setTimeout(() => modalCloseRef.current?.focus(), 0);
    const keepFocusInside = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedWork(null);
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = Array.from(
        modalRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])") ?? [],
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", keepFocusInside);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", keepFocusInside);
      returnTarget?.focus();
    };
  }, [modalOpen]);

  const goToSection = (section: SectionId) => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = Math.max(
      0,
      layerPositions[sectionLayer[section]] - layerPositions[startLayers],
    );
    scrollRef.current?.scrollTo({ top: target, behavior: reduceMotion ? "auto" : "smooth" });
    window.history.replaceState(null, "", "#" + section);
    setNavOpen(false);
  };

  const openWork = (work: number, button: HTMLButtonElement) => {
    lastFocusedRef.current = button;
    setSelectedWork(work);
  };

  return (
    <section
      className="mode-pane archive-pane"
      aria-label="Plugin archive"
      aria-hidden={!active}
      hidden={!active}
      inert={!active}
    >
      <button
        className="archive-home-button"
        ref={homeButtonRef}
        type="button"
        aria-label="Back to plugin home"
        inert={modalOpen}
        onClick={onExit}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      <header
        className={"capsule-nav " + (navOpen ? "is-open" : "")}
        inert={modalOpen}
        aria-hidden={modalOpen}
      >
        <button
          className="island-toggle"
          type="button"
          aria-label={navOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={navOpen}
          onClick={() => setNavOpen((open) => !open)}
        >
          <span className="capsule-mark" aria-hidden="true" />
          <span className="capsule-sensor" aria-hidden="true" />
          <span className="capsule-dot" aria-hidden="true" />
        </button>
        {navOpen && (
          <nav className="island-dots" aria-label="Plugin navigation">
            {sectionIds.map((section) => (
              <button
                key={section}
                className="island-nav-dot"
                data-active={activeSection === section}
                type="button"
                aria-label={"Go to the " + section + " section"}
                aria-current={activeSection === section ? "true" : undefined}
                onClick={() => goToSection(section)}
              />
            ))}
          </nav>
        )}
      </header>

      <div className="device-scroll" ref={scrollRef} inert={modalOpen} aria-hidden={modalOpen}>
        <div
          className="scroll-track"
          style={{ height: "calc(var(--device-h) + " + maxScroll + "px)" }}
        >
          <div className="depth-stage">
            {layers.map((layer, index) => {
              const work = works[layer.work];

              return (
                <div
                  className={"archive-layer " + layer.shape}
                  data-kind="image"
                  data-section={layer.section}
                  key={layer.section}
                  ref={(node) => {
                    layerRefs.current[index] = node;
                  }}
                >
                  {work.detailHref ? (
                    <a
                      className="layer-image-button layer-detail-link"
                      href={work.detailHref}
                      aria-label={"View details for " + work.alt}
                    >
                      <img className={layer.crop} src={work.src} alt={work.alt} />
                    </a>
                  ) : (
                    <button
                      className="layer-image-button"
                      type="button"
                      aria-label={"Enlarge " + work.alt}
                      onClick={(event) => openWork(layer.work, event.currentTarget)}
                    >
                      <img className={layer.crop} src={work.src} alt={work.alt} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedWork !== null && (
        <div
          className="work-modal"
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label={works[selectedWork].alt}
        >
          <button
            className="modal-close"
            ref={modalCloseRef}
            type="button"
            aria-label="Close"
            onClick={() => setSelectedWork(null)}
          >
            <span />
            <span />
          </button>
          <img src={works[selectedWork].src} alt={works[selectedWork].alt} />
          <div className="modal-pips" aria-label="Choose a plugin">
            {works.map((work, index) => (
              <button
                type="button"
                key={work.src}
                aria-label={"Show " + work.alt}
                data-active={selectedWork === index}
                onClick={() => setSelectedWork(index)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
