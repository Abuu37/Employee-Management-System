import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppRouter from "./router";
import { UserProvider } from "@/context/UserContext";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: "10px", fontFamily: "inherit" },
            success: {
              style: {
                background: "#f0fdf4",
                color: "#166534",
                border: "1px solid #bbf7d0",
              },
            },
            error: {
              style: {
                background: "#fef2f2",
                color: "#991b1b",
                border: "1px solid #fecaca",
              },
            },
          }}
        />
        <AppRouter />
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
