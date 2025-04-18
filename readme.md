# SecureIT

## Video Demo

## Description

SecureIT is a password manager extension which works within the bounds of your own chrome window. All of the logic storage and security is being done locally. NO DATA LEAVES YOUR MACHINE, with the exception of the Login feature where the data is infilled to the Login forms from which your credentials were scraped.

## TLDR

The short description pretty much speaks for itself, meaning, everything (including logic, encryption, control flow, storage) happens in your local browsers execution environment.

Encryption algorithm used: AES-GCM

Hashing algorythm used: SHA-256

Key derivation function used: PBKDF2

Storage used: chrome.storage.local

The use of AI: Ai was used as a search engine substitute.

## Reference List

- [Files](#Files)
- [General Overview](#General-Overview)
- [UI](#UI)
- [Controll Flow](#Controll-Flow)
- [Encryption](#Encryption)
- [Web Scraping](#Web-Scraping)
- [Tertiary Heading 3](#tertiary-heading-3)
- [Tertiary Heading 3](#tertiary-heading-3)

## Files

**./Encrypt/Encrypt.js**
Source file for encryption functions and their ascociates.

**./Helpers/Helpers.js**
Source file for data storage and data manipulation functions. 

**./Injected/Scraper.js**
This is the content script that handles the collection, infilling, storage, encrypion and decryption of user data.

**./Styles/Ppopup.css**
Styling for the popup windows

**./UI/Index.html**
User interface for user registration and (or) authentication.
**./UI/Index.js**
The logic for Index.html, handles the data collection encryption and storage of user data.

**./UI/logged.html**
User interface for user data manipulation, also this is the popup the user sees, whenever they are logged in
**./UI/logged.js**
Logic, for logged.html handles the events of user actions.

**./UI/Correction.html**
User interface form for manually changing passwords
**./UI/Correction.js**
handles the logic of changing user data on record

**./Bacground.js**
Handles logic for the whole pextension, like changing popup window based on user status, sending mesages to the content script, saving the data locally etc etc.

**manifest.json**
Necesary base layer
**readme.md**
Best attempt at a concise description


## General Overview

This project is a locally hosted password manager. Since all data is stored on the user's machine, it's easily accessible, which made securing it a real challenge. An obvious solution was to encrypt everythin important, but then the question arose, "How and where would I store the encryption keys?".
The most secure option would have been to prompt the user for their master key, every time an encryption or decryption operation would be needed, thus avoiding the need to securely store decryption keys, but this felt like defeating the purpose of a password manager by making it hard and tedious to use.

At last, i opted for a **"log in once use it till browser closure / log out / user deletion"** approach. I chose this option because of the usability benefits it would bring. Making it secure though prooved to be quite tricky. I decided to not store encryption and decryption keys at all, rather I would opt for **Deriving the Keys on demand** based on some collected and stored user data, and random values.

On this road i've learned the basics of authentication, cryptography, secure storage, event managment, and secure content script-backgroundscript communications.


## Controll Flow

### Abstract:

SecureIt follows a linear path:
    Authenticate User
    Collect Data
    Encrypt Data
    Store Data
    Retrieve Data on demand

### Detailed

The first page the user sees is the login screen (Index.html) it has a corresponding JavaScript file (Index.js) that handles it's logic. There are 2 paths. 1. The registration route, 2. The login route. Both of them, if successful redirect the user to the SecureIT's inner page (logged.html) this too has a corresponding JavaScript file, (logged.js) which handles the logic of user interactions.

Once the user is logged in SecureIT will look through the currently focused page looking for login forms. If it finds one it flags the form and adds an event listener for the "Log In" button (or an equivlent). On clicking the button, SecureIT collects and encrypts the form data and then saves it locally. After this process SecureIT submits the form, thus logging the user in.

Once stored, SecureIT will automatically infill the users credentials whenever they visit said website again.

If the user later on changes the password for a specific website, SecureIT supports a password / username changing option under the "Update" button. This will redirrect the user to the "correction" page (Correction.html). this pages logic is supported by its specific javascript file (Correction.js)

SecureIT supports permanent data deletion, under the "DELETE button on the inner page (logged.html). Pressing this button will prompt the user for the registered master password. Once the user has been authenticated it will be prompted one more time to confirm their intentions and in the case of the affirmative, all of the stored data for that specific user will be deleted and SecureIT redirrects to the login page.

### Authentication

This is the first step that the user has to complete to utilize SecureIT. Authentication is resolved in Index.js.
Form data is collected from the login form on index.html. By collected I mean sanitized, trimmed, and verified if fits the minimal and maximal character lengths thus avoiding any injection attacks. 
After this the path the user takes branches out into 2:

#### Registration path:

    Abstract:
        Generate Necesary random values
        Hash Username and Password
        Derive an encryption key
        Encrypt the password
        Store it Locally
        Create Session
        Temporarily store it Locally
        Redirect user to the interior page.
        

    In Depth:

SecureIT generates the necesary random values for User Registration(MasterSalt, EncryptionSalt, MasterKeyIV, UserID). This process utilises the Web Crypto Api to create cryptographically secure random values.

After this the Username and Password are Hashed with SHA-256. I opted to not Salt the username, since everything works locally, its highly unlikely to have so many users, on a home computer that there would be collisions. Also The username is only used as a key to find and (or) store the registration data locally, thus not necesitating encryption. 

The password though goes through a more complicated journey, of which i talk under the [**Encryption**](#Encryption) section. 
TLDR on it, the user provided password is the base for both the encryption key for the user Object, and the Key base for later password encryption purposes. only one of these keys is stored, thus only one stays on the users machine permanently. the other (Encryption Key) is derived only once duriong the [Login Route](#Login-Route)




Te securing process converts the password from a **string** into an **array**, then into a **Unit8Array** (for the encryption algorythm to work), then into a regullar **array** again.The last conversion is an absolute necesity, because othervise SecureIT cant store the encryppted data locally.

After Securing 

For the Password though i created a function that splices the password string with one of the pseudo random values (MasterSalt). I did this to make the password more random, and it felt more secure to splice the arrays rather then just combining them. I made my own function (./Encrypt/Encrypt.js/Splice(input,salt)) for this, since i wanted to excercise a bit with arrays.

This Spliced password will be used later to encrypt all the other passwords SecureIT would find, but before that it needs to be stored securely, both permanently (User authentication purposes), and temporarily (encryption and decryption Purposes). I opted to separate these concerns, thus making the process more compartmentalized and isolated.


#### Login Route



## Encryption

### Design Iterations

Out of all steps I had the most issues with the encryption process. 
My first idea was to just hash the passwords in a reversable way, then store them locally. Needless to say, this was thrown out of the window because security considrerations. Not only could the passwords been seen by anyone with the help of the dev tools, but since the project would be open sourced, the algorythm would be readily avaliable, also security by obscurity is not the best method on the market.
My second idea was to use already available cryptography by utilizing the **Web Crypto API** and this is where the learning curve began to steepen.
First i have learned that the web crypto API's encryption methods don't just take any inputs, but need specific crypto key objects for them to work, thus I had to create a Proper Key derivation function. This opened up another can of worms though.
Initially i wanted to store the generated encryption key locally to save on computing power, however this proved too difficult. Converting the encryption key into an encryptable format, where no corruption would occour, encrypting it, storing it, decrypting it and recompiling it made it too much of a hustle, so i opted for another approach.
Instead of deriving a master encryption key from the login process, which i would encrypt and store, I opted to derive the master key on demand, from its parts. This too lead to some issues that needed to be solved.
I needed a way to derive the master key on demand, securely. thus i opted for a muly pronged, compartmentalized approach.
 

## Web Scraping

Any and all webscraping are done by Scraper.js. It is the content script that reacts to messages sent from the backgroundscript. There are 2 paths to it.
1. Scrape:
IF the message recieved is"scrape" then secureIT will look for login forms


###
#   D e f i n i e t l y - N o t - A - P a s s w o r d - M a n a g e r  
 