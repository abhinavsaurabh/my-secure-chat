// crypto.js
//
// We derive a shared AES-GCM key from a passphrase via PBKDF2.
// Everyone using the same passphrase will get the same key,
// allowing them to decrypt each other’s messages.
//

/**
 * Derive an AES-GCM key from a given passphrase.
 * @param {string} passphrase
 * @return {Promise<CryptoKey>} AES-GCM key
 */
async function deriveKeyFromPassphrase(passphrase) {
  const encoder = new TextEncoder();
  // Convert passphrase into key material
  const passphraseKeyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  // A static salt for demonstration. 
  // In real production, consider a random or user-specific salt.
  const salt = encoder.encode('my-fixed-salt-value');

  // Derive a 256-bit AES-GCM key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passphraseKeyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts plainText with AES-GCM.
 * Returns an object: { iv, ciphertext } in base64 form.
 */
async function encryptMessage(plainText, key) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText);

  // Random IV (12 bytes) for AES-GCM
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  // Convert to base64
  const encryptedBytes = new Uint8Array(encryptedBuffer);
  const ivB64 = btoa(String.fromCharCode(...iv));
  const ciphertextB64 = btoa(String.fromCharCode(...encryptedBytes));
  return { iv: ivB64, ciphertext: ciphertextB64 };
}

/**
 * Decrypts the given iv/ciphertext with AES-GCM key.
 * Returns the decrypted plaintext string.
 */
async function decryptMessage(ivB64, ciphertextB64, key) {
  const ivBytes = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
  const ciphertextBytes = Uint8Array.from(atob(ciphertextB64), c => c.charCodeAt(0));

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBytes },
    key,
    ciphertextBytes
  );
  return new TextDecoder().decode(decryptedBuffer);
}
