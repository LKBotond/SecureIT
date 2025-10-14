class CredentialToken {
  constructor(
    passSalt,
    nameIV,
    passIV,
    encryptedUserName,
    encryptedPassword,
    url
  ) {
    this.passSalt = passSalt;
    this.nameIV = nameIV;
    this.passIV = passIV;
    this.encryptedUserName = encryptedUserName;
    this.encryptedPassword = encryptedPassword;
    this.url = url;
  }
}
export default CredentialToken;
