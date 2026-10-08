export const CV_BACKGROUNDS = [
  { id: "mist", name: "Mist", token: "--cv-mist", pro: false },
  { id: "ice", name: "Ice blue", token: "--cv-ice", pro: false },
  { id: "sage", name: "Sage", token: "--cv-sage", pro: false },
  { id: "rose", name: "Rose", token: "--cv-rose", pro: false },
  { id: "lilac", name: "Lilac", token: "--cv-lilac", pro: true },
  { id: "peach", name: "Peach", token: "--cv-peach", pro: true },
  { id: "mint", name: "Mint", token: "--cv-mint", pro: true },
  { id: "lemon", name: "Lemon", token: "--cv-lemon", pro: true },
  { id: "powder", name: "Powder blue", token: "--cv-powder", pro: true },
  { id: "petal", name: "Petal", token: "--cv-petal", pro: true },
  { id: "seafoam", name: "Seafoam", token: "--cv-seafoam", pro: true },
  { id: "pearl", name: "Pearl", token: "--cv-pearl", pro: true },
  { id: "lavender", name: "Lavender grey", token: "--cv-lavender", pro: true },
  { id: "apricot", name: "Apricot", token: "--cv-apricot", pro: true },
  { id: "pistachio", name: "Pistachio", token: "--cv-pistachio", pro: true },
  { id: "cloud", name: "Cloud", token: "--cv-cloud", pro: true },
] as const;

// Legacy saved accent colours remain backgrounds only, softened by the renderer.
export const cvBackground = (value: string) => CV_BACKGROUNDS.find((c) => c.id === value)
  ? `var(${CV_BACKGROUNDS.find((c) => c.id === value)?.token})`
  : `color-mix(in oklab, ${value} 15%, var(--paper))`;