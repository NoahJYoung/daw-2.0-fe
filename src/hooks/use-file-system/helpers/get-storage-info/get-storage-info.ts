interface StorageEstimate {
  usage?: number;
  quota?: number;
}
interface StorageQuota {
  used: number;
  available: number;
  total: number;
}

export interface FormattedStorageQuota {
  used: string;
  available: string;
  total: string;
}

const checkStorageQuota = async (): Promise<StorageQuota | null> => {
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate: StorageEstimate = await navigator.storage.estimate();

      const usedSpace: number = estimate.usage || 0;
      const totalSpace: number = estimate.quota || 0;
      const availableSpace: number = totalSpace - usedSpace;

      return {
        used: usedSpace,
        available: availableSpace,
        total: totalSpace,
      };
    } catch (error) {
      console.error("Error getting storage estimate:", error);
      return null;
    }
  } else {
    console.warn("Storage estimation API is not available");
    return null;
  }
};

export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return "0 Bytes";

  const k: number = 1024;
  const dm: number = decimals < 0 ? 0 : decimals;
  const sizes: string[] = ["Bytes", "KB", "MB", "GB", "TB"];

  const i: number = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export const getStorageInfo = async (): Promise<FormattedStorageQuota> => {
  const quota = await checkStorageQuota();
  if (quota) {
    const { used, available, total } = quota;
    return {
      used: formatBytes(used),
      available: formatBytes(available),
      total: formatBytes(total),
    };
  }
  return {
    used: formatBytes(0),
    available: formatBytes(0),
    total: formatBytes(0),
  };
};
