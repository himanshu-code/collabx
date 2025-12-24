import { createTheme } from "@mui/material/styles";

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
    primary: "oklch(0.145 0 0)",
    secondary: "#717182",
  },
  divider: "rgba(0,0,0,0.1)",
};

const darkPalette = {
  mode: "dark" as const,
  background: {
    default: "oklch(0.145 0 0)",
    paper: "oklch(0.145 0 0)",
  },
  primary: {
    main: "oklch(0.985 0 0)",
    contrastText: "oklch(0.205 0 0)",
  },
  secondary: {
    main: "oklch(0.269 0 0)",
    contrastText: "oklch(0.985 0 0)",
  },
  error: {
    main: "oklch(0.396 0.141 25.723)",
    contrastText: "oklch(0.637 0.237 25.331)",
  },
  text: {
    primary: "oklch(0.985 0 0)",
    secondary: "oklch(0.708 0 0)",
  },
  divider: "oklch(0.269 0 0)",
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
