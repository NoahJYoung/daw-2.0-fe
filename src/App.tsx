import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { routes } from "./routes";
import { useThemeContext } from "./hooks";
import { Button } from "./components/ui/button";
import { useTranslation } from "react-i18next";

const queryClient = new QueryClient();
const router = createBrowserRouter(routes);

function App() {
  const { theme, toggleTheme } = useThemeContext();
  const { t, i18n } = useTranslation();

  const newLanguage = i18n.language === "en" ? "es" : "en";

  return (
    <div className={theme}>
      <Button onClick={toggleTheme}>Toggle Theme</Button>
      <Button onClick={() => i18n.changeLanguage(newLanguage)}>
        {t("changeLanguage")}
      </Button>

      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </div>
  );
}

export default App;
