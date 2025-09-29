class CredentialToken {
  constructor(nameSalt, passSalt, encryptedUsername, encryptedPassword) {
    this.nameSalt = nameSalt;
    this.passSalt = passSalt;
    this.encryptedUsername = encryptedUsername;
    this.encryptedPassword = encryptedPassword;
  }
}
export default CredentialToken;