# SecureIT

## Video Demo

## Description

SecureIT is a password manager extension which works within the bounds of your own chrome window. All the logic, storage and security are being done locally. NO DATA LEAVES YOUR MACHINE, except when you have to send data via a registered Login Form.

## TLDR

The short description pretty much speaks for itself, meaning, everything (including logic, encryption, control flow, storage) happens in your local browser's execution environment.

Encryption algorithm used: AES-GCM

Hashing algorithm used: SHA-256

Key derivation function used: PBKDF2

Storage used: chrome.storage.local, chrome.storage.session

The use of AI: Ai was used as extended IntelliSense and as a search engine substitute.

## Reference List

- [Files](#Files)
- [General Overview](#General-Overview)
- [control Flow](#Control-Flow)
- [DIY Test](#Testing)
- [Encryption](#Encryption)
- [Web Scraping](#Web-Scraping)
- [Post scriptum and a potential threat model](#Post-scriptum-and-a-potential-threat-modell)

## Files

- **./Encrypt/Encrypt.js:** Source file for encryption functions and their associates.
- **./Helpers/Helpers.js:** Source file for data storage and data manipulation functions.
- **./Injected/Scraper.js:** This is the content script that handles the collection, infilling, storage, encryption and decryption of user data.
- **./Styles/Ppopup.css:** Styling for the popup windows
- **./Test**
    - **/Test_failed.html:** Window the test redirects to if test log in failed.
    - **/Test_Success.html:** Window the test redirects to if test login succeeds.
    - **/test.css:** Styling for the test
    - **/test.html:** Main test login form
    - **/test.js:** Logic for maneuvering amongst the test pages and for a very basic "login / register" logic.
- **./UI**
    - **/Index.html:** User interface for user registration and (or) authentication.
    - **/Index.js:** The logic for Index.html, handles the data collection encryption and storage of user data.
    - **/logged.html:** User interface for user data manipulation, also this is the popup the user sees, whenever they are logged in
    - **/logged.js:** Logic, for logged.html handles the events of user actions.
    - **/Correction.html:** User interface form for manually changing passwords
    - **/Correction.js:** handles the logic of changing user data on record
- **./background.js:** Handles logic for the whole extension, like changing popup window based on user status, sending messages to the content script, saving the data locally etc, etc.
- **manifest.json:** Necessary base layer

**readme.md:** 
Best attempt at a concise description

## General Overview

This project is a locally hosted password manager. Since all data is stored on the user's machine, it's easily accessible, which makes securing it a real challenge. An obvious solution was to encrypt everything important, but then the question arose, "How and where would I store the encryption keys?".
The most secure option would have been to prompt the user for their master key, every time an encryption or decryption operation would be needed, thus avoiding the need to securely store decryption keys, but this felt like defeating the purpose of a password manager, by making it hard and tedious to use.

At last, I opted for a **"log in once use it till browser closure / log out / user deletion"** approach. I chose this option because of the usability benefits it would bring. Making it secure though proved to be quite tricky. I decided to not store encryption and decryption keys at all, rather I would opt for **Deriving the Keys on demand** based on some collected and stored user data, and random values.

On this road I’ve learned the basics of authentication, cryptography, secure storage, event management, and secure content script-background script communications.

## Control Flow

### Abstract:

SecureIT follows a linear path:
- Authenticate User
- Collect Data
- Encrypt Data
- Store Data
- Retrieve Data on demand

### Detailed

The first page the user sees is the login screen (Index.html) it has a corresponding JavaScript file (Index.js) that handles it's logic. There are 2 potential paths. The **[ Registration path](#Registration-path)** and the **[Login path](#Login-path)**. Both, if successful redirect the user to SecureIT's inner page (logged.html) this too has a corresponding JavaScript file, (logged.js) which handles the logic of user interactions.

Once the user is logged in, SecureIT will look through the currently focused page looking for login forms. If it finds one, it flags the form and adds an event listener for the "Log In" button (or an equivalent). On clicking the button, SecureIT collects and encrypts the form data and then saves it locally. After this process, SecureIT submits the form, thus logging the user in.

Once stored, SecureIT will automatically infill the user’s credentials whenever they visit said website again.

If the user later changes the password for a specific website, SecureIT supports a password / username changing option under the "Update" button. This will redirect the user to the "correction" page (Correction.html). This page’s logic is supported by its specific JavaScript file (Correction.js)

SecureIT supports permanent data deletion, under the "DELETE button on the inner page (logged.html). Pressing this button will prompt the user for the registered master password. Once the user has been authenticated it will be prompted one more time to confirm their intentions and in the case of the affirmative, all the stored data for that specific user will be deleted and SecureIT redirects them to the login page.

### Authentication

This is the first step that the user must take to utilize SecureIT. Authentication is resolved in Index.js.
Form data is collected from the form on index.html. By collected I mean sanitized, trimmed, and verified if fits the minimal and maximal character lengths thus avoiding any injection attacks.
After this the path the user takes branches out into 2, based on if the "Login" or "Register" button was clicked.

#### Registration path:

**Abstract:**
- Generate Necessary random values
- Hash Username and Password
- Derive a key base from the password
- Derive an encryption Key from the password
- Encrypt the password
- Store it Locally
- Create Session
- Temporarily store it Locally
- Redirect user to the interior page.

**In Depth:**

SecureIT generates the necessary random values for User Registration (MasterSalt, EncryptionSalt, MasterKeyIV, UserID). This process utilizes the Web Crypto Api to create cryptographically secure random values.

After this the Username and Password are Hashed with SHA-256. I opted to not Salt the username, since everything works locally, it’s highly unlikely to have so many users on a home computer that there would be any collisions. Also, The username is only used as a key to find and (or) store the registration data locally, thus not mandating encryption.

The password though goes through a more complicated journey, of which I describe under the [**Password security**](#Password-security) section in the [Encryption](#Encryption) chapter.
TLDR on it, the user provided password is the base for both an **encryption key** for the user Object, and the **Key base** from which later encryption keys are derived. The **Key base** is then encrypted by the **encryption key** and stored within the user object. After creating the user a temporary session is created which stores an encrypted version of the **Key base** and some necessary random values.

After the password and the session are secured, the user is redirected to the interior of the app and SecureIT will henceforth scrape newly visited websites.

#### Login path:
**Abstract:**
- Hash username
- Retrieve user object
- Hash password
- Derive an encryption key
- Decrypt the stored Key base
- Validate it with the password hash
- Create Session
- Redirect user to the interior page.

**In Depth:**
First things First the username is hashed to retrieve the previously stored **User object**, if not found, the user is alerted.

After getting the object, SecureIT tries to decrypt the stored **master key base**, if successful the decrypted Key is compared with the rehashed version of the newly input password. If both steps complete, a session is created, and the user is logged in and redirected to the interior of the app.

## Testing
If you want to see how SecureIT works, there is a test folder. It contains files which will help demonstrate SecureIT's flow.
### ABSTRACT:
- Register a user in SecureIT's Login form.
- Load test.html
- Register a user on test.html
- log in on test.html

### Detailed:
First things first, register a user into SecureIT by clicking on the extension’s icon. Fill out the login form and press the register. This will create a User (you will find it in local storage) and redirect you to SecureIT's interior popup. 
Open test.html in the browser where SecureIT is loaded.
Fill out the Login form then click register; this will create a temporary user object within session storage. thus, making sure no junk data is going to fill your hard drive.
Reload the page to trigger a "Web navigation" event, then "Log in" by filling out the form with the previously registered credentials.
If you open the dev tools you should see 3 entries in the extension local storage. One for the registered user object, and one with the URL for test.html, where you logged in to your user.
After going back to the original page, SecureIT, should automatically fill out the form and will log you in again.

## Encryption

### Design Iterations

Out of all steps I had the most issues with the encryption process. My first idea was to just hash the passwords in a reversable way, then store them locally. Needless to say, this was thrown out of the window because of security considerations. Not only could the passwords be seen by anyone with the help of the dev tools, but since the project would be open sourced, the algorithm would be readily available thus making the whole thing obsolete. Also, security by obscurity is not the best method on the market.
My second idea was to use already available cryptography by utilizing the **Web Crypto API** and this is where the learning curve began to steepen.
First I have learned that the web crypto API's encryption methods don't just take any inputs, but need specific crypto key objects for them to work, thus I had to create a Proper Key derivation function. This opened another can of worms though.
Initially I wanted to store the generated encryption key locally to save on computing power, however this proved a bit tricky. Converting the encryption key into an encrypt able format, where no corruption would occur, encrypting it, storing it, decrypting it and recompiling it made it too much of a hustle, so I opted for another approach.
Instead of deriving a master encryption key once from the login process, which I would encrypt and store, I opted to derive the **Base of the master key** during the login process, encrypt it and store it locally, then derive the necessary Crypto Keys from it on demand. This too led to some issues that needed to be solved.
The issue was combining secure storage and accessibility. What I did eventually was a multipronged compartmentalized approach.

### Password security

**Abstract:**
- collect password string
- splice it with a salt
- hash it with SHA-256
- derive an encryption key with a different salt
- encrypt the spliced password for user authentication
- encrypt the spliced password by a session key for the session

**Detailed:**
After the password string is collected, it is first spliced with an array of cryptographically secure random values. I created a function that splices the password string with one of the pseudo random values (MasterSalt). I did this to make the password more random, and it felt more secure to splice the arrays rather than just concatenating them. I made my own splicing function, since I wanted to do some algorithmic exercise (./Encrypt/Encrypt.js/Splice(input,salt)). 
Once the splicing is done the password is hashed by SHA-256. The result of this process is the **"Master Key Base"**
To store it securely it is Encrypted by an **"Encryption Key"**. This crypto key is derived by utilizing PBKDF2, with the unspliced initial user password as input, in combination with a different **"Encryption Salt"**. This process gives us the crypto key with which SecureIT encrypts the **"Master Key Base"**. The encryption process also makes use of a 16-byte sized cryptographically secure pseudo random initiation vector. This gives us a version of the **"Master Key Base"** which is then used for user [authentication purposes](#Login-path)
Since I needed a version of the **Master Key Base** to be readily available to encrypt, and decrypt all the other passwords, I opted for session based storage as well.
#### Session storage:
The session is set up by the **"createSession()"** function which lives in **"Encrypt\Encrypt.js"**. It holds amongst a bunch of necesary random values, 2 very important ones when it comes to password security, these being **sessionID** and **sessionSalt**. These are 16 byte long cryptographically secure pseudo random values, from which a **session specific encryption** key is derived. **THIS KEY IS NEVER STORED DIRECTLY**, only derived when needed to encrypt or decrypt the **Master Key Base**. 
The session specific encrypted version of the **Master Key Base** is then stored within the session token in chrome.storage.session.
#### Data type journey:
The securing process converts the password from a **string** into an **array**, then into a **Unit8Array** (for the encryption algorithm to work), then into a regular **"base64array"** again. The last conversion is an absolute necessity, because otherwise SecureIT can’t store the encrypted data locally. It was interesting to learn about the different shapes; data can take, and the shape it must take for certain processes to work properly. 
#### Collected Credentials:
When SecureIT finds data to collect it derives a custom crypto key from the "master Key Base" stored in session and a custom local salt. It then encrypts the data with this key, which only lives in memory. The salt is then saved with the encrypted username and password. I opted to differentiate crypto keys with different salts, this made key derivation and storage easier. The unencrypted key base is never stored directly, only decrypted and derived when needed, this approach combined feasibility and security in an optimal manner.
## Web Scraping
### TLDR
Any and all web scraping are done by Scraper.js. It is the content script that reacts to messages sent from the background script. Some helper functions were copied over from their respective files, because of scope limitations. TLDR content script modules are not supported in manifest v3.
**There are 2 possible paths SecureIT can take:**
1. Scrape
2. Infill
Both of these are only accessed after the content script fires. The one chosen depends on the message received from the background script. The message itself depends on if the visited website's URL is in the database.
**The Scrape** route is fired if the URL is not in the database, and as the name suggests, it scrapes it for login information, which is then encrypted and stored locally.
**The Infill** route is taken if the URL is within the database. in this case the credentials are retrieved decrypted and infilled to the login form.
### Web scraping control flow:
#### Abstract:
- Establish a secure port between content script and background script
- Load the users database
- Look for the website's URL
- If found send through the loaded data:
    - The login form is completed and submitted
- If not found, request web scraping:
    - Look for Login Forms
    - IF found:
        - Tag the "Login Button" or equivalent
        - On click event prevent the form from submitting
        - Scrape the form for credentials
        - Encrypt them and send them through the port
        - Update the database in the background script
    - IF no Login form found:
        - relay this information

#### Detailed:
**Secure port:**
The background script always listens to "webnavigation.oncompleted" events, these serve as triggers for the web scraping action. When one fires the background script (background.js) establishes a port with the content script of the page where the navigation occurred.
The content script always listens to "chrome.onConnect" events, these serve as triggers for further actions. Once an event like these fires, the content script first checks if the port is from the background script, if the port connection attempt does not originate from the background script it will be disconnected on the spot. 

**Web scraping:**
After the port is set up and connected, the background script loads the user database, identified by the users id (user_ID) retrieved from session the session token. 
If the current URL is found within the database SecureIT retrieves the saved credentials, and sends them through the port to be decrypted and infilled into the websites Login form.
If SecureIT doesn't find the URL within the database, it will send a message ("scrape") to initiate the web scraping process.

**DOM interactions:**
SecureIT looks for Login forms by identifying their constituent elements. First it looks for every single form on the DOM, then looks through each input and button of each form. Once it finds an input field for a "username", a "password", and finds a "Log In" button, SecureIT flags the button and adds an event listener to it for click events. On triggered the form is prevented from being submitted, instead SecureIT collects the input user data, [**encrypts it**](#Collected-Credentials) then sends the encrypted data to the background script to be stored in the database.
If no login form is found, SecureIT returns a message as such and disconnects the port.
CURRENTLY LIMITED TO TRADITIONAL LOGIN FORMS.

## Post scriptum and a potential threat model:
I tried to make it as secure as possible, by isolating and securing every potential attack vector. SecureIT uses a **strong encryption algorithm(AES-GCM)**, **session-based crypto keys also derived by a strong algorithm (PBKDF2 with SHA-256)** and all data that is **permanently stored stays encrypted on the user’s machine**.
One potential approach that is still open though is the fact that the users machine can be compromised. Since the Keys are secured by an encryption key itself stored encrypted within the session, if an attacker gains control over the execution environment, it can decrypt the session key, by rederiving the session encryption key, and with that and the stored salts, the encryption keys for the passwords and usernames can be re derived, and thus an attacker might gain access to this data. However, this vulnerability is not unique to SecureIT, it is a fundamental limitation for all software operating in a compromised environment.

TLDR
**SecureIT is only as secure as the execution environment, but this is a fundamental limitation of every software**.
Under normal conditions, SecureIT provides strong protection for your credentials, to ensure these, take steps to de malware your machine and keep everything up to date.
