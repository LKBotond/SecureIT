//Registration
    //Register.js
    //Username and password taken new user is created
    //Username is hashed and stored as Userhash
        //UserHash is used for autentication purposes
    //UserID is Hashed witha  different salt From username and
        //ID is used for storing the users data
    //Password is hashed and salted
    //Password is encrypted and stored as Mkey
//Login 
    //Login.js
    //Username and password are taken
    //Username is hashed and stored as Hashed
    //Hashed is used to get The stored and encrypted Data
    //Password is hashed and salted via the salt from the stored data
    //Password is decrypted and compared to the stored password
        //If they match a session token is created and saved locally
        //User is redirected to the App

//session token
    //sessionToken is created when the user logs in or Registers
    //sessionToken is used to store necesary data for the session

//Encryption
    //session token contains the ID, encrypted DerivedKey and current IV from userdata
        //Derived key is created from the MasterKey, the stored salt with a temproary IV
        //DerivedKey is used to encrypt and decrypt the stored passwords
        //Derived key is encrypted with the session ID as the key and a temproary IV
        //Derved key is decrypted when needed to encrypt and decrypt the stored passwords
        //sessionToken is deleted when the user logs out or the browser closes

//Flow
    //Background.js casts the URLS in stone
        //On webnavigation, look for the URL is the list of objects
        //If yes
            //extract it, send a message to the content script, containing the encripted credentials
        //If no
            //send a message to the contentscript to extract the credentials
            //Listen for response
            //If LoginData found
                //add the URL to the list of objects


//Object prototypes

//User
/*
let User = {
    Mkey: Password,
    salt: PassSalt,
    IV: PassIV,
    autolog: false
    UserId:null
};
*/

//session
/*
const sessionToken = {
    UserHash: Hash,
    Key: EncryptedKey,
    CurrentIV: IV,
    CurrentID: sessionID,
    UserId:null
  };
*/

//URL
/*
let collected = {
  Username: null,
  Password: null,
  IV: null,
};
*/

//Credentials
/*
let credentials = {
    Url: window.location.href,
    formReference: form.getAttribute("id") || form.getAttribute("name") || form.tagName,
    IV: null,
    EncryptedKey:null,
    username: null,
    password: null,
  };
*/


//plan
//get Username and password => Hash Username, Hash Password with PBKDF2 => Rehash the password with PBKDF2 name it DerivedKey=> Encrypt the original Password and save it with the Userhash and the IV for encription, also save the 2 unique salts 

//new plan
//Register
    //Get Username and password
    //Hash the username with Uhash
    //Hash password with HashIt
    //Get a derived key by PKDF2
    //encrypt the master key locally with the derived key

//Login
    //Get Username and password
    //Hash the username with Uhash
    //Hash password with HashIt
    //Get a derived key by PKDF2
    //decrypt the master key locally with the derived key
    //compare the password with the stored password
    //If Matched
        //Create a session token
        //Derive a new Key from Master Key and a


//Session Token Stores:
//    UserHash: Hash,           (User authentication)
//    Key: EncryptedKey,        (Derived From MasterKey)
//    CurrentIV: IV,
//    CurrentID: sessionID,
//    UserId:null


