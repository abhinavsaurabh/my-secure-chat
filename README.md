
# my-secure-chat

A **secure, end-to-end encrypted** group chat built with **Node.js**, **Express**, **Socket.IO**, and **HTTPS**. Messages are encrypted **in the browser** using a passphrase-derived AES key, so the server *cannot* read plaintext messages. Ideal for small groups of friends who need a simple, self-hosted, private chat solution.

---

## Features

- **End-to-End Encryption (E2EE)**: Messages are encrypted/decrypted in the browser using AES-GCM with a shared passphrase.  
- **HTTPS + Socket.IO**: Communicates over an encrypted channel to prevent passive sniffing.  
- **Group Chat**: Everyone with the same passphrase can decrypt and view the messages.  
- **Username Support**: Each user can choose a unique username.  
- **No Database Required**: Messages are relayed in-memory and not stored (unless you extend it to persist encrypted messages).

---

## Security Disclaimer

1. **Self-Signed Certificates**:  
   This demo includes self-signed certificates (`cert.pem`, `key.pem`). You will see a browser warning because they are not issued by a recognized Certificate Authority. For production, replace them with **valid certificates** (e.g., [Let’s Encrypt](https://letsencrypt.org/)).

2. **Shared Passphrase**:  
   All participants need to know the same passphrase to derive the *shared AES key*. Anyone with the passphrase can decrypt the messages.

3. **Metadata**:  
   The server knows when users connect, their chosen usernames, and message timestamps. If anonymity is crucial, consider running as a [Tor hidden service](https://community.torproject.org/onion-services/) or behind a VPN.

4. **Real Production Use**:  
   For high-security use cases, you should consider more robust protocols (like [Signal Protocol](https://signal.org/docs/) or [Double Ratchet](https://en.wikipedia.org/wiki/Double_Ratchet_algorithm)) for forward secrecy and identity verification.

---

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/my-secure-chat.git
   cd my-secure-chat
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **(Optional) Generate new certificates**:
   If you do not want to use the placeholder cert/key:
   ```bash
   openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 365
   ```
   This overwrites `key.pem` and `cert.pem` with your newly generated files.

4. **Start the server**:
   ```bash
   npm start
   ```
   or
   ```bash
   node index.js
   ```
   By default, it listens on **port 3000** (HTTPS).

---

## Usage

1. **Open your browser** and go to:
   ```
   https://localhost:3000
   ```
   - If you’re using the self-signed certificate from this repo, your browser will warn you. Accept the warning (for local testing).

2. **Join the Chat**:
   - Enter a **username** (e.g., "Alice").
   - Enter a **passphrase** (e.g., "mySecret123"). This passphrase is used to derive the AES-GCM encryption key. All participants must use the *exact same passphrase* to view each other's messages.

3. **Send Messages**:
   - Type your message and click "Send".
   - Your message is encrypted **locally** and sent to the server as ciphertext. The server never sees plaintext.

---

## How It Works

1. **Passphrase → AES Key**:  
   Each client uses the browser’s [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) to derive a 256-bit AES-GCM key from the passphrase (via PBKDF2).

2. **Client-Side Encryption**:  
   - Messages are encrypted in your browser before being sent.
   - The server only relays ciphertext; it cannot decrypt the messages.

3. **Socket.IO**:  
   Used for real-time bidirectional communication. Each message event contains `{ iv, ciphertext, fromUser }`.

4. **HTTPS**:  
   - Ensures nobody can snoop on the ciphertext in transit.
   - For truly trusted certificates, replace the self-signed files with real certificates.

---

## Production Considerations

- **Port 443 & Valid TLS**:  
  For production, you typically want a valid SSL certificate and run on port 443 or behind a reverse proxy (e.g., Nginx or Caddy).

- **Scalability**:  
  For a few friends, a single Node.js process is enough. For more users or logs, consider adding a database for storing *encrypted* messages and possibly horizontal scaling.

- **Key Management**:  
  Currently, each user manually enters the passphrase each time. You can store it securely in [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) or use a more advanced key exchange mechanism (like [Diffie–Hellman](https://en.wikipedia.org/wiki/Diffie–Hellman_key_exchange)) if desired.

- **Threat Model**:  
  The server can’t read your messages, but it does see connection times, usernames, and message frequency. If you need complete anonymity, use Tor or a similar privacy network.

---

## License

[MIT License](LICENSE) (or whichever license you choose).  

---

## Contributing

Pull requests and issues are welcome! Feel free to suggest improvements, such as:

- **Persisting encrypted messages** with a database.  
- **More advanced key exchange** or identity verification.  
- **Enhanced UI** or user experience.

---

### Acknowledgments

- [Node.js](https://nodejs.org/)  
- [Express](https://expressjs.com/)  
- [Socket.IO](https://socket.io/)  
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)  

---

**Happy Private Chatting!**
