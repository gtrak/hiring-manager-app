import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import User, { responseInfo, mockResult } from "./User";
import UserList from "./UserList";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [id, setId] = useState<number>();
  return (
    <div className="flex flex-wrap">
      <div className="mx-auto">
        <User id={id} clearId={() => setId(undefined)} />
      </div>
      <div className="mx-auto">
        <UserList />
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
