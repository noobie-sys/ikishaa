import type { MotionProps } from "framer-motion";

export const revealMotion: MotionProps = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-10% 0px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
};
