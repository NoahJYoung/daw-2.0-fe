import { Theme } from "@supabase/auth-ui-shared";

export const getThemeObject = (theme: "dark" | "light"): Theme => {
  const fontFamily =
    "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'";

  const darkTheme: Theme = {
    default: {
      colors: {
        brand: "#fd3574",
        brandAccent: "#ee2b68",
        brandButtonText: "#fff",
        defaultButtonBackground: "transparent",
        defaultButtonBackgroundHover: "#111",
        defaultButtonBorder: "#666",
        defaultButtonText: "#ddd",
        dividerBackground: "#888",
        inputBackground: "transparent",
        inputBorder: "#666",
        inputBorderFocus: "#ddd",
        inputBorderHover: "#aaa",
        inputLabelText: "#aaa",
        inputPlaceholder: "#888",
        inputText: "#aaa",
        anchorTextColor: "#888",
        anchorTextHoverColor: "#aaa",
      },
      space: {
        spaceSmall: "2px",
        spaceMedium: "4px",
        spaceLarge: "6px",
        labelBottomMargin: "2px",
        anchorBottomMargin: "2px",
        emailInputSpacing: "2px",
        socialAuthSpacing: "4px",
        buttonPadding: "6px",
        inputPadding: "6px",
      },
      fontSizes: {
        baseBodySize: "0.9rem",
        baseInputSize: "0.9rem",
        baseLabelSize: "0.9rem",
        baseButtonSize: "0.9rem",
      },
      fonts: {
        bodyFontFamily: fontFamily,
        buttonFontFamily: fontFamily,
        inputFontFamily: fontFamily,
        labelFontFamily: fontFamily,
      },
      borderWidths: {
        buttonBorderWidth: "1px",
        inputBorderWidth: "1px",
      },
      radii: {
        borderRadiusButton: "6px",
        buttonBorderRadius: "6px",
        inputBorderRadius: "6px",
      },
    },
  };

  const lightTheme: Theme = {
    default: {
      colors: {
        brand: "#fd3574",
        brandAccent: "#ee2b68",
        brandButtonText: "#fff",
        defaultButtonBackground: "transparent",
        defaultButtonBackgroundHover: "#eee",
        defaultButtonBorder: "#666",
        defaultButtonText: "#333",
        dividerBackground: "#888",
        inputBackground: "transparent",
        inputBorder: "#666",
        inputBorderFocus: "#000",
        inputBorderHover: "#333",
        inputLabelText: "#666",
        inputPlaceholder: "#888",
        inputText: "#333",
        anchorTextColor: "#666",
        anchorTextHoverColor: "#333",
      },
      space: {
        spaceSmall: "2px",
        spaceMedium: "4px",
        spaceLarge: "6px",
        labelBottomMargin: "2px",
        anchorBottomMargin: "2px",
        emailInputSpacing: "2px",
        socialAuthSpacing: "4px",
        buttonPadding: "6px",
        inputPadding: "6px",
      },
      fontSizes: {
        baseBodySize: "0.9rem",
        baseInputSize: "0.9rem",
        baseLabelSize: "0.9rem",
        baseButtonSize: "0.9rem",
      },
      fonts: {
        bodyFontFamily: fontFamily,
        buttonFontFamily: fontFamily,
        inputFontFamily: fontFamily,
        labelFontFamily: fontFamily,
      },
      borderWidths: {
        buttonBorderWidth: "1px",
        inputBorderWidth: "1px",
      },
      radii: {
        borderRadiusButton: "6px",
        buttonBorderRadius: "6px",
        inputBorderRadius: "6px",
      },
    },
  };

  return theme === "dark" ? darkTheme : lightTheme;
};
