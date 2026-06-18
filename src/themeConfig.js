// Shared default theme and text configuration for the cafe UI

export const defaultTheme = {
  bg: "#F7F4EF",
  primary: "#6F4E37",
  surface: "#FFFFFF",
  textMain: "#202124",
  textMuted: "#6F6A64",
  border: "#E6DED4",
  accent: "#D9A441",
  secondary: "#2F5D50",
  lookPreset: "standard",

  // Backwards-compatible alternate look fields.
  isChristmasMode: false,
  christmasPrimary: "#B91C1C",
  christmasBg: "#FAFAF9",
  christmasAccent: "#14532D",

  // Typography
  fontHeading: '"Playfair Display", Georgia, serif',
  fontBody: '"Inter", "Segoe UI", sans-serif',
};

export const lookPresets = {
  standard: {
    label: "Standard",
    theme: {
      lookPreset: "standard",
      isChristmasMode: false,
      bg: "#F7F4EF",
      primary: "#6F4E37",
      secondary: "#2F5D50",
      accent: "#D9A441",
      surface: "#FFFFFF",
      textMain: "#202124",
      textMuted: "#6F6A64",
      border: "#E6DED4",
    },
  },
  ethiopianNewYear: {
    label: "Ethiopian New Year",
    theme: {
      lookPreset: "ethiopianNewYear",
      isChristmasMode: false,
      bg: "#FBF7EA",
      primary: "#1F7A4D",
      secondary: "#C9352B",
      accent: "#E4B23A",
      surface: "#FFFDF7",
      textMain: "#1E2A22",
      textMuted: "#6E6658",
      border: "#E8DDBE",
    },
  },
  timket: {
    label: "Timket",
    theme: {
      lookPreset: "timket",
      isChristmasMode: false,
      bg: "#EFF7FA",
      primary: "#176B87",
      secondary: "#2A9D8F",
      accent: "#D9B44A",
      surface: "#FFFFFF",
      textMain: "#17313A",
      textMuted: "#5C6D73",
      border: "#D5E7EC",
    },
  },
  christmas: {
    label: "Christmas",
    theme: {
      lookPreset: "christmas",
      isChristmasMode: true,
      bg: "#F7F7F2",
      primary: "#A0262A",
      secondary: "#1F5C45",
      accent: "#C9A227",
      surface: "#FFFFFF",
      textMain: "#252A27",
      textMuted: "#66706B",
      border: "#E2E1D8",
      christmasPrimary: "#A0262A",
      christmasBg: "#F7F7F2",
      christmasAccent: "#1F5C45",
    },
  },
};

export const defaultTexts = {
  heroTitle: "Your Brand",
  heroSubtitle: "Freshly brewed coffee and handcrafted bites.",
  loadingTitle: "Brewing your menu...",
  loadingDesc: "Loading items, please wait.",
  emptyMenuTitle: "Menu Empty",
  emptyMenuDesc: "No items are currently available.",
  emptyCategoryDesc: "No available items in this category right now.",
  currencySymbol: "$",
};
