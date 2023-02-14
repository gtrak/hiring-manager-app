import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Nav from "./Nav";
import User, { responseInfo, mockResult } from "./User";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div>
      <Nav />
      <User {...responseInfo(mockResult)} />
    </div>
  </React.StrictMode>
);
