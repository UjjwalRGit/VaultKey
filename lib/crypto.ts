// Encryption and decryption utilities using Web Crypto API

const PBKDF2_ITERATIONS = 100000
const SALT_LENGTH = 16
const IV_LENGTH = 12

interface EncryptedData {
  filename: string
  salt: Uint8Array
  iv: Uint8Array
  data: Uint8Array
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(password)

  const keyMaterial = await crypto.subtle.importKey("raw", passwordBuffer, "PBKDF2", false, ["deriveBits", "deriveKey"])

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  )
}

export async function encryptFile(file: File, password: string): Promise<Blob> {
  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))

  // Derive encryption key from password
  const key = await deriveKey(password, salt)

  // Read file as array buffer
  const fileBuffer = await file.arrayBuffer()

  // Encrypt the file data
  const encryptedData = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, fileBuffer)

  // Encrypt the filename
  const filenameBuffer = new TextEncoder().encode(file.name)
  const encryptedFilename = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, filenameBuffer)

  // Combine everything into a single blob
  // Format: [filename_length(4)] [encrypted_filename] [salt(16)] [iv(12)] [encrypted_data]
  const filenameLengthBuffer = new Uint32Array([encryptedFilename.byteLength])
  const combinedBuffer = new Uint8Array(
    4 + encryptedFilename.byteLength + SALT_LENGTH + IV_LENGTH + encryptedData.byteLength,
  )

  let offset = 0
  combinedBuffer.set(new Uint8Array(filenameLengthBuffer.buffer), offset)
  offset += 4
  combinedBuffer.set(new Uint8Array(encryptedFilename), offset)
  offset += encryptedFilename.byteLength
  combinedBuffer.set(salt, offset)
  offset += SALT_LENGTH
  combinedBuffer.set(iv, offset)
  offset += IV_LENGTH
  combinedBuffer.set(new Uint8Array(encryptedData), offset)

  return new Blob([combinedBuffer], { type: "application/octet-stream" })
}

export async function decryptFile(file: File, password: string): Promise<{ blob: Blob; filename: string }> {
  try {
    // Read the encrypted file
    const buffer = await file.arrayBuffer()
    const data = new Uint8Array(buffer)

    // Parse the file structure
    let offset = 0

    // Read filename length
    const filenameLengthBuffer = data.slice(offset, offset + 4)
    const filenameLength = new Uint32Array(filenameLengthBuffer.buffer)[0]
    offset += 4

    // Read encrypted filename
    const encryptedFilename = data.slice(offset, offset + filenameLength)
    offset += filenameLength

    // Read salt
    const salt = data.slice(offset, offset + SALT_LENGTH)
    offset += SALT_LENGTH

    // Read IV
    const iv = data.slice(offset, offset + IV_LENGTH)
    offset += IV_LENGTH

    // Read encrypted data
    const encryptedData = data.slice(offset)

    // Derive decryption key
    const key = await deriveKey(password, salt)

    // Decrypt filename
    let filename: string
    try {
      const decryptedFilenameBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encryptedFilename)
      filename = new TextDecoder().decode(decryptedFilenameBuffer)
    } catch {
      throw new Error("Invalid password or corrupted file")
    }

    // Decrypt file data
    let decryptedData: ArrayBuffer
    try {
      decryptedData = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encryptedData)
    } catch {
      throw new Error("Invalid password or corrupted file")
    }

    const blob = new Blob([decryptedData])
    return { blob, filename }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Decryption failed")
  }
}
