class SessionStorageError extends Error {
  constructor(message) {
    super(message);
    this.name = "SessionStorageError";
  }
}
class SessionStorageReadError extends LocalStorageError {
  constructor(key, message = "Failed to read sessionStorage") {
    super(`${message}: "${key}"`);
    this.name = "SessionStorageReadError";
  }
}

class SessionStorageWriteError extends LocalStorageError {
  constructor(key, message = "Failed to writsessionStorage") {
    super(`${message}: "${key}"`);
    this.name = "SessionStorageWriteError";
  }
}
