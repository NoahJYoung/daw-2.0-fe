import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { routes } from "./routes";
import { useThemeContext } from "./hooks";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./i18n";

const queryClient = new QueryClient();
const router = createBrowserRouter(routes);

function App() {
  const { theme } = useThemeContext();

  return (
    <div className={`w-full ${theme}`}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </GoogleOAuthProvider>
      <Toaster />
    </div>
  );
}

export default App;
