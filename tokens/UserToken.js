class UserToken {
  constructor(
    masterKey,
    masterKeySalt,
    masterKeyEncryptionSalt,
    encryptionIV,
    userId
  ) {
    this.masterKey = masterKey;
    this.masterKeySalt = masterKeySalt;
    this.masterKeyEncryptionSalt = masterKeyEncryptionSalt;
    this.encryptionIV = encryptionIV;
    this.userId = userId;
  }
}
export default UserToken;
