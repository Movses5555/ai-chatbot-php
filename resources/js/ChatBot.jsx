import React, { useState, useEffect, useRef } from "react";

function ChatBot() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello! I can help you with product questions. Ask me anything." },
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };
  
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setDisabled(true);

    const userMessage = { from: "user", text: input };
    setMessages((m) => [...m, userMessage]);
    setInput("");

    const processingMessage = { from: 'bot', text: 'Thinking...' };
    setMessages(m => [...m, processingMessage]);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        },
        body: JSON.stringify({ message: userMessage.text }),
      });

      const apiResponse = await response.json();

      const replyText = apiResponse.message;
      const products = apiResponse.products; 
      
      const botMessage = { 
        from: "bot", 
        text: replyText,
        products: products,
      };

      setMessages(m => {
        const newMessages = m.slice(0, -1);
        newMessages.push(botMessage);
        return newMessages;
      });

      setDisabled(false);
    } catch (error) {
      console.error("API request error:", error);
      
      setMessages(m => {
        const newMessages = m.slice(0, -1);
        newMessages.push({ from: "bot", text: "Oops! The server didn't respond correctly." });
        return newMessages;
      });
      setDisabled(false);
    }
  };


  return (
    <>
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span className="text-lg">AI Assistant</span>
            <button
              onClick={() => setIsOpen(false)}
              className="chatbot-close-button"
              aria-label="Close chat"
            >
              ✖
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`message-container ${
                  msg.from === "bot" ? "bot-message-container" : "user-message-container"
                }`}
              >
                <div
                  className={`message-bubble ${
                    msg.from === "bot" ? "bot-message-bubble" : "user-message-bubble"
                  }`}
                >
                  {msg.text}
                  {Array.isArray(msg.products) && msg.products.length > 0 && (
                    <div className="products-list-container">
                      {msg.products.map((product, pIndex) => (
                        <div key={pIndex} className="recommended-product-card" style={{ 
                            marginTop: '10px', 
                            padding: '10px', 
                            borderTop: '1px solid #ccc', 
                            backgroundColor: '#f9f9f9',
                            borderRadius: '8px' 
                        }}>
                          <img 
                            src={product.image_url} 
                            alt={product.name} 
                            style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px', marginBottom: '5px' }} 
                          />
                          <strong style={{ display: 'block' }}>{product.name}</strong>
                          <span style={{ color: '#007bff' }}>{product.price} {product.currency}</span>
                          <p style={{ fontSize: '0.9em', marginTop: '5px' }}>
                            {product.description}
                          </p>
                          <a 
                            href={`/products/${product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-block',
                              marginTop: '10px',
                              padding: '6px 12px',
                              backgroundColor: '#2563eb',
                              color: 'white',
                              textDecoration: 'none',
                              borderRadius: '4px',
                              fontSize: '0.9em',
                              transition: 'background-color 0.2s'
                            }}
                          >
                            View Product
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} /> 
          </div>

          <div className="chatbot-input-container">
            <input
              name="message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="chatbot-input"
              placeholder="Enter your message..."
              aria-label="Enter a message"
            />
            <button
              onClick={sendMessage}
              className="chatbot-send-button"
              aria-label="Send message"
              disabled={disabled}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chatbot-floating-button"
          aria-label="Open chat"
        >
          💬
        </button>
      )}

      <style>{`
        .chatbot-window {
          position: fixed;
          bottom: 1rem;
          right: 1rem;
          z-index: 50;
          width: 350px;
          min-height: 500px;
          max-height: 80vh;
          background-color: white;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border-radius: 0.75rem;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          animation: slideUp 0.3s ease-out forwards;
        }

        .chatbot-header {
          background: linear-gradient(to right, #2563eb, #9333ea);
          color: white;
          padding: 1rem;
          font-weight: 600;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .chatbot-close-button {
          color: white;
          transition-property: color;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
          font-size: 1.25rem;
          line-height: 1;
          cursor: pointer;
          background: none;
          border: none;
        }

        .chatbot-close-button:hover {
          color: #e5e7eb;
        }

        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          background-color: #f9fafb;
        }

        .message-container {
          display: flex;
        }

        .bot-message-container {
          justify-content: flex-start;
        }

        .user-message-container {
          justify-content: flex-end;
        }

        .message-bubble {
          max-width: 85%;
          padding: 0.5rem 1rem;
          border-radius: 1.25rem;
          word-break: break-word;
          white-space: pre-wrap;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .bot-message-bubble {
          background-color: #eff6ff;
          color: #1e40af;
          border-bottom-left-radius: 0;
        }

        .user-message-bubble {
          background-color: #f3e8ff;
          color: #581c87;
          border-bottom-right-radius: 0;
        }

        .chatbot-input-container {
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          background-color: white;
          box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .chatbot-input {
          flex: 1;
          border: 1px solid #d1d5db;
          border-radius: 9999px;
          padding: 0.5rem 1rem;
          margin-right: 0.75rem;
          color: #4b5563;
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }

        .chatbot-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
        }

        .chatbot-send-button {
          background: linear-gradient(to right, #2563eb, #9333ea);
          color: white;
          padding: 0.5rem 1.25rem;
          border-radius: 9999px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
          cursor: pointer;
        }

        .chatbot-send-button:hover {
          background: linear-gradient(to right, #1d4ed8, #7e22ce);
          transform: scale(1.05);
        }

        .chatbot-send-button:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5), 0 0 0 2px rgba(59, 130, 246, 0.5), 0 0 0 2px rgba(59, 130, 246, 0.5);
          transform: scale(1);
        }

        .chatbot-floating-button {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 50;
          background: linear-gradient(to right, #2563eb, #9333ea);
          color: white;
          padding: 1rem;
          cursor: pointer;
          border-radius: 9999px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 300ms;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.875rem;
          line-height: 1;
        }

        .chatbot-floating-button:hover {
          transform: scale(1.05);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

export default ChatBot;