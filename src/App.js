// Importación de hooks de React y styled-components para estilos en línea
import { useState, useEffect, useRef } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { Globe } from "./Globe"; // Componente decorativo del fondo

// 🎨 Estilos globales aplicados a toda la aplicación
const GlobalStyles = createGlobalStyle`
  @font-face {
    font-family: 'MiFuente';
    src: url('/Font/WEB/fonts/Hoover-Medium.woff2') format('woff2'),
         url('/Font/WEB/fonts/Hoover-Medium.woff') format('woff');
    font-weight: normal;
    font-style: normal;
  }

  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: 'MiFuente', sans-serif;
    overflow: hidden; /* Esto evita el scroll en toda la página */
  }

  #root {
    height: 100%;
  }
`;

// 🌍 Componente visual del globo de fondo
const GlobeBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

// Contenedor principal que centra el contenido en pantalla
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

// Contenedor del chat donde se muestran los mensajes
const ChatContainer = styled.div`
  width: 90%;
  max-width: 1050px;
  height: 600px;
  overflow-y: auto; /* scroll vertical */
  background-color: rgba(255, 255, 255, 0);
  backdrop-filter: blur(4px);
  border-radius: 20px;
  border: 3px solid transparent;
  box-shadow: 0px 4px 15px rgba(247, 128, 10, 0.54);
  display: flex;
  flex-direction: column;
  justify-content: normal; /* ya no se fuerza a estar abajo */
  position: relative;
  scroll-behavior: smooth;
`;

// Contenedor individual por mensaje (alineado izq/dcha según el usuario)
const MessageContainer = styled.div`
  display: flex;
  justify-content: ${(props) => (props.isUser ? "flex-end" : "flex-start")};
  width: 100%;
`;

// Burbuja visual del mensaje (con padding, borde, etc.)
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

// Contenedor del input + botón
const InputContainer = styled.div`
  display: flex;
  width: 90%;
  max-width: 850px;
  margin-top: 10px;
  font-family: 'MiFuente', sans-serif;
`;

// Estilos del área de texto para escribir mensajes
const TextArea = styled.textarea`
  flex: 1;
  height: 70px;
  padding: 14px 18px;
  border: 2px solid #ccc;
  border-radius: 10px;
  font-family: 'MiFuente', sans-serif;
  font-size: 18px;
  resize: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

  &:focus {
    border-color: rgba(247, 128, 10, 0.74);
    outline: none;
    box-shadow: 0 0 4px rgba(247, 128, 10, 0.6);
  }
`;

// Botón para enviar mensajes
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

// 🧠 Componente principal
function App() {
  const [message, setMessage] = useState(""); // mensaje actual
  const [messages, setMessages] = useState([]); // historial de mensajes
  const [loading, setLoading] = useState(false); // para deshabilitar botón mientras carga
  const chatContainerRef = useRef(null); // referencia para auto-scroll

  // Desplaza al fondo cuando hay nuevos mensajes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 📤 Envía el mensaje al backend y recibe la respuesta en streaming
  const sendMessage = async () => {
    if (!message.trim()) return;

    // Añadir mensaje del usuario
    setMessages((prev) => [...prev, { text: message, isUser: true }]);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";

      // Añade mensaje vacío del bot (para actualizarlo progresivamente)
      setMessages((prev) => [...prev, { text: "", isUser: false }]);

      // Procesamiento por chunks (streaming)
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;

          let text = line.slice(5);
          const cleanText = text.trim().replace(/^"+|"+$/g, "");

          if (!cleanText || cleanText === "[DONE]") continue;

          // Junta el texto con espacio si no empieza/termina con uno
          const needsSpace =
            aiResponse &&
            !aiResponse.endsWith(" ") &&
            !cleanText.startsWith(" ");

          aiResponse += needsSpace ? " " + cleanText : cleanText;

          // Actualiza el mensaje del bot progresivamente
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { text: aiResponse, isUser: false };
            return updated;
          });
        }
      }
    } catch (error) {
      console.error("❌ Error en sendMessage:", error);
      setMessages((prev) => [
        ...prev,
        { text: "⚠️ Error al conectar con el servidor", isUser: false },
      ]);
    }

    setLoading(false);
  };

  // 📦 Renderizado principal
  return (
    <>
      <GlobalStyles />
      <GlobeBackground>
        <Globe />
      </GlobeBackground>
      <Container>
        <ChatContainer ref={chatContainerRef}>
          {messages.map((msg, index) => (
            <MessageContainer key={`${index}-${msg.text}`} isUser={msg.isUser}>
              <MessageBubble isUser={msg.isUser}>{msg.text}</MessageBubble>
            </MessageContainer>
          ))}
        </ChatContainer>
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
