import { isMobileDevice } from "@/pages/studio/utils";

export const [topWidth, topHeight] = isMobileDevice() ? [484, 155] : [572, 194];
