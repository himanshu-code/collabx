import { createTheme } from "@mui/material/styles";

/**
 * Approximated OKLCH → HEX mappings
 * oklch(0.145 0 0) ≈ #0f0f10
 * oklch(0.985 0 0) ≈ #fafafa
 * oklch(0.269 0 0) ≈ #3a3a3a
 * oklch(0.708 0 0) ≈ #b5b5b5
 * oklch(0.205 0 0) ≈ #2a2a2a
 */

const lightPalette = {
  mode: "light" as const,
  background: {
    default: "#ffffff",
    paper: "#ffffff",
  },
  primary: {
    main: "#030213",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#ececf0",
    contrastText: "#030213",
  },
  error: {
    main: "#d4183d",
    contrastText: "#ffffff",
  },
  text: {
    primary: "#0f0f10",      // instead of oklch(0.145 0 0)
    secondary: "#717182",
  },
  divider: "rgba(0,0,0,0.1)",
};

const darkPalette = {
  mode: "dark" as const,
  background: {
    default: "#0f0f10",      // instead of oklch(0.145 0 0)
    paper: "#0f0f10",
  },
  primary: {
    main: "#fafafa",        // instead of oklch(0.985 0 0)
    contrastText: "#2a2a2a",// instead of oklch(0.205 0 0)
  },
  secondary: {
    main: "#3a3a3a",        // instead of oklch(0.269 0 0)
    contrastText: "#fafafa",
  },
  error: {
    main: "#c0262d",        // approx for destructive red
    contrastText: "#fca5a5",// approx lighter red
  },
  text: {
    primary: "#fafafa",
    secondary: "#b5b5b5",   // instead of oklch(0.708 0 0)
  },
  divider: "#3a3a3a",
};

export const getMuiTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: mode === "light" ? lightPalette : darkPalette,
    shape: {
      borderRadius: 10, // 0.625rem ≈ 10px
    },
    typography: {
      fontSize: 16,
      fontWeightMedium: 500,
      fontWeightRegular: 400,
      button: {
        textTransform: "none",
        fontWeight: 500,
      },
    },
  });
