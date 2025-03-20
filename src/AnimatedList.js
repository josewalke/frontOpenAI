"use client"; // 🔹 Indica que este código se ejecutará en el lado del cliente en Next.js

import { motion, AnimatePresence } from "motion/react";
import React, { useState, useEffect } from "react";

// 🔹 Componente que anima cada mensaje cuando aparece y desaparece
export function AnimatedListItem({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} // 🔹 Comienza con opacidad 0 y desplazado hacia abajo
      animate={{ opacity: 1, y: 0 }} // 🔹 Se anima a opacidad 1 y su posición normal
      exit={{ opacity: 0, y: -10 }} // 🔹 Se desvanece y se mueve hacia arriba al salir
      transition={{ duration: 0.3 }} // 🔹 Duración de la animación
      className="mx-auto w-full" // 🔹 Centra el elemento y ocupa todo el ancho disponible
    >
      {children}
    </motion.div>
  );
}

// 🔹 Componente que maneja la lista animada de mensajes
export const AnimatedList = ({ messages }) => {
  const [previousMessages, setPreviousMessages] = useState([]); // 🔹 Estado para almacenar mensajes previos

  useEffect(() => {
    setPreviousMessages(messages); // 🔹 Actualiza la lista cuando `messages` cambia
  }, [messages]);

  return (
    <div className="flex flex-col items-center gap-4"> {/* 🔹 Contenedor con diseño en columna */}
      <AnimatePresence>
        {previousMessages.map((msg, index) => (
          <motion.div
            key={index} // 🔹 Se usa `index` como clave, pero podría mejorarse con IDs únicos
            initial={index === previousMessages.length - 1 ? { opacity: 0, y: 10 } : {}} // 🔹 Solo el último mensaje tiene animación de entrada
            animate={{ opacity: 1, y: 0 }} // 🔹 Todos los mensajes animan a estado visible
            transition={{ duration: 0.3 }} // 🔹 Define la duración de la animación
          >
            {msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
