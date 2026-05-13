import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import AppRouter from "./router";
import { UserProvider } from "@/context/UserProvider";
import { useUser } from "@/context/UserContext";
import "./App.css";

function AppWithGate() {
  const { loading } = useUser();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }
  return <AppRouter />;
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
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
          <AppWithGate />
        </UserProvider>
      </BrowserRouter>
    </I18nextProvider>
  );
}

export default App;
