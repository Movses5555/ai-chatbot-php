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
              <svg
                version="1.1" 
                id="Layer_1" 
                xmlns="http://www.w3.org/2000/svg" 
                xmlns:xlink="http://www.w3.org/1999/xlink" 
                x="0px" 
                y="0px" 
                width="20px" 
                height="20px" 
                viewBox="0 0 121.31 122.876" 
                enable-background="new 0 0 121.31 122.876" 
                xml:space="preserve"
                style={{ fill: 'white' }}
              >
                <g>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M90.914,5.296c6.927-7.034,18.188-7.065,25.154-0.068 c6.961,6.995,6.991,18.369,0.068,25.397L85.743,61.452l30.425,30.855c6.866,6.978,6.773,18.28-0.208,25.247 c-6.983,6.964-18.21,6.946-25.074-0.031L60.669,86.881L30.395,117.58c-6.927,7.034-18.188,7.065-25.154,0.068 c-6.961-6.995-6.992-18.369-0.068-25.397l30.393-30.827L5.142,30.568c-6.867-6.978-6.773-18.28,0.208-25.247 c6.983-6.963,18.21-6.946,25.074,0.031l30.217,30.643L90.914,5.296L90.914,5.296z"/>
                </g>
              </svg>
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
                          <div style={{ position: 'relative', width: '100%',  }}>
                            <img 
                              src={product.image_url} 
                              alt={product.name} 
                              style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px', marginBottom: '5px' }} 
                            />
                            {
                              product.discount > 0 && (
                                <div style={{
                                  position: 'absolute',
                                  top: '0',
                                  right: '0',
                                  backgroundColor: 'red',
                                  color: 'white',
                                  padding: '2px 8px',
                                  borderTopRightRadius: '4px',
                                  borderBottomLeftRadius: '4px',
                                  fontSize: '16px',
                                  fontWeight: 'bold',
                                }}>
                                  <span>-{product.discount}%</span>
                                </div>
                              )
                            }
                          </div>
                          <strong style={{ display: 'block', color: '#212121' }}>{product.name}</strong>
                          <div className="price">
                            {
                              product.discount > 0 && (
                                <span style={{ 
                                  textDecoration: 'line-through', 
                                  color: '#C1C1C1', 
                                  marginRight: '8px' 
                                }}>
                                  {product.price}
                                </span>
                              )
                            }
                            <span
                              style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}
                              className="actual-price"
                            >
                              {product.actual_price}
                            </span>
                          </div>
                          <p style={{ 
                            fontSize: '14px', 
                            marginTop: '5px', 
                            lineHeight: '150%', 
                            color: '#212121',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {product.description}
                          </p>
                          <a 
                            href={`/products/${product.id}`}
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
          <svg 
            style={{ width: '32px', height: '32px', fill: 'white' }}
            id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 107.09">
            <title>chat-bubble</title>
            <path d="M63.08,0h.07C79.93.55,95,6.51,105.75,15.74c11,9.39,17.52,22.16,17.11,36.09v0a42.67,42.67,0,0,1-7.58,22.87A55,55,0,0,1,95.78,92a73.3,73.3,0,0,1-28.52,8.68,62.16,62.16,0,0,1-27-3.63L6.72,107.09,16.28,83a49.07,49.07,0,0,1-10.91-13A40.16,40.16,0,0,1,.24,45.55a44.84,44.84,0,0,1,9.7-23A55.62,55.62,0,0,1,26.19,8.83,67,67,0,0,1,43.75,2,74.32,74.32,0,0,1,63.07,0Zm24.18,42a7.78,7.78,0,1,1-7.77,7.78,7.78,7.78,0,0,1,7.77-7.78Zm-51.39,0a7.78,7.78,0,1,1-7.78,7.78,7.79,7.79,0,0,1,7.78-7.78Zm25.69,0a7.78,7.78,0,1,1-7.77,7.78,7.78,7.78,0,0,1,7.77-7.78Zm1.4-36h-.07A68.43,68.43,0,0,0,45.14,7.85a60.9,60.9,0,0,0-16,6.22A49.65,49.65,0,0,0,14.66,26.32,38.87,38.87,0,0,0,6.24,46.19,34.21,34.21,0,0,0,10.61,67,44.17,44.17,0,0,0,21.76,79.67l1.76,1.39L16.91,97.71l23.56-7.09,1,.38a56,56,0,0,0,25.32,3.6,67,67,0,0,0,26.16-8A49,49,0,0,0,110.3,71.36a36.86,36.86,0,0,0,6.54-19.67v0c.35-12-5.41-23.1-15-31.33C92.05,11.94,78.32,6.52,63,6.06Z"/>
          </svg>
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