class AESGCM {
  constructor(textEncoder, textDecoder){
    this.textEncoder=textEncoder;
    this.textDecoder=textDecoder;
  }
  async encryptString(input, Key, IV) {
    //make The Input string into an array
    const convertedInput = this.textEncoder.encode(input);

    //encrypt it with AES-GCM
    const Encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: this.textEncoder.encode(IV) },
      Key,
      convertedInput
    );

    //return the encrypted data
    return Encrypted;
  }
  async decryptString(input, Key, IV) {
    //Decrypt it with AES-GCM
    const Decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: this.textEncoder.encode(IV) },
      Key,
      input
    );

    //return the decrypted data
    return this.textDecoder.decode(Decrypted);
  }
}

export default AESGCM;