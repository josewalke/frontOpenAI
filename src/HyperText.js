"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const DEFAULT_CHARACTER_SET = "01".split("");

const getRandomInt = (max) => Math.floor(Math.random() * max);

export function HyperText({
  children,
  className,
  baseDuration = 600,
  delay = 0,
  as: Component = "div",
  startOnView = false,
  animateOnHover = false,
  characterSet = DEFAULT_CHARACTER_SET,
  ...props
}) {
  const MotionComponent = motion.create(Component, {
    forwardMotionProps: true,
  });

  const [displayText, setDisplayText] = useState(() => children.split(""));
  const [isAnimating, setIsAnimating] = useState(false);
  const iterationCount = useRef(0);
  const elementRef = useRef(null);

  const messageLength = children.length;

  let duration;
  if (messageLength < 10) {
    duration = baseDuration;
  } else if (messageLength < 30) {
    duration = baseDuration * 0.6;
  } else if (messageLength < 50) {
    duration = baseDuration * 0.4;
  } else {
    duration = baseDuration * 0.25;
  }

  const handleAnimationTrigger = () => {
    if (animateOnHover && !isAnimating) {
      iterationCount.current = 0;
      setIsAnimating(true);
    }
  };

  useEffect(() => {
    if (!startOnView) {
      const startTimeout = setTimeout(() => {
        setIsAnimating(true);
      }, delay);
      return () => clearTimeout(startTimeout);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsAnimating(true);
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "-30% 0px -30% 0px" }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [delay, startOnView]);

  useEffect(() => {
    if (!isAnimating) return;

    const intervalDuration = duration / (messageLength * 2);
    const maxIterations = messageLength * 1.5;

    const interval = setInterval(() => {
      if (iterationCount.current < maxIterations) {
        setDisplayText((currentText) =>
          currentText.map((letter, index) =>
            letter === " "
              ? letter
              : index <= iterationCount.current
              ? children[index]
              : characterSet[getRandomInt(characterSet.length)]
          )
        );

        if (messageLength < 10) {
          iterationCount.current += 0.2;
        } else if (messageLength < 30) {
          iterationCount.current += 0.2;
        } else if (messageLength < 50) {
          iterationCount.current += 1;
        } else {
          iterationCount.current += 2.2;
        }
      } else {
        setDisplayText(children.split(""));
        setIsAnimating(false);
        clearInterval(interval);
      }
    }, intervalDuration);

    return () => clearInterval(interval);
  }, [children, duration, isAnimating, characterSet]);

  return (
    <MotionComponent
      ref={elementRef}
      className={`overflow-hidden py-2 text-4xl font-bold ${className}`}
      onMouseEnter={handleAnimationTrigger}
      {...props}
    >
      <AnimatePresence>
        {displayText.map((letter, index) => (
          <motion.span
            key={index}
            style={{
              display: "inline",
              letterSpacing: "normal", // 🔹 Evita separación excesiva
              wordSpacing: "normal", // 🔹 Previene separación extra entre palabras
            }}
          >
            {letter}
          </motion.span>
        ))}
      </AnimatePresence>
    </MotionComponent>
  );
}
