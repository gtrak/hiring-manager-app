import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import User, { responseInfo, mockResult } from "./User";
import UserList from "./UserList";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-wrap">
        <div className="mx-auto">
          <User />
        </div>
        <div className="mx-auto">
          <UserList />
        </div>
      </div>
    </QueryClientProvider>
  </React.StrictMode>
);
