class LocalStorageError extends Error {
  constructor(message) {
    super(message);
    this.name = "LocalStorageError";
  }
}
class LocalStorageReadError extends LocalStorageError {
  constructor(key, message = "Failed to read from localStorage") {
    super(`${message}: "${key}"`);
    this.name = "LocalStorageReadError";
  }
}

class LocalStorageWriteError extends LocalStorageError {
  constructor(key, message = "Failed to write to localStorage") {
    super(`${message}: "${key}"`);
    this.name = "LocalStorageWriteError";
  }
}
