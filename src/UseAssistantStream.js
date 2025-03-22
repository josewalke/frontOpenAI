import { useState } from "react";

export function useAssistantStream() {
  const [messages, setMessages] = useState([]);
  const [chunks, setChunks] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { text: message, isUser: true }]);
    setLoading(true);
    setChunks([]);

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
        const lines = chunk.split(/\r?\n/).filter((line) => line.startsWith("data:"));

        for (const line of lines) {
          const text = line.slice(5);
          if (!text || text === "[DONE]") continue;

          setChunks((prev) => [...prev, text]);

          const lastChar = aiResponse.slice(-1);
          const firstChar = text.charAt(0);

          const isLetterOrDigit = (c) => /[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ]/.test(c);
          const isSpace = (c) => /\s/.test(c);

          const shouldInsertSpace =
            !isSpace(lastChar) &&
            !isSpace(firstChar) &&
            !(isLetterOrDigit(lastChar) && isLetterOrDigit(firstChar));

          aiResponse += (shouldInsertSpace ? " " : "") + text;

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

  return {
    messages,
    chunks,
    loading,
    sendMessage,
  };
}
