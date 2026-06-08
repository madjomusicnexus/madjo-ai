// Offline Mode - Cache and Sync

export interface OfflineRoutine {
  id: string;
  date: string;
  exercises: any[];
  completed: boolean;
  synced: boolean;
}

// Save routine for offline access
export function cacheRoutine(routine: any): void {
  try {
    const cached = localStorage.getItem('offline_routines');
    let routines: OfflineRoutine[] = cached ? JSON.parse(cached) : [];
    
    // Check if already cached
    const existing = routines.find(r => r.id === routine.id);
    if (!existing) {
      routines.push({
        id: routine.id,
        date: routine.date,
        exercises: routine.exercises,
        completed: false,
        synced: false
      });
      localStorage.setItem('offline_routines', JSON.stringify(routines));
    }
  } catch (e) {
    console.log('Offline cache failed:', e);
  }
}

// Get all cached routines
export function getCachedRoutines(): OfflineRoutine[] {
  try {
    const cached = localStorage.getItem('offline_routines');
    return cached ? JSON.parse(cached) : [];
  } catch (e) {
    return [];
  }
}

// Mark exercise as completed offline
export function markOfflineComplete(routineId: string, exerciseId: string): void {
  try {
    const cached = localStorage.getItem('offline_routines');
    let routines: OfflineRoutine[] = cached ? JSON.parse(cached) : [];
    
    const routine = routines.find(r => r.id === routineId);
    if (routine) {
      const exercise = routine.exercises.find((e: any) => e.id === exerciseId);
      if (exercise) {
        exercise.completed = !exercise.completed;
        
        // Check if all completed
        const allCompleted = routine.exercises.every((e: any) => e.completed === true);
        if (allCompleted) {
          routine.completed = true;
          routine.synced = false; // Needs sync
        }
        
        localStorage.setItem('offline_routines', JSON.stringify(routines));
      }
    }
  } catch (e) {
    console.log('Offline mark failed:', e);
  }
}

// Sync offline progress when back online
export function syncOfflineProgress(): Promise<number> {
  return new Promise((resolve) => {
    const cached = localStorage.getItem('offline_routines');
    let routines: OfflineRoutine[] = cached ? JSON.parse(cached) : [];
    
    const unsynced = routines.filter(r => r.completed && !r.synced);
    let syncedCount = 0;
    
    unsynced.forEach(routine => {
      // Mark as synced
      routine.synced = true;
      syncedCount++;
      
      // Save to main progress
      const existing = localStorage.getItem('daily_progress');
      let progress = existing ? JSON.parse(existing) : [];
      
      const todayProgress = {
        date: routine.date,
        exercisesCompleted: routine.exercises.filter((e: any) => e.completed).length,
        xpEarned: routine.exercises.filter((e: any) => e.completed).length * 10,
        routineCompleted: true
      };
      
      progress.push(todayProgress);
      localStorage.setItem('daily_progress', JSON.stringify(progress));
    });
    
    localStorage.setItem('offline_routines', JSON.stringify(routines));
    resolve(syncedCount);
  });
}

// Check if online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Listen for online/offline events
export function addOnlineListener(callback: () => void): void {
  window.addEventListener('online', callback);
}

export function removeOnlineListener(callback: () => void): void {
  window.removeEventListener('online', callback);
}