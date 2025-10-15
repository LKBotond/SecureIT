class SessionToken {
  constructor(
    userID, //used to get the websites
    userNameHash, //used to delete the user if requested later
    sessionSalt, //used for the sessionKey
    sessionIV, //used to encrypt master Key
    sessionKeyBase, //used to encrtypt the masterKey
    encryptedMasterKey //key for all the other passwords
  ) {
    this.userId = userID;
    this.userNameHash = userNameHash;
    this.sessionSalt = sessionSalt;
    this.sessionIV = sessionIV;
    this.sessionKeyBase = sessionKeyBase;
    this.encryptedMasterKey = encryptedMasterKey;
  }
}
export default SessionToken;
