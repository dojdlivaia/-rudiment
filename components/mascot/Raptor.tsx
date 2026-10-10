"use client";

import { motion } from "framer-motion";
import { EASING, DUR } from "@/lib/motion";

/**
 * Маскот — раптор «Руди». Рисованный SVG: тонкие линии + заливка (Kurzgesagt-стиль).
 * Мигает каждые ~4.5с; `mood` меняет позу/выражение:
 *  - idle    : спокойно наблюдает
 *  - alert   : заметил якорь/цифру — навострился, хвост поднялся
 *  - smug    : «я же говорил» (после совестливого ответа)
 *  - facepaw : лапа ко лбу (раптор победил)
 */

export type RaptorMood = "idle" | "alert" | "smug" | "facepaw";

interface Props {
  mood?: RaptorMood;
  size?: number;
  className?: string;
  /** Отключить мигание (для статичных мест) */
  still?: boolean;
}

const INK = "#1F1B16";
const BODY = "#D97742";
const BELLY = "#F2A97B";
const CREAM = "#FAF8F3";

export default function Raptor({ mood = "idle", size = 160, className, still }: Props) {
  const headTilt = mood === "alert" ? -8 : mood === "smug" ? 4 : mood === "facepaw" ? 12 : 0;
  const tailLift = mood === "alert" ? -14 : mood === "smug" ? -6 : 0;

  return (
    <motion.svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      aria-label={`Раптор Руди, настроение: ${mood}`}
      role="img"
      animate={{ y: mood === "alert" ? -4 : 0 }}
      transition={{ duration: DUR.base, ease: EASING }}
    >
      {/* Хвост */}
      <motion.g
        animate={{ rotate: tailLift, originX: 60, originY: 150 }}
        transition={{ duration: DUR.base, ease: EASING }}
      >
        <path
          d="M62 148 Q 20 150 8 122 Q 30 132 46 132 Q 34 120 28 104 Q 48 124 62 132 Z"
          fill={BODY}
          stroke={INK}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </motion.g>

      {/* Тело */}
      <path
        d="M60 150 Q 55 105 85 82 Q 115 62 140 78 Q 160 92 152 122 Q 146 148 118 156 Q 85 162 60 150 Z"
        fill={BODY}
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Брюхо */}
      <path
        d="M92 152 Q 88 120 108 100 Q 128 84 142 96 Q 150 112 140 134 Q 128 152 108 156 Z"
        fill={BELLY}
        stroke={INK}
        strokeWidth="2"
        opacity="0.9"
      />

      {/* Ноги */}
      <path d="M96 156 L 92 184 M 92 184 L 80 190 M 92 184 L 92 192 M 92 184 L 102 190" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M126 154 L 130 182 M 130 182 L 118 188 M 130 182 L 130 190 M 130 182 L 140 188" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Маленькие лапы-руки */}
      <motion.g
        animate={
          mood === "facepaw"
            ? { rotate: -120, x: 14, y: -34 }
            : mood === "smug"
              ? { rotate: -20 }
              : { rotate: 0 }
        }
        transition={{ duration: DUR.base, ease: EASING }}
      >
        <path d="M120 112 Q 132 118 136 128 M 136 128 L 142 126 M 136 128 L 141 133" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
      </motion.g>

      {/* Голова (наклоняется) */}
      <motion.g
        animate={{ rotate: headTilt, originX: 120, originY: 70 }}
        transition={{ duration: DUR.base, ease: EASING }}
      >
        <path
          d="M104 76 Q 96 52 116 38 Q 140 24 162 38 Q 176 48 172 62 L 190 68 Q 196 72 190 76 L 168 78 Q 150 92 126 88 Q 110 86 104 76 Z"
          fill={BODY}
          stroke={INK}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Клюв/челюсть */}
        <path d="M168 66 Q 182 66 190 72" stroke={INK} strokeWidth="2" fill="none" />

        {/* Гребень на голове — «перо» */}
        <path d="M118 36 Q 112 24 122 16 Q 124 28 132 32" fill={CREAM} stroke={INK} strokeWidth="2" strokeLinejoin="round" />

        {/* Глаз с миганием */}
        <g transform="translate(146 50)">
          <motion.g
            animate={still ? undefined : { scaleY: [1, 1, 0.08, 1] }}
            transition={{
              duration: 0.35,
              times: [0, 0.9, 0.95, 1],
              repeat: Infinity,
              repeatDelay: 4.15,
              ease: EASING,
            }}
            style={{ transformOrigin: "center" }}
          >
            <circle r="9" fill={CREAM} stroke={INK} strokeWidth="2.5" />
            <motion.circle
              r="4"
              cx={mood === "alert" ? 2 : 0}
              cy={mood === "facepaw" ? 1 : 0}
              fill={INK}
              animate={{ r: mood === "alert" ? 5 : 4 }}
              transition={{ duration: DUR.fast, ease: EASING }}
            />
            <circle r="1.4" cx={mood === "alert" ? 3.5 : 1.5} cy={-2} fill={CREAM} />
          </motion.g>
          {/* Бровь: удивлённая при alert, довольная при smug */}
          <motion.path
            animate={{
              d:
                mood === "alert"
                  ? "M -10 -14 Q 0 -20 10 -14"
                  : mood === "smug"
                    ? "M -10 -12 Q 0 -16 10 -10"
                    : "M -10 -13 Q 0 -17 10 -13",
            }}
            transition={{ duration: DUR.base, ease: EASING }}
            stroke={INK}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      </motion.g>

      {/* Пыль под ногами при alert */}
      {mood === "alert" && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: DUR.fast }}>
          <circle cx="76" cy="192" r="2.5" fill={INK} opacity="0.35" />
          <circle cx="146" cy="192" r="2" fill={INK} opacity="0.3" />
        </motion.g>
      )}
    </motion.svg>
  );
}

/** Реплика раптора в облачке */
export function RaptorSpeech({ children, mood = "idle" }: { children: React.ReactNode; mood?: RaptorMood }) {
  return (
    <div className="flex items-end gap-3">
      <Raptor mood={mood} size={72} className="shrink-0" />
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: DUR.base, ease: EASING }}
        className="relative rounded-card bg-surface px-4 py-3 text-sm text-ink-soft shadow-soft"
      >
        {children}
        <span className="absolute -left-1.5 bottom-4 h-3 w-3 rotate-45 border-b border-l border-sand-200 bg-surface" />
      </motion.div>
    </div>
  );
}
