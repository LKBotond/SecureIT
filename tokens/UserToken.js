class UserToken {
  constructor(
    masterKey,
    masterKeySalt,
    encryptionKey,
    masterKeyEncryptionSalt,
    encryptionIV,
    userId
  ) {
    this.masterKey = masterKey;
    this.masterKeySalt = masterKeySalt;
    this.encryptionKey = encryptionKey;
    this.masterKeyEncryptionSalt = masterKeyEncryptionSalt;
    this.encryptionIV = encryptionIV;
    this.userId = userId;
  }
}
export default UserToken;
