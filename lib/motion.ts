/**
 * Motion-токены «Рудимента».
 * Единая система длительностей и easing для всех анимаций (Framer Motion + CSS).
 */
export const EASING = [0.4, 0, 0.2, 1] as const;

export const DUR = {
  fast: 0.15, // 150ms — hover, нажатия, мелкие переходы
  base: 0.25, // 250ms — появление элементов, смена состояний
  slow: 0.5, // 500ms — крупные переходы, анимация графиков
} as const;

export const transition = {
  fast: { duration: DUR.fast, ease: EASING },
  base: { duration: DUR.base, ease: EASING },
  slow: { duration: DUR.slow, ease: EASING },
} as const;

/* Variants для Framer Motion */

export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: transition.base },
  exit: { opacity: 0, y: -8, transition: transition.fast },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: transition.base },
  exit: { opacity: 0, transition: transition.fast },
};

export const staggerParent = {
  animate: { transition: { staggerChildren: 0.08 } },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: transition.base },
};
