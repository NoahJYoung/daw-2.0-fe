export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const isTouchDevice = () => {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

export const isInStandaloneMode = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window.navigator as any).standalone ||
  document.referrer.includes("android-app://");
