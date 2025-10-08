class AESGCM {
  constructor(textEncoder, textDecoder){
    this.textEncoder=textEncoder;
    this.textDecoder=textDecoder;
  }
  async encryptString(input, key, iv) {
    //make The Input string into an array
    const convertedInput = this.textEncoder.encode(input);

    //encrypt it with AES-GCM
    const encrypted = await self.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: this.textEncoder.encode(iv) },
      key,
      convertedInput
    );

    //return the encrypted data
    return encrypted;
  }
  async decryptString(input, key, iv) {
    //Decrypt it with AES-GCM
    const decrypted = await self.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: this.textEncoder.encode(iv) },
      key,
      input
    );

    //return the decrypted data
    return this.textDecoder.decode(decrypted);
  }
}

export default AESGCM;