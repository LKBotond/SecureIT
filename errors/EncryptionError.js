const defaultMessage = "Failed to encrypt";
class EncryptionError extends Error {
  constructor(message = defaultMessage) {
    super(message);
    this.name = "EncryptionError";
  }
}
class MissingKeyError extends EncryptionError {
  constructor(key, message = `${defaultMessage}, missing key`) {
    super(`${message}: "${key}"`);
    this.name = "MissingKeyError";
  }
}

class MissingInputError extends EncryptionError {
  constructor(key, message = `${defaultMessage}, missing input`) {
    super(`${message}: "${key}"`);
    this.name = "MissingInputError";
  }
}
class MissingIvError extends EncryptionError {
  constructor(key, message = `${defaultMessage}, missing Iv`) {
    super(`${message}: "${key}"`);
    this.name = "MissingIvError";
  }
}
