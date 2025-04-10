import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { Toaster } from "./components/ui/toaster";
import { FileSystemProvider, useThemeContext } from "./hooks";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { routeTree } from "./routes";

import "./i18n";
import { InstallPrompt } from "./components/ui/custom/install-prompt";

const queryClient = new QueryClient();
const router = createRouter({ routeTree });

function App() {
  const { theme } = useThemeContext();

  return (
    <div className={`w-full ${theme}`}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <QueryClientProvider client={queryClient}>
          <FileSystemProvider>
            <InstallPrompt>
              <RouterProvider router={router} />
            </InstallPrompt>
          </FileSystemProvider>
        </QueryClientProvider>
      </GoogleOAuthProvider>
      <Toaster />
    </div>
  );
}

export default App;
