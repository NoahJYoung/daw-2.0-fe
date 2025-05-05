import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { Toaster } from "./components/ui/toaster";
import { FileSystemProvider, useThemeContext } from "./hooks";
import { routeTree } from "./routes";

import "./i18n";
import { InstallPrompt } from "./components/ui/custom/install-prompt";

const queryClient = new QueryClient();
const router = createRouter({ routeTree });

function App() {
  const { theme } = useThemeContext();

  return (
    <div className={`w-screen ${theme} h-screen overflow-hidden`}>
      <QueryClientProvider client={queryClient}>
        <FileSystemProvider>
          <InstallPrompt>
            <RouterProvider router={router} />
          </InstallPrompt>
        </FileSystemProvider>
      </QueryClientProvider>
      <Toaster />
    </div>
  );
}

export default App;
