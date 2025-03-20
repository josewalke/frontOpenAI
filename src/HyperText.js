"use client"; // 📌 Indica que este componente se ejecutará en el cliente en un entorno Next.js

import { AnimatePresence, motion } from "motion/react"; // 📌 Importa Motion para animaciones
import { useEffect, useRef, useState } from "react";

// 📌 Conjunto de caracteres aleatorios predeterminados para la animación (efecto de texto glitch)
const DEFAULT_CHARACTER_SET = "01".split("");

// 📌 Función para obtener un número aleatorio dentro de un rango
const getRandomInt = (max) => Math.floor(Math.random() * max);

// 📌 Componente `HyperText` que muestra un texto con una animación de efecto glitch
export function HyperText({
  children, // 📌 Texto a animar
  className, // 📌 Clases personalizadas opcionales
  baseDuration = 600, // 📌 Duración base de la animación en milisegundos
  delay = 0, // 📌 Retraso antes de iniciar la animación
  as: Component = "div", // 📌 Tipo de elemento HTML a renderizar (por defecto es un `div`)
  startOnView = false, // 📌 Define si la animación inicia cuando el elemento entra en el viewport
  animateOnHover = false, // 📌 Define si la animación se activa al pasar el cursor sobre el texto
  characterSet = DEFAULT_CHARACTER_SET, // 📌 Conjunto de caracteres usados en la animación
  ...props // 📌 Propiedades adicionales que se pueden pasar al componente
}) {
  // 📌 Crea un componente Motion basado en el tipo de `Component` proporcionado
  const MotionComponent = motion.create(Component, {
    forwardMotionProps: true,
  });

  const [displayText, setDisplayText] = useState(() => children.split("")); // 📌 Estado para almacenar el texto animado
  const [isAnimating, setIsAnimating] = useState(false); // 📌 Estado para controlar si la animación está en curso
  const iterationCount = useRef(0); // 📌 Contador de iteraciones de la animación
  const elementRef = useRef(null); // 📌 Referencia al elemento HTML para la detección de viewport

  const messageLength = children.length; // 📌 Longitud del texto original

  // 📌 Calcula la duración de la animación según la longitud del mensaje
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

  // 📌 Función para activar la animación al pasar el mouse
  const handleAnimationTrigger = () => {
    if (animateOnHover && !isAnimating) {
      iterationCount.current = 0;
      setIsAnimating(true);
    }
  };

  // 📌 Efecto que inicia la animación basado en `startOnView` o `delay`
  useEffect(() => {
    if (!startOnView) {
      const startTimeout = setTimeout(() => {
        setIsAnimating(true);
      }, delay);
      return () => clearTimeout(startTimeout);
    }

    // 📌 Observador para detectar cuando el elemento entra en la vista del usuario
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsAnimating(true);
          }, delay);
          observer.disconnect(); // 📌 Detiene la observación después de activar la animación
        }
      },
      { threshold: 0.1, rootMargin: "-30% 0px -30% 0px" } // 📌 Ajusta la detección en el viewport
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [delay, startOnView]);

  // 📌 Efecto que maneja la animación del texto tipo glitch
  useEffect(() => {
    if (!isAnimating) return;

    const intervalDuration = duration / (messageLength * 2); // 📌 Calcula el tiempo entre iteraciones
    const maxIterations = messageLength * 1.5; // 📌 Determina el número total de iteraciones de la animación

    const interval = setInterval(() => {
      if (iterationCount.current < maxIterations) {
        setDisplayText((currentText) =>
          currentText.map((letter, index) =>
            letter === " " // 📌 Mantiene los espacios sin cambios
              ? letter
              : index <= iterationCount.current
              ? children[index] // 📌 Si ha pasado el tiempo suficiente, muestra la letra real
              : characterSet[getRandomInt(characterSet.length)] // 📌 De lo contrario, muestra un carácter aleatorio
          )
        );

        // 📌 Ajusta la velocidad de iteración dependiendo del tamaño del mensaje
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
        // 📌 Cuando la animación termina, muestra el mensaje original
        setDisplayText(children.split(""));
        setIsAnimating(false);
        clearInterval(interval);
      }
    }, intervalDuration);

    return () => clearInterval(interval); // 📌 Limpia el intervalo cuando la animación termina
  }, [children, duration, isAnimating, characterSet]);

  return (
    <MotionComponent
      ref={elementRef} // 📌 Asigna la referencia al elemento para la detección en viewport
      className={`overflow-hidden py-2 text-4xl font-bold ${className}`} // 📌 Estilos básicos
      onMouseEnter={handleAnimationTrigger} // 📌 Activa la animación al pasar el cursor (si está habilitado)
      {...props}
    >
      <AnimatePresence>
        {displayText.map((letter, index) => (
          <motion.span
            key={index}
            style={{
              display: "inline", // 📌 Mantiene los caracteres en línea
              letterSpacing: "normal", // 📌 Evita separación excesiva
              wordSpacing: "normal", // 📌 Previene separación extra entre palabras
            }}
          >
            {letter}
          </motion.span>
        ))}
      </AnimatePresence>
    </MotionComponent>
  );
}
