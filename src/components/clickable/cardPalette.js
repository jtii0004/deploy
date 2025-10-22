const CARD_PALETTE = [
  {
    background: "linear-gradient(135deg, #c7a3ff, #a58bff)",
    accent: "#8e79ff",
    muted: "#dcd3ff",
  },
  {
    background: "linear-gradient(135deg, #a0e7e5, #b4f8c8)",
    accent: "#60c3b2",
    muted: "#c4f1e7",
  },
  {
    background: "linear-gradient(135deg, #fbe7c6, #f6d7a7)",
    accent: "#f4b86c",
    muted: "#fde3c5",
  },
  {
    background: "linear-gradient(135deg, #ffb5a7, #fcd5ce)",
    accent: "#f38ba0",
    muted: "#ffd6de",
  },
  {
    background: "linear-gradient(135deg, #ffc6ff, #bdb2ff)",
    accent: "#9d8cfc",
    muted: "#e6dcff",
  },
  {
    background: "linear-gradient(135deg, #bee3f8, #90cdf4)",
    accent: "#5aa9e6",
    muted: "#d0ecff",
  },
];

function getPaletteIndex(key = "") {
  if (!key) {
    return 0;
  }

  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }

  return Math.abs(hash) % CARD_PALETTE.length;
}

export function getCardPalette(sourceKey) {
  const index = getPaletteIndex(sourceKey);
  return CARD_PALETTE[index];
}

export { CARD_PALETTE };
