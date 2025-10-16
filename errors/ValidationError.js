const defaultMessage = "Failed to validate";
class ValidationError extends Error {
  constructor(message = defaultMessage) {
    super(message);
    this.name = "ValidationError";
  }
}
class MissingUserNameError extends EncryptionError {
  constructor(key, message = `${defaultMessage}, missing username`) {
    super(`${message}: "${key}"`);
    this.name = "MissingUserNameError";
  }
}

class MissingPasswordError extends EncryptionError {
  constructor(key, message = `${defaultMessage}, missing password`) {
    super(`${message}: "${key}"`);
    this.name = "MissingPasswordError";
  }
}
class IncorrectUsernameOrPasswordError extends EncryptionError {
  constructor(key, message = `${defaultMessage}, incorrect username or password`) {
    super(`${message}: "${key}"`);
    this.name = "IncorrectUsernameOrPasswordError";
  }
}
