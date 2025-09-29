class KDF {
  constructor(textEncoder) {
    this.encoder = textEncoder;
  }
  async PBKDF2KeyGen(pass, Salt) {
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      this.encoder.encode(pass),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    const key = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: this.encoder.encode(Salt),
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    return key;
  }

  async hashWithSHA256(input, salt = null) {
    let data = null;
    if (salt) {
      data = this.encoder.encode(interSplice(input, salt));
    } else {
      data = this.encoder.encode(input);
    }

    //Hash it with SHA-256
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  }

  async generateRandom(length) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  interSplice(input, salt) {
    //Make the input and Salt into arrays
    const InputArray = this.encoder.encode(input);
    const SaltArray = this.encoder.encode(salt);

    //set up the total length of the new array
    let TotalLength = InputArray.length + SaltArray.length;
    let Spliced = new Uint8Array(TotalLength);

    //Inter splice the arrays
    let Toggle = true;
    let inputCounter = 0;
    let saltCounter = 0;
    for (let i = 0; i <= TotalLength; i++) {
      if (Toggle) {
        if (inputCounter <= InputArray.length) {
          Spliced[i] = InputArray[inputCounter];
          inputCounter++;
        }
      } else {
        if (saltCounter <= SaltArray.length) {
          Spliced[i] = SaltArray[saltCounter];
          saltCounter++;
        }
      }
      Toggle = !Toggle;
    }
    return Spliced;
  }
}

export default KDF;
