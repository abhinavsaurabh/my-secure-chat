// client.js

let socket = null;
let derivedAesKey = null;
let currentUsername = null;

/**
 * Initialize chat after user enters username & passphrase.
 */
async function initializeChat(username, passphrase) {
  // 1. Derive shared AES key from passphrase
  derivedAesKey = await deriveKeyFromPassphrase(passphrase);
  currentUsername = username;

  // 2. Connect to the server via Socket.IO (over HTTPS)
  socket = io({ secure: true, rejectUnauthorized: false });

  // 3. Set username on the server
  socket.emit('set username', currentUsername);

  // 4. Listen for incoming encrypted messages
  socket.on('encrypted message', async (data) => {
    // data = { iv, ciphertext, fromUser }
    try {
      const { iv, ciphertext, fromUser } = data;
      const plainText = await decryptMessage(iv, ciphertext, derivedAesKey);
      appendMessage(`[${fromUser}] ${plainText}`);
    } catch (err) {
      console.error('Error decrypting message:', err);
    }
  });
}

/**
 * Encrypt and send a message via Socket.IO.
 */
async function sendEncryptedMessage(plainText) {
  if (!derivedAesKey) return;
  const encryptedData = await encryptMessage(plainText, derivedAesKey);
  socket.emit('encrypted message', encryptedData);
}

/**
 * Helper to append a message to chat box.
 */
function appendMessage(msg) {
  const messagesDiv = document.getElementById('messages');
  const div = document.createElement('div');
  div.textContent = msg;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// -- UI Hooks --

document.getElementById('joinBtn').addEventListener('click', async () => {
  const username = document.getElementById('username').value.trim();
  const passphrase = document.getElementById('passphrase').value.trim();
  if (!username || !passphrase) {
    alert('Please enter both a username and a passphrase.');
    return;
  }

  // Initialize chat
  await initializeChat(username, passphrase);

  // Hide the login section and show the chat section
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('chat-section').style.display = 'block';
});

document.getElementById('messageForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const messageInput = document.getElementById('messageInput');
  const plainText = messageInput.value.trim();
  if (plainText) {
    await sendEncryptedMessage(plainText);
    messageInput.value = '';
  }
});
