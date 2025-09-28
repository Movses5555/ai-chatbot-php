import './bootstrap.js';
import '../css/app.css';

import React from "react";
import ReactDOM from "react-dom/client";
import ChatBot from "./ChatBot.jsx";

if (document.getElementById("chatbot-root")) {
  ReactDOM.createRoot(document.getElementById("chatbot-root")).render(
    <React.StrictMode>
      <ChatBot />
    </React.StrictMode>
  );
}
