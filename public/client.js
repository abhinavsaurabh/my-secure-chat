// client.js

let socket = null;
let derivedAesKey = null;
let currentUsername = null;

/**
 * Initializes the chat after the user enters a username & passphrase.
 */
async function initializeChat(username, passphrase) {
  // 1. Derive the shared AES key from the passphrase
  derivedAesKey = await deriveKeyFromPassphrase(passphrase);
  currentUsername = username;

  // 2. Connect to the server via Socket.IO (over HTTPS)
  socket = io({ secure: true, rejectUnauthorized: false });

  // 3. Send the chosen username to the server
  socket.emit('set username', currentUsername);

  // 4. Listen for chat history from the server and display each message
  socket.on('chat history', async (history) => {
    for (const messageData of history) {
      try {
        const { iv, ciphertext, fromUser, timestamp } = messageData;
        const plainText = await decryptMessage(iv, ciphertext, derivedAesKey);
        // Convert timestamp to a local time string
        const timeString = new Date(timestamp).toLocaleTimeString();
        appendMessage(`[${timeString}] [${fromUser}] ${plainText}`);
      } catch (err) {
        console.error('Error decrypting chat history message:', err);
      }
    }
  });

  // 5. Listen for new incoming encrypted messages and display them
  socket.on('encrypted message', async (data) => {
    const { iv, ciphertext, fromUser, timestamp } = data;
    try {
      const plainText = await decryptMessage(iv, ciphertext, derivedAesKey);
      const timeString = new Date(timestamp).toLocaleTimeString();
      appendMessage(`[${timeString}] [${fromUser}] ${plainText}`);
    } catch (err) {
      console.error('Error decrypting message:', err);
    }
  });
}

/**
 * Sends an encrypted message to the server.
 */
async function sendEncryptedMessage(plainText) {
  if (!derivedAesKey) return; // Not ready
  const encryptedData = await encryptMessage(plainText, derivedAesKey);
  socket.emit('encrypted message', encryptedData);
}

/**
 * Appends a message to the chat window.
 */
function appendMessage(msg) {
  const messagesDiv = document.getElementById('messages');
  const div = document.createElement('div');
  div.textContent = msg;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// ---- UI Setup ----

// Handle "Join Chat" button click
document.getElementById('joinBtn').addEventListener('click', async () => {
  const username = document.getElementById('username').value.trim();
  const passphrase = document.getElementById('passphrase').value.trim();
  if (!username || !passphrase) {
    alert('Please enter both a username and a passphrase.');
    return;
  }

  // Initialize the chat and establish the connection
  await initializeChat(username, passphrase);

  // Hide the login section and show the chat section
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('chat-section').style.display = 'block';
});

// Handle sending a message via the chat form
document.getElementById('messageForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const messageInput = document.getElementById('messageInput');
  const plainText = messageInput.value.trim();
  if (plainText) {
    await sendEncryptedMessage(plainText);
    messageInput.value = '';
  }
});
