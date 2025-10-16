const defaultMessage = "Failed to validate";
export class ValidationError extends Error {
  constructor(message = defaultMessage) {
    super(message);
    this.name = "ValidationError";
  }
}
export class MissingUserNameError extends EncryptionError {
  constructor(key, message = `${defaultMessage}, missing username`) {
    super(`${message}: "${key}"`);
    this.name = "MissingUserNameError";
  }
}

export class MissingPasswordError extends EncryptionError {
  constructor(key, message = `${defaultMessage}, missing password`) {
    super(`${message}: "${key}"`);
    this.name = "MissingPasswordError";
  }
}
export class IncorrectUsernameOrPasswordError extends EncryptionError {
  constructor(key, message = `${defaultMessage}, incorrect username or password`) {
    super(`${message}: "${key}"`);
    this.name = "IncorrectUsernameOrPasswordError";
  }
}
