import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { routes } from "./routes";
import { useThemeContext } from "./hooks";
import { Button } from "./components/ui/button";
import { useTranslation } from "react-i18next";
import { useToast } from "./components/ui/use-toast";
import "./i18n";

const queryClient = new QueryClient();
const router = createBrowserRouter(routes);

function App() {
  const { theme, toggleTheme } = useThemeContext();
  const { t } = useTranslation();
  const { toast } = useToast();

  const testToast = () => {
    toast({ title: "Hello!", description: `Theme changed to: ${theme}` });
  };

  const onClick = () => {
    toggleTheme();
    testToast();
  };

  return (
    <div className={`w-full ${theme}`}>
      <Button onClick={onClick}>{t("toggleTheme")}</Button>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </div>
  );
}

export default App;
