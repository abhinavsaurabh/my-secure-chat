
# Secure Chat Application - End-to-End Encrypted Real-Time Communication

A **secure, end-to-end encrypted** group chat built with **Node.js**, **Express**, **Socket.IO**, and **HTTPS**. Messages are encrypted **in the browser** using a passphrase-derived AES key, so the server *cannot* read plaintext messages. This application is ideal for small groups of friends who need a simple, self-hosted, private chat solution.

---

## Features

- **End-to-End Encryption (E2EE)**: Messages are encrypted and decrypted in the browser using AES-GCM with a shared passphrase.
- **HTTPS + Socket.IO**: Communicates over an encrypted channel to prevent passive sniffing.
- **Group Chat**: Everyone with the same passphrase can decrypt and view the messages.
- **Username Support**: Each user can choose a unique username.
- **Temporary Chat History**: Stores chat messages in memory for up to 10 minutes, including timestamps for each message.
- **No Database Required**: Messages are relayed in-memory and not stored permanently (unless extended to persist encrypted messages).

---

## Security Disclaimer

1. **Self-Signed Certificates**:  
   This demo includes self-signed certificates (`cert.pem` and `key.pem`). Your browser will warn you about these certificates because they are not issued by a recognized Certificate Authority. For production, replace them with **valid certificates** (e.g., using [Let’s Encrypt](https://letsencrypt.org/)).

2. **Shared Passphrase**:  
   All participants need to know the same passphrase to derive the shared AES key. Anyone with the passphrase can decrypt the messages, so keep it secure.

3. **Metadata**:  
   Although the server never sees plaintext messages, it logs connection times, usernames, and message frequency. For higher anonymity, consider deploying the app via a privacy network like Tor or using a VPN.

4. **Production Use**:  
   For a robust production-level system, consider integrating a persistent datastore and a more advanced key exchange protocol (e.g., Signal Protocol or Double Ratchet) for enhanced forward secrecy and identity verification.

---

## Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/my-secure-chat.git
   cd my-secure-chat
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **(Optional) Generate New Certificates:**
   If you do not want to use the provided placeholder certificates, you can generate new ones:
   ```bash
   openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 365
   ```
   This command will overwrite the existing `key.pem` and `cert.pem` files with your newly generated ones.

4. **Start the Server:**
   ```bash
   npm start
   ```
   or
   ```bash
   node index.js
   ```
   By default, the server listens on **port 3000** over HTTPS.

---

## Usage

1. **Open Your Browser:**
   Navigate to:
   ```
   https://localhost:3000
   ```
   (If you’re using the self-signed certificate, accept the browser warning for local testing.)

2. **Join the Chat:**
   - Enter a **username** (e.g., "Alice").
   - Enter a **passphrase** (e.g., "mySecret123").  
     All participants must use the *exact same passphrase* to decrypt each other's messages.

3. **Chat:**
   - Messages are encrypted locally before being sent.
   - Every message includes a timestamp (converted to local time) and is stored in the chat history for 10 minutes.
   - New clients receive the chat history from the last 10 minutes when they join.

---

## How It Works

1. **Passphrase → AES Key:**  
   Each client uses the browser’s [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) to derive a 256-bit AES-GCM key from the shared passphrase using PBKDF2.

2. **Client-Side Encryption:**  
   - Messages are encrypted in your browser before being transmitted.
   - The server only relays the ciphertext, the initialization vector (IV), the username, and a timestamp.

3. **Socket.IO Communication:**  
   Used for real-time bidirectional communication. Each message event contains `{ iv, ciphertext, fromUser, timestamp }`.

4. **HTTPS:**  
   - Provides a secure transport layer to ensure that no one can intercept and view the encrypted data in transit.
   - For production environments, use a valid SSL certificate.

5. **Temporary Chat History:**  
   The server stores chat messages in memory for 10 minutes. When a new client connects, they receive this history so they can see recent messages.

---

## Author

**Abhinav Saurabh**

- **LinkedIn:** [Abhinav Saurabh](https://www.linkedin.com/in/abhinavsaurabh2/)
- **Email:** [abhinav20127@iiitd.ac.in](mailto:abhinav20127@iiitd.ac.in)

---

## Contributing

Pull requests and issues are welcome! Feel free to suggest improvements such as:

- Persisting encrypted messages in a database.
- Implementing a more advanced key exchange or identity verification mechanism.
- Enhancing the UI or overall user experience.

---

## License

[MIT License](LICENSE) (or choose another license as appropriate).

---

**Happy Private Chatting!**
