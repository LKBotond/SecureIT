class EncryptionToken{
    constructor(encryptedPass, iv){
        this.encryptedPass=encryptedPass;
        this.iv=iv;
    }
}
export default EncryptionToken;