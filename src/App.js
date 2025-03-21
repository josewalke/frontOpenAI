import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { AnimatedList, AnimatedListItem } from "./AnimatedList";
import { Globe } from "./Globe";
import GlobalStyles from "./GlobalStyles";

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

const ChatContainer = styled.div`
  width: 90%;
  max-width: 1050px;
  height: 600px;
  overflow-y: auto;
  background-color: rgba(255, 255, 255, 0);
  backdrop-filter: blur(4px);
  border-radius: 20px;
  border: 3px solid transparent;
  box-shadow: 0px 4px 15px rgba(247, 128, 10, 0.54);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
  padding: 10px;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
`;

const MessageContainer = styled.div`
  display: flex;
  justify-content: ${(props) => (props.isUser ? "flex-end" : "flex-start")};
  width: 100%;
`;

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

const InputContainer = styled.div`
  display: flex;
  width: 90%;
  max-width: 850px;
  margin-top: 10px;
  font-family: 'MiFuente', sans-serif;
`;

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
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) return;
  
    setMessages((prev) => [...prev, { text: message, isUser: true }]);
    setMessage("");
    setLoading(true);
  
    let newMessageIndex;
    setMessages((prev) => {
      newMessageIndex = prev.length;
      return [...prev, { text: "", isUser: false }];
    });
  
    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";
  
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
  
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
  
        for (const line of lines) {
          // ✅ Eliminar solo el prefijo "data:" (no espacios)
          const text = line.startsWith("data:") ? line.slice(5) : line;
          if (!text || text === "[DONE]") continue;
  
          console.log("🧩 Fragmento recibido:", JSON.stringify(text));
  
          const lastChar = aiResponse.slice(-1);
          const firstChar = text.charAt(0);
  
          const isLetterOrDigit = (c) => /[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ]/.test(c);
          const isSpace = (c) => /\s/.test(c);
  
          const isJoiningWord =
            isLetterOrDigit(lastChar) &&
            isLetterOrDigit(firstChar) &&
            !isSpace(lastChar) &&
            !isSpace(firstChar);
  
          if (isJoiningWord) {
            // unir directamente sin espacio
            aiResponse += text;
          } else {
            // insertar texto, asegurando que haya un espacio si es necesario
            const needsSpace = aiResponse && !isSpace(lastChar) && !isSpace(firstChar);
            aiResponse += (needsSpace ? " " : "") + text;
          }
  
          // Mostrar el texto acumulado en pantalla
          setMessages((prev) => {
            const updated = [...prev];
            updated[newMessageIndex] = { text: aiResponse, isUser: false };
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
  
  
  
  
  
  return (
    <>
      <GlobalStyles />
      <GlobeBackground>
        <Globe />
      </GlobeBackground>
      <Container>
        <ChatContainer ref={chatContainerRef}>
          <AnimatedList messages={messages.map((msg, index) => (
            <AnimatedListItem key={`${index}-${msg.text}`}>
              <MessageContainer isUser={msg.isUser}>
                <MessageBubble isUser={msg.isUser}>{msg.text}</MessageBubble>
              </MessageContainer>
            </AnimatedListItem>
          ))} />
        </ChatContainer>
        <InputContainer>
          <TextArea placeholder="Escribe un mensaje..." value={message} onChange={(e) => setMessage(e.target.value)} />
          <Button onClick={sendMessage} disabled={loading}>{loading ? "Enviando..." : "Enviar"}</Button>
        </InputContainer>
      </Container>
    </>
  );
}

export default App;
