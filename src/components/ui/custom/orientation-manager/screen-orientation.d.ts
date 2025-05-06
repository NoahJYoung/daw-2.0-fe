// Add missing lock method to ScreenOrientation interface
interface ScreenOrientation {
  lock(orientation: OrientationLockType): Promise<void>;
}

// Define the orientation lock types
type OrientationLockType =
  | "any"
  | "natural"
  | "landscape"
  | "portrait"
  | "portrait-primary"
  | "portrait-secondary"
  | "landscape-primary"
  | "landscape-secondary";
