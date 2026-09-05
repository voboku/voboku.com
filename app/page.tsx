"use client";

import { useEffect, useRef, useState } from "react";
import { pluginWorks as works, seedSeries } from "./_data/plugins";
import { webApplications } from "./_data/web-instruments";

type Phase = "checking" | "locked" | "passcode" | "home";

type Clock = {
  time: string;
  date: string;
};

const passcodeLength = 6;
const lockPasscode = "200101";
const unlockStorageKey = "sound-objects-unlocked-v1";
const seedMemberIds = new Set<string>(
  seedSeries.members.map((member) => member.id),
);
const homeWorks = works.filter(
  (work) => work.detailHref !== null && !seedMemberIds.has(work.id),
);
const keypad = [
  { digit: "1", letters: "" },
  { digit: "2", letters: "ABC" },
  { digit: "3", letters: "DEF" },
  { digit: "4", letters: "GHI" },
  { digit: "5", letters: "JKL" },
  { digit: "6", letters: "MNO" },
  { digit: "7", letters: "PQRS" },
  { digit: "8", letters: "TUV" },
  { digit: "9", letters: "WXYZ" },
] as const;

function readClock(): Clock {
  const now = new Date();
  return {
    time: new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .format(now)
      .replace(/^0/, ""),
    date: new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(now),
  };
}

type LockScreenProps = {
  clock: Clock;
  openButtonRef: React.RefObject<HTMLButtonElement | null>;
  onOpen: () => void;
  onPointerStart: (clientY: number) => void;
  onPointerEnd: (clientY: number) => void;
  onPointerCancel: () => void;
};

function PhoneChrome() {
  return (
    <>
      <span className="os-island lock-island" aria-hidden="true" />
      <span className="lock-status-icons" aria-hidden="true">
        <i />
        <i />
        <i />
        <em />
        <b />
      </span>
    </>
  );
}

function LockScreen({
  clock,
  openButtonRef,
  onOpen,
  onPointerStart,
  onPointerEnd,
  onPointerCancel,
}: LockScreenProps) {
  return (
    <section
      className="mode-pane lock-screen"
      aria-label="Sound Objects lock screen"
      onPointerDown={(event) => onPointerStart(event.clientY)}
      onPointerUp={(event) => onPointerEnd(event.clientY)}
      onPointerCancel={onPointerCancel}
    >
      <PhoneChrome />
      <svg
        className="lock-glyph"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M7.8 10V7.6a4.2 4.2 0 0 1 8.4 0V10" />
        <rect x="5.7" y="9.5" width="12.6" height="10.2" rx="3" />
      </svg>
      <div className="lock-clock">
        <p>{clock.date}</p>
        <time dateTime={clock.time}>{clock.time}</time>
      </div>

      <div className="lock-utilities" aria-hidden="true">
        <span className="lock-utility flashlight-symbol"><i /></span>
        <span className="lock-utility camera-symbol"><i /></span>
      </div>

      <button
        className="open-passcode"
        type="button"
        ref={openButtonRef}
        onClick={onOpen}
        aria-label="Open passcode entry"
      >
        <span aria-hidden="true" />
        Swipe up to open
      </button>
      <span className="home-indicator" aria-hidden="true" />
    </section>
  );
}

type PasscodeScreenProps = {
  clock: Clock;
  digitsEntered: number;
  error: boolean;
  headingRef: React.RefObject<HTMLParagraphElement | null>;
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onCancel: () => void;
};

function PasscodeScreen({
  clock,
  digitsEntered,
  error,
  headingRef,
  onDigit,
  onDelete,
  onCancel,
}: PasscodeScreenProps) {
  const screenRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        const buttons = Array.from(
          screenRef.current?.querySelectorAll<HTMLButtonElement>(
            "button:not([disabled])",
          ) ?? [],
        );
        const firstButton = buttons[0];
        const lastButton = buttons.at(-1);
        const activeElement = document.activeElement;

        if (
          event.shiftKey &&
          (activeElement === headingRef.current || activeElement === firstButton)
        ) {
          event.preventDefault();
          lastButton?.focus();
          return;
        }

        if (!event.shiftKey && activeElement === lastButton) {
          event.preventDefault();
          firstButton?.focus();
          return;
        }
      }

      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        onDigit(event.key);
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        onDelete();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [headingRef, onCancel, onDelete, onDigit]);

  return (
    <section
      className="mode-pane passcode-screen"
      ref={screenRef}
      role="dialog"
      aria-modal="true"
      aria-label="Sound Objects passcode screen"
    >
      <PhoneChrome />
      <time className="passcode-status-time" aria-hidden="true">
        {clock.time}
      </time>
      <div
        className="passcode-panel"
        data-error={error}
        aria-labelledby="passcode-title"
      >
        <p id="passcode-title" ref={headingRef} tabIndex={-1}>
          Enter Passcode
        </p>
        <div
          className="passcode-dots"
          role="status"
          aria-live="polite"
          aria-label={`${digitsEntered} of ${passcodeLength} digits entered`}
        >
          {Array.from({ length: passcodeLength }, (_, index) => (
            <span data-filled={index < digitsEntered} key={index} />
          ))}
        </div>
        <p className="passcode-error" aria-live="polite">
          {error ? "Incorrect passcode" : ""}
        </p>

        <div
          className="passcode-keypad"
          role="group"
          aria-label="Passcode keypad"
        >
          {keypad.map((key) => (
            <button
              type="button"
              aria-label={key.digit}
              onClick={() => onDigit(key.digit)}
              key={key.digit}
            >
              <strong>{key.digit}</strong>
              <small>{key.letters}</small>
            </button>
          ))}
          <span aria-hidden="true" />
          <button type="button" aria-label="0" onClick={() => onDigit("0")}>
            <strong>0</strong>
            <small>&nbsp;</small>
          </button>
          <span aria-hidden="true" />
        </div>
      </div>

      <div className="passcode-actions">
        <span aria-hidden="true">Emergency</span>
        <button
          type="button"
          onClick={digitsEntered === 0 ? onCancel : onDelete}
        >
          {digitsEntered === 0 ? "Cancel" : "Delete"}
        </button>
      </div>
      <span className="home-indicator" aria-hidden="true" />
    </section>
  );
}

type PluginHomeProps = {
  active: boolean;
  clock: Clock;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onLock: (restoreFocus: boolean) => void;
};

function PluginHome({ active, clock, headingRef, onLock }: PluginHomeProps) {
  return (
    <section
      className="mode-pane plugin-home"
      aria-label="Sound Objects plugin home"
      aria-hidden={!active}
      hidden={!active}
      inert={!active}
    >
      <header className="home-status">
        <time aria-hidden="true">{clock.time}</time>
        <button
          className="home-lock-button"
          type="button"
          onClick={(event) => onLock(event.detail === 0)}
          aria-label="Lock Sound Objects"
        >
          <span className="os-island home-island" aria-hidden="true">
            <span className="home-lock-glyph" />
          </span>
        </button>
        <span className="status-signal" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </header>

      <div className="home-scroll">
        <h1 className="home-title" ref={headingRef} tabIndex={-1}>
          Sound Objects
        </h1>

        <nav className="plugin-apps" aria-label="Available sound objects">
          <a
            className="plugin-app"
            href={seedSeries.href}
            aria-label="Open SEED series"
          >
            <span
              className="plugin-app-icon seed-folder-icon"
              aria-hidden="true"
            >
              {seedSeries.members.slice(0, 4).map((member) => (
                <img src={member.visual} alt="" key={member.id} />
              ))}
            </span>
            <span>{seedSeries.name}</span>
          </a>

          {homeWorks.map((work) => (
            <a
              className="plugin-app"
              href={work.detailHref ?? "/"}
              aria-label={"Open " + work.name}
              key={work.id}
            >
              <span className="plugin-app-icon">
                <img src={work.iconSrc} alt="" />
              </span>
              <span>{work.name}</span>
            </a>
          ))}

          <a
            className="plugin-app"
            href={webApplications.href}
            aria-label="Open web applications"
          >
            <span
              className="plugin-app-icon web-applications-folder-icon"
              aria-hidden="true"
            >
              {webApplications.members.map((instrument) => (
                <img
                  src={instrument.iconSrc}
                  alt=""
                  data-instrument={instrument.id}
                  key={instrument.id}
                />
              ))}
            </span>
            <span>{webApplications.name}</span>
          </a>
        </nav>
      </div>
    </section>
  );
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>("checking");
  const [clock, setClock] = useState<Clock>({ time: "10:00", date: "Sound Objects" });
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);
  const pointerStartYRef = useRef<number | null>(null);
  const wrongPasscodeTimerRef = useRef<number | null>(null);
  const passcodeHeadingRef = useRef<HTMLParagraphElement>(null);
  const lockScreenOpenRef = useRef<HTMLButtonElement>(null);
  const homeHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const updateClock = () => setClock(readClock());
    updateClock();
    const clockTimer = window.setInterval(updateClock, 30_000);

    return () => {
      window.clearInterval(clockTimer);
    };
  }, []);

  useEffect(() => {
    const storageCheckFrame = window.requestAnimationFrame(() => {
      try {
        setPhase(
          window.localStorage.getItem(unlockStorageKey) === "1"
            ? "home"
            : "locked",
        );
      } catch {
        setPhase("locked");
      }
    });

    return () => window.cancelAnimationFrame(storageCheckFrame);
  }, []);

  useEffect(() => {
    if (phase === "passcode") {
      window.requestAnimationFrame(() => passcodeHeadingRef.current?.focus());
    }
  }, [phase]);

  useEffect(
    () => () => {
      if (wrongPasscodeTimerRef.current !== null) {
        window.clearTimeout(wrongPasscodeTimerRef.current);
      }
    },
    [],
  );

  const clearWrongPasscodeTimer = () => {
    if (wrongPasscodeTimerRef.current !== null) {
      window.clearTimeout(wrongPasscodeTimerRef.current);
      wrongPasscodeTimerRef.current = null;
    }
  };

  const openPasscode = () => {
    clearWrongPasscodeTimer();
    setPasscode("");
    setPasscodeError(false);
    setPhase("passcode");
  };

  const cancelPasscode = () => {
    clearWrongPasscodeTimer();
    setPasscode("");
    setPasscodeError(false);
    setPhase("locked");
  };

  const startSwipe = (clientY: number) => {
    pointerStartYRef.current = clientY;
  };

  const finishSwipe = (clientY: number) => {
    const startY = pointerStartYRef.current;
    pointerStartYRef.current = null;

    if (startY !== null && startY - clientY >= 42) {
      openPasscode();
    }
  };

  const cancelSwipe = () => {
    pointerStartYRef.current = null;
  };

  const unlock = () => {
    clearWrongPasscodeTimer();
    setPasscode("");
    setPasscodeError(false);
    try {
      window.localStorage.setItem(unlockStorageKey, "1");
    } catch {
      // The current visit still unlocks when browser storage is unavailable.
    }
    setPhase("home");
    window.requestAnimationFrame(() => homeHeadingRef.current?.focus());
  };

  const relock = (restoreFocus: boolean) => {
    clearWrongPasscodeTimer();
    pointerStartYRef.current = null;
    setPasscode("");
    setPasscodeError(false);
    try {
      window.localStorage.removeItem(unlockStorageKey);
    } catch {
      // The current visit still locks when browser storage is unavailable.
    }
    setPhase("locked");
    if (restoreFocus) {
      window.requestAnimationFrame(() => lockScreenOpenRef.current?.focus());
    }
  };

  const enterDigit = (digit: string) => {
    if (passcode.length >= passcodeLength) {
      return;
    }

    setPasscodeError(false);
    const nextPasscode = (passcode + digit).slice(0, passcodeLength);

    if (nextPasscode.length < passcodeLength) {
      setPasscode(nextPasscode);
      return;
    }

    if (nextPasscode === lockPasscode) {
      unlock();
      return;
    }

    setPasscode(nextPasscode);
    setPasscodeError(true);
    wrongPasscodeTimerRef.current = window.setTimeout(() => {
      setPasscode("");
      wrongPasscodeTimerRef.current = null;
    }, 340);
  };

  const deleteDigit = () => {
    if (passcode.length >= passcodeLength && passcodeError) {
      return;
    }

    setPasscodeError(false);
    setPasscode((current) => current.slice(0, -1));
  };

  return (
    <main className="site-shell">
      <section
        className="device os-device"
        aria-label="Sound Objects"
        aria-busy={phase === "checking" ? true : undefined}
      >
        <PluginHome
          active={phase === "home"}
          clock={clock}
          headingRef={homeHeadingRef}
          onLock={relock}
        />

        {phase === "locked" ? (
          <LockScreen
            clock={clock}
            openButtonRef={lockScreenOpenRef}
            onOpen={openPasscode}
            onPointerStart={startSwipe}
            onPointerEnd={finishSwipe}
            onPointerCancel={cancelSwipe}
          />
        ) : null}

        {phase === "passcode" ? (
          <PasscodeScreen
            clock={clock}
            digitsEntered={passcode.length}
            error={passcodeError}
            headingRef={passcodeHeadingRef}
            onDigit={enterDigit}
            onDelete={deleteDigit}
            onCancel={cancelPasscode}
          />
        ) : null}
      </section>
    </main>
  );
}
