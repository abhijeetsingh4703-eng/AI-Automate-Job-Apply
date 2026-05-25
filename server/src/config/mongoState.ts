// Global state to track if MongoDB is unavailable
// This is separate from server.ts to avoid circular dependencies
export let MONGO_UNAVAILABLE = false;

export function setMongoUnavailable(unavailable: boolean) {
  MONGO_UNAVAILABLE = unavailable;
}

export function isMongoUnavailable() {
  return MONGO_UNAVAILABLE;
}
