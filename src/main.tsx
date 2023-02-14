import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Nav from "./Nav";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div>
      <Nav />
    </div>
  </React.StrictMode>
);
