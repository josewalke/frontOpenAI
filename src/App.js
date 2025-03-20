import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { AnimatedList, AnimatedListItem } from "./AnimatedList";
import { HyperText } from "./HyperText";
import { Globe } from "./Globe";
import GlobalStyles from "./GlobalStyles";

// 📌 Fondo animado del chat con un globo terráqueo interactivo.
const GlobeBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1; /* Coloca el fondo detrás del contenido */
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none; /* Evita que interfiera con eventos del usuario */
`;

// 📌 Contenedor principal del chat
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: transparent;
  position: relative;
  padding: 20px;
  font-family: 'Arial', sans-serif;
  z-index: 1;
`;

// 📌 Contenedor donde se mostrarán los mensajes
const ChatContainer = styled.div`
  width: 90%;
  max-width: 1050px;
  height: 600px;
  overflow-y: auto;
  background-color: rgba(255, 255, 255, 0); /* Fondo transparente */
  backdrop-filter: blur(4px); /* Efecto de desenfoque */
  border-radius: 20px;
  border: 3px solid transparent;
  box-shadow: 0px 4px 15px rgba(247, 128, 10, 0.54); /* Efecto de sombra */
  display: flex;
  flex-direction: column;
  justify-content: flex-end; /* Los mensajes aparecen en la parte inferior */
  position: relative;
  padding: 10px;
  scroll-behavior: smooth; /* Desplazamiento suave */

  &::-webkit-scrollbar {
    display: none; /* Oculta la barra de desplazamiento en navegadores WebKit */
  }
  scrollbar-width: none; /* Oculta la barra de desplazamiento en Firefox */
`;

// 📌 Contenedor para cada mensaje
const MessageContainer = styled.div`
  display: flex;
  justify-content: ${(props) => (props.isUser ? "flex-end" : "flex-start")};
  width: 100%;
`;

// 📌 Estilos para el globo de chat
const MessageBubble = styled.div`
  display: inline-block;
  font-family: 'MiFuente', sans-serif;
  padding: 2px 16px;
  border-radius: 18px;
  max-width: 75%;
  align-self: ${(props) => (props.isUser ? "flex-end" : "flex-start")};
  margin: 8px 0;
  font-size: 16px;
  line-height: 1.4;
  text-align: ${(props) => (props.isUser ? "right" : "left")};
`;

// 📌 Contenedor para el área de entrada del usuario
const InputContainer = styled.div`
  display: flex;
  width: 90%;
  max-width: 850px;
  margin-top: 10px;
  font-family: 'MiFuente', sans-serif;
`;

// 📌 Campo de texto donde el usuario escribe su mensaje
const TextArea = styled.textarea`
  flex: 1;
  height: 50px;
  padding: 12px;
  border: 2px solid #ccc;
  border-radius: 8px;
  font-family: 'MiFuente', sans-serif;
  font-size: 16px;
  resize: none;
  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

// 📌 Botón para enviar el mensaje
const Button = styled.button`
  background-color: ${(props) => (props.disabled ? "#aaa" : "rgba(247, 128, 10, 0.74)")};
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-family: 'MiFuente', sans-serif;
  font-size: 16px;
  margin-left: 10px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: background-color 0.3s ease;
  &:hover {
    background-color: ${(props) => (props.disabled ? "#aaa" : "rgba(247, 128, 10, 0.91)")};
  }
`;

function App() {
  const [message, setMessage] = useState(""); // 📌 Estado para el mensaje actual
  const [messages, setMessages] = useState([]); // 📌 Estado que almacena todos los mensajes
  const [loading, setLoading] = useState(false); // 📌 Estado para mostrar si está procesando el mensaje
  const chatContainerRef = useRef(null); // 📌 Referencia para el contenedor del chat

  // 📌 Hace scroll automático hacia abajo cuando se actualiza la lista de mensajes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 📌 Envía un mensaje al servidor y recibe la respuesta
  const sendMessage = async () => {
    if (!message.trim()) return; // Evita enviar mensajes vacíos

    // Agrega el mensaje del usuario a la lista
    setMessages((prev) => [...prev, { text: message, isUser: true }]);
    setMessage(""); // Limpia el campo de entrada
    setLoading(true); // Activa el estado de carga

    try {
      // 📌 Enviar el mensaje al servidor
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      // 📌 Procesar la respuesta del servidor en tiempo real
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        aiResponse += decoder.decode(value);
      }

      // 📌 Agrega la respuesta del servidor con un pequeño retraso
      setTimeout(() => {
        setMessages((prev) => [...prev, { text: aiResponse.trim(), isUser: false }]);
      }, 50);
    } catch (error) {
      // 📌 En caso de error, muestra un mensaje de advertencia
      setMessages((prev) => [...prev, { text: "⚠️ Error al conectar con el servidor", isUser: false }]);
    }

    setLoading(false); // Desactiva el estado de carga
  };

  return (
    <>
      <GlobalStyles />
      {/* 📌 Fondo animado */}
      <GlobeBackground>
        <Globe />
      </GlobeBackground>
      
      <Container>
        {/* 📌 Contenedor de mensajes */}
        <ChatContainer ref={chatContainerRef}>
          <AnimatedList messages={messages.map((msg, index) => (
            <AnimatedListItem key={`${index}-${msg.text}`}>
              <MessageContainer isUser={msg.isUser}>
                <MessageBubble isUser={msg.isUser}>
                  <HyperText key={`${index}-${msg.text}`} duration={800} animateOnHover={false}>
                    {msg.text}
                  </HyperText>
                </MessageBubble>
              </MessageContainer>
            </AnimatedListItem>
          ))} />
        </ChatContainer>

        {/* 📌 Entrada de texto y botón de enviar */}
        <InputContainer>
          <TextArea 
            placeholder="Escribe un mensaje..." 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
          />
          <Button onClick={sendMessage} disabled={loading}>
            {loading ? "Enviando..." : "Enviar"}
          </Button>
        </InputContainer>
      </Container>
    </>
  );
}

export default App;
