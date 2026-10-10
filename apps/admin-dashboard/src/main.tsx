import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import english from "./locales/en.json";

document.title = english["app.title"];
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
