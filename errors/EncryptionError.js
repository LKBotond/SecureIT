const defaultMessage = "Failed to encrypt";
export class EncryptionError extends Error {
  constructor(message = defaultMessage) {
    super(message);
    this.name = "EncryptionError";
  }
}
export class MissingKeyError extends EncryptionError {
  constructor(key, message = `${defaultMessage}, missing key`) {
    super(`${message}: "${key}"`);
    this.name = "MissingKeyError";
  }
}

export class MissingInputError extends EncryptionError {
  constructor(key, message = `${defaultMessage}, missing input`) {
    super(`${message}: "${key}"`);
    this.name = "MissingInputError";
  }
}
export class MissingIvError extends EncryptionError {
  constructor(key, message = `${defaultMessage}, missing Iv`) {
    super(`${message}: "${key}"`);
    this.name = "MissingIvError";
  }
}
