export type CardDataColor = {
  name: string;
  hex: string;
  textClass: string; // Tailwind class for text on this color
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
  { name: "sunset", hex: "#E36A3E", textClass: "text-white" },
  { name: "dusty", hex: "#9FBED0", textClass: "text-fa-primary" },
  { name: "denim", hex: "#597CBA", textClass: "text-white" },
  { name: "evergreen", hex: "#27694E", textClass: "text-white" },
  { name: "chestnut", hex: "#A6602B", textClass: "text-white" },
  { name: "mustard", hex: "#DBBA17", textClass: "text-fa-primary" },
];

// shapeIndex 0-5 maps to: rounded-square, hexagon, circle, flower, pentagon, decagon
export const DEFAULT_CARDS: CardData[] = [
  {
    id: "1",
    french: "merci",
    english: "thank you",
    color: CARD_COLORS[0],
    shapeIndex: 2,
  }, // circle
  {
    id: "2",
    french: "bonjour",
    english: "hello",
    color: CARD_COLORS[2],
    shapeIndex: 3,
  }, // flower
  {
    id: "3",
    french: "pardon",
    english: "excuse me / sorry",
    color: CARD_COLORS[3],
    shapeIndex: 1,
  }, // hexagon
  {
    id: "4",
    french: "peut-être",
    english: "maybe",
    color: CARD_COLORS[5],
    shapeIndex: 4,
  }, // pentagon
  {
    id: "5",
    french: "maintenant",
    english: "now",
    color: CARD_COLORS[1],
    shapeIndex: 0,
  }, // rounded-square
  {
    id: "6",
    french: "ensemble",
    english: "together",
    color: CARD_COLORS[4],
    shapeIndex: 5,
  }, // decagon
  {
    id: "7",
    french: "Je ne comprends pas.",
    english: "I don't understand.",
    color: CARD_COLORS[0],
    shapeIndex: 2,
  }, // circle
  {
    id: "8",
    french: "Où sont les toilettes ?",
    english: "Where is the bathroom?",
    color: CARD_COLORS[2],
    shapeIndex: 1,
  }, // hexagon
  {
    id: "9",
    french: "Je voudrais un café, s'il vous plaît.",
    english: "I'd like a coffee, please.",
    color: CARD_COLORS[3],
    shapeIndex: 3,
  }, // flower
  {
    id: "10",
    french: "Est-ce que vous parlez anglais ?",
    english: "Do you speak English?",
    color: CARD_COLORS[5],
    shapeIndex: 0,
  }, // rounded-square
  {
    id: "11",
    french: "L'addition, s'il vous plaît.",
    english: "The bill, please.",
    color: CARD_COLORS[4],
    shapeIndex: 4,
  }, // pentagon
  {
    id: "12",
    french: "Je suis perdu(e).",
    english: "I'm lost.",
    color: CARD_COLORS[1],
    shapeIndex: 5,
  }, // decagon
];
