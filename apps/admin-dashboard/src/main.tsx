import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

document.title = "Shanthi Sivakasi Crackers | Admin Portal";
const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
if (favicon) {
  favicon.href = "/logo.jpg";
} else {
  const newFavicon = document.createElement("link");
  newFavicon.rel = "icon";
  newFavicon.href = "/logo.jpg";
  document.head.appendChild(newFavicon);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
