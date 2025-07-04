// Offline storage utilities for inspection data
export interface OfflineInspectionData {
  orderNumber: string;
  vehicleInfo: any;
  sections: any[];
  signature: string | null;
  totalItems: number;
  completedItems: number;
  failedItems: number;
  lastSaved: string;
}

const STORAGE_KEY = "tesla-inspection-data";

export function saveToLocalStorage(data: any): void {
  try {
    const dataToSave: OfflineInspectionData = {
      ...data,
      lastSaved: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
}

export function loadFromLocalStorage(): OfflineInspectionData | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    return JSON.parse(saved);
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
    return null;
  }
}

export function clearLocalStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear localStorage:", error);
  }
}

export function hasOfflineData(): boolean {
  return !!loadFromLocalStorage();
}

export function getOfflineDataAge(): number | null {
  const data = loadFromLocalStorage();
  if (!data?.lastSaved) return null;
  
  const savedTime = new Date(data.lastSaved).getTime();
  const currentTime = Date.now();
  
  return currentTime - savedTime;
}
