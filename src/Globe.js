"use client";

import createGlobe from "cobe"; // 🔹 Importamos correctamente la librería cobe para renderizar el globo
import { useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef } from "react";

// 🎯 Configuración global del globo
const MOVEMENT_DAMPING = 1400; // 🔹 Factor de amortiguación para suavizar la interacción del usuario
const GLOBE_CONFIG = {
  width: 800, // 🔹 Ancho inicial del globo (se ajustará dinámicamente)
  height: 800, // 🔹 Altura inicial del globo (se ajustará dinámicamente)
  devicePixelRatio: 2, // 🔹 Asegura alta calidad en pantallas retina
  phi: 0, // 🔹 Ángulo horizontal inicial
  theta: 0.3, // 🔹 Ángulo vertical inicial
  dark: 0, // 🔹 0 = modo claro, 1 = modo oscuro
  diffuse: 0.4, // 🔹 Control de la dispersión de la luz en el globo
  mapSamples: 16000, // 🔹 Resolución del mapa del globo (mayor número = mayor detalle)
  mapBrightness: 1.2, // 🔹 Ajusta el brillo del mapa base
  baseColor: [1, 1, 1], // 🔹 Color base del globo (blanco)
  markerColor: [251 / 255, 100 / 255, 21 / 255], // 🔹 Color de los marcadores en formato RGB normalizado
  glowColor: [1, 1, 1], // 🔹 Color de resplandor del globo
  markers: [
    { location: [14.5995, 120.9842], size: 0.03 }, // Manila, Filipinas
    { location: [19.076, 72.8777], size: 0.1 }, // Mumbai, India
    { location: [23.8103, 90.4125], size: 0.05 }, // Dhaka, Bangladesh
    { location: [30.0444, 31.2357], size: 0.07 }, // El Cairo, Egipto
    { location: [39.9042, 116.4074], size: 0.08 }, // Beijing, China
    { location: [-23.5505, -46.6333], size: 0.1 }, // São Paulo, Brasil
    { location: [19.4326, -99.1332], size: 0.1 }, // Ciudad de México
    { location: [40.7128, -74.006], size: 0.1 }, // Nueva York, EE.UU.
    { location: [34.6937, 135.5022], size: 0.05 }, // Osaka, Japón
    { location: [41.0082, 28.9784], size: 0.06 }, // Estambul, Turquía
  ],
};

// 🌍 Componente Globe: Renderiza el globo interactivo
export function Globe({ className, config = GLOBE_CONFIG }) {
  let phi = 0; // 🔹 Ángulo horizontal del globo
  let width = 0; // 🔹 Ancho dinámico del globo
  const canvasRef = useRef(null); // 🔹 Referencia al canvas donde se renderiza el globo
  const pointerInteracting = useRef(null); // 🔹 Indica si el usuario está interactuando con el globo
  const pointerInteractionMovement = useRef(0); // 🔹 Guarda el movimiento del usuario

  // 🟢 Valores reactivos para la animación
  const r = useMotionValue(0);
  const rs = useSpring(r, {
    mass: 1,
    damping: 30, // 🔹 Suaviza los movimientos del globo
    stiffness: 100, // 🔹 Controla la velocidad de respuesta del globo
  });

  useEffect(() => {
    // 🟢 Función para actualizar el tamaño del globo dinámicamente
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };

    window.addEventListener("resize", onResize); // 🔹 Detecta cambios en el tamaño de la pantalla
    onResize();

    // 🟢 Inicialización del globo
    const globe = createGlobe(canvasRef.current, {
      ...config,
      width: width * 2, // 🔹 Doble del tamaño real para mayor calidad en pantallas retina
      height: width * 2,
      onRender: (state) => {
        if (!pointerInteracting.current) phi += 0.005; // 🔹 Rotación automática del globo
        state.phi = phi + rs.get(); // 🔹 Ajusta la rotación del globo con la interacción del usuario
        state.width = width * 2;
        state.height = width * 2;
      },
    });

    // 🔹 Hace que el globo aparezca suavemente
    setTimeout(() => (canvasRef.current.style.opacity = "1"), 0);

    return () => {
      globe.destroy(); // 🔹 Elimina el globo al desmontar el componente
      window.removeEventListener("resize", onResize);
    };
  }, [rs, config]);

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center w-full h-full overflow-hidden z-[-1] ${className || ""}`}
    >
      {/* 🔹 Lienzo del globo con tamaño de pantalla completa */}
      <canvas
        ref={canvasRef}
        style={{
          width: "100vw", // 🔹 Ocupar todo el ancho de la ventana
          height: "100vh", // 🔹 Ocupar todo el alto de la ventana
          position: "absolute", // 🔹 Se posiciona de fondo
          top: "0",
          left: "0",
          zIndex: "-1", // 🔹 Para que quede detrás del contenido
        }}
      />
    </div>
  );
}
