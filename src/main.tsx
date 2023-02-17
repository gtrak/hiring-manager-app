import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import User, { responseInfo, mockResult } from "./User";
import UserList from "./UserList";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div className="flex flex-wrap">
      <div className="mx-auto">
        <User {...responseInfo(mockResult)} />
      </div>
      <div className="mx-auto">
        <UserList />
      </div>
    </div>
  </React.StrictMode>
);
