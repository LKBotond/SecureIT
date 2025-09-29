class UserToken {
  constructor(
    masterKey,
    masterSalt,
    encryptionKey,
    encryptionSalt,
    encryptionIV,
    userId
  ) {
    this.masterKey = masterKey;
    this.masterSalt = masterSalt;
    this.encryptionKey = encryptionKey;
    this.encryptionSalt = encryptionSalt;
    this.encryptionIV = encryptionIV;
    this.userId = userId;
  }
}
export default UserToken;
