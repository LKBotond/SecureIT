export class LocalStorageError extends Error {
  constructor(message) {
    super(message);
    this.name = "LocalStorageError";
  }
}
export class LocalStorageReadError extends LocalStorageError {
  constructor(key, message = "Failed to read from localStorage") {
    super(`${message}: "${key}"`);
    this.name = "LocalStorageReadError";
  }
}

export class LocalStorageWriteError extends LocalStorageError {
  constructor(key, message = "Failed to write to localStorage") {
    super(`${message}: "${key}"`);
    this.name = "LocalStorageWriteError";
  }
}
