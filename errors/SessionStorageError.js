export class SessionStorageError extends Error {
  constructor(message) {
    super(message);
    this.name = "SessionStorageError";
  }
}
export class SessionStorageReadError extends LocalStorageError {
  constructor(key, message = "Failed to read sessionStorage") {
    super(`${message}: "${key}"`);
    this.name = "SessionStorageReadError";
  }
}

export class SessionStorageWriteError extends LocalStorageError {
  constructor(key, message = "Failed to writsessionStorage") {
    super(`${message}: "${key}"`);
    this.name = "SessionStorageWriteError";
  }
}
