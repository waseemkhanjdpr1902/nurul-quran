export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}

export interface Hadith {
  id: number;
  hadithArabic: string;
  hadithEnglish: string;
  englishNarrator: string;
  hadithNumber: string;
  status: string;
}

export interface AzkarItem {
  id: number;
  text: string;
  translation: string;
  count: number;
  category: "morning" | "evening" | "wird";
}
