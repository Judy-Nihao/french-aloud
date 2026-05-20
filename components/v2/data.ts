export type CardDataColor = {
  name: string;
  hex: string;
};

export type CardData = {
  id: string;
  french: string;
  english?: string;
  imageUrl?: string | null;
  color: CardDataColor;
  shapeIndex: number;
};

export const CARD_COLORS: CardDataColor[] = [
  { name: "sunset", hex: "#E36A3E" },
  { name: "dusty", hex: "#9FBED0" },
  { name: "denim", hex: "#597CBA" },
  { name: "evergreen", hex: "#27694E" },
  { name: "chestnut", hex: "#A6602B" },
  { name: "mustard", hex: "#DBBA17" },
];
