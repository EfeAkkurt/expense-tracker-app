import { scale, verticalScale } from "@/utils/styling";

// Dark Mode (default) renkleri
const darkColors = {
  primary: "#a3e635",
  primaryLight: "#0ea5e9",
  primaryDark: "#0369a1",
  text: "#fff",
  textLight: "#e5e5e5",
  textLighter: "#d4d4d4",
  background: "#171717",
  backgroundLight: "#262626",
  white: "#fff",
  black: "#000",
  rose: "#ef4444",
  green: "#16a34a",
  neutral50: "#fafafa",
  neutral100: "#f5f5f5",
  neutral200: "#e5e5e5",
  neutral300: "#d4d4d4",
  neutral350: "#CCCCCC",
  neutral400: "#a3a3a3",
  neutral500: "#737373",
  neutral600: "#525252",
  neutral700: "#404040",
  neutral800: "#262626",
  neutral900: "#171717",
  gradient: ["#0369a1", "#0ea5e9", "#a3e635"],

  // Navigasyon ve özel renkler
  navigationBg: "#262626",
  navigationIcon: "#fff",
  navigationActiveIcon: "#a3e635",
  buttonBg: "#0369a1",
  totalBalanceBg: "#000000", // Dark mode'da Total Balance arka planı siyah
  walletHeaderText: "#fff",
  welcomeStartBg: "#0369a1", // Get Started arka planı
  welcomeFooterBg: "#171717", // Always take control arka planı
  navyBlue: "#0A3164",
  darkNavy: "#05285c", // Çok koyu lacivert
  welcomeTextLight: "#e0e0e0", // Welcome ekranı açık yazı rengi
  statisticsHeaderText: "#fff", // İstatistikler başlık rengi
  statisticsFilterText: "#fff", // İstatistikler filtre rengi
  borderColor: "#404040", // Form ve bölücü çizgiler için kullanılır
  transactionsBg: "#262626", // İşlemler arka plan rengi
  statisticsChartColor: "#a3e635", // İstatistikler grafikler
  addButtonBg: "#0ea5e9", // Ekleme butonu arka planı
  veryLightBlue: "#262626", // Light mode'da kullanılan açık mavi rengin dark mode karşılığı
  formInputBg: "#262626", // Form input background color
  formTextColor: "#ffffff", // Form text color
  formBorderColor: "#404040", // Form border color
};

// Light Mode renkleri (kullanıcının istediği renkler)
const lightColors = {
  primary: "#2980b9",
  primaryLight: "#6dd5fa",
  primaryDark: "#025284", // #0369a1'in daha koyusu
  text: "#000000",
  textLight: "#333333",
  textLighter: "#555555",
  background: "#ffffff",
  backgroundLight: "#f5f5f5",
  white: "#fff",
  black: "#000",
  rose: "#ef4444",
  green: "#16a34a",
  neutral50: "#fafafa",
  neutral100: "#171717",
  neutral200: "#262626",
  neutral300: "#404040",
  neutral350: "#525252",
  neutral400: "#737373",
  neutral500: "#a3a3a3",
  neutral600: "#d4d4d4",
  neutral700: "#e5e5e5",
  neutral800: "#f5f5f5",
  neutral900: "#ffffff",

  // Navigasyon ve özel renkler
  navigationBg: "#e8f4ff", // Çok açık mavi
  navigationIcon: "#025284", // Koyu mavi
  navigationActiveIcon: "#033966", // Koyu lacivert
  buttonBg: "#033966", // Koyu lacivert
  totalBalanceBg: "#033966", // Koyu lacivert (Total Balance için)
  walletHeaderText: "#033966", // Koyu lacivert (My Wallets için)
  welcomeStartBg: "#033966", // Get Started arka planı (koyu lacivert)
  welcomeFooterBg: "#e8f4ff", // Always take control arka planı (açık mavi)
  navyBlue: "#033966", // Koyu lacivert
  darkNavy: "#022c52", // Çok koyu lacivert
  veryLightBlue: "#e8f4ff", // Çok açık mavi
  profileButtonBg: "#033966", // Profil sayfası buton rengi
  statisticsChartColor: "#0A3164", // İstatistikler sayfası grafik rengi
  transactionItemBg: "#033966", // İşlem listesi öğe arka plan rengi
  welcomeTextLight: "#033966", // Welcome ekranı açık yazı rengi (lacivert)
  borderColor: "#d1e6fa", // Form ve bölücü çizgiler için açık mavi
  statisticsHeaderText: "#033966", // İstatistikler başlık rengi
  statisticsFilterText: "#033966", // İstatistikler filtre rengi
  transactionsBg: "#033966", // İşlemler arka plan rengi - Updated to dark navy for light mode
  addButtonBg: "#033966", // Ekleme butonu arka planı
  formInputBg: "#033966", // Form input background color
  formTextColor: "#ffffff", // Form text color
  formBorderColor: "#033966", // Form border color
  gradient: ["#2980b9", "#6dd5fa", "#ffffff"],
};

// İhraç edilen colors objesi artık bir fonksiyon olarak kullanılacak
export const getColors = (theme: "light" | "dark") => {
  return theme === "dark" ? darkColors : lightColors;
};

// Varsayılan olarak dark mode renkleri ihraç et (geriye dönük uyumluluk için)
export const colors = darkColors;

export const spacingX = {
  _3: scale(3),
  _5: scale(5),
  _7: scale(7),
  _10: scale(10),
  _12: scale(12),
  _15: scale(15),
  _20: scale(20),
  _25: scale(25),
  _30: scale(30),
  _35: scale(35),
  _40: scale(40),
};

export const spacingY = {
  _5: verticalScale(5),
  _7: verticalScale(7),
  _10: verticalScale(10),
  _12: verticalScale(12),
  _15: verticalScale(15),
  _17: verticalScale(17),
  _20: verticalScale(20),
  _25: verticalScale(25),
  _30: verticalScale(30),
  _35: verticalScale(35),
  _40: verticalScale(40),
  _50: verticalScale(50),
  _60: verticalScale(60),
};

export const radius = {
  _3: verticalScale(3),
  _6: verticalScale(6),
  _10: verticalScale(10),
  _12: verticalScale(12),
  _15: verticalScale(15),
  _17: verticalScale(17),
  _20: verticalScale(20),
  _30: verticalScale(30),
};
