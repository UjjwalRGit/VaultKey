// Encryption and decryption utilities using Web Crypto API

// Constants
const PBKDF2_ITERATIONS = 250000 // Updated from 100k to 250k as per spec
const SALT_LENGTH = 16
const IV_LENGTH = 12
const MAGIC_BYTES = new Uint8Array([0x56, 0x4b]) // "VK" in hex
const VERSION = 0x01
const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB limit

// Custom error types for better error handling
export class PasswordError extends Error {
  constructor(message: string = "Incorrect password") {
    super(message)
    this.name = "PasswordError"
  }
}

export class CorruptedFileError extends Error {
  constructor(message: string = "File is corrupted or modified") {
    super(message)
    this.name = "CorruptedFileError"
  }
}

export class UnsupportedVersionError extends Error {
  constructor(message: string = "Unsupported file version") {
    super(message)
    this.name = "UnsupportedVersionError"
  }
}

export class FileSizeError extends Error {
  constructor(message: string = "File exceeds maximum size of 500MB") {
    super(message)
    this.name = "FileSizeError"
  }
}

interface EncryptedData {
  filename: string
  salt: Uint8Array
  iv: Uint8Array
  data: Uint8Array
}

/**
 * Derive a cryptographic key from a password using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(password)

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  )

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  )
}

/**
 * Encrypt a file with AES-256-GCM
 * File format: [Magic(2)] [Version(1)] [Salt(16)] [IV(12)] [FilenameLength(4)] [EncryptedFilename] [EncryptedData]
 */
export async function encryptFile(file: File, password: string): Promise<Blob> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new FileSizeError(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum of 500MB`)
  }

  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))

  // Derive encryption key from password
  const key = await deriveKey(password, salt)

  // Read file as array buffer
  const fileBuffer = await file.arrayBuffer()

  // Encrypt the file data
  const encryptedData = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, fileBuffer)

  // Encrypt the filename
  const filenameBuffer = new TextEncoder().encode(file.name)
  const encryptedFilename = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, filenameBuffer)

  // Construct the file with proper header format
  // Format: [Magic(2)] [Version(1)] [Salt(16)] [IV(12)] [FilenameLength(4)] [EncryptedFilename] [EncryptedData]
  const filenameLengthBuffer = new Uint32Array([encryptedFilename.byteLength])
  const totalSize =
    MAGIC_BYTES.length + // 2 bytes
    1 + // version: 1 byte
    SALT_LENGTH + // 16 bytes
    IV_LENGTH + // 12 bytes
    4 + // filename length: 4 bytes
    encryptedFilename.byteLength + // variable
    encryptedData.byteLength // variable

  const combinedBuffer = new Uint8Array(totalSize)

  let offset = 0

  // Write magic bytes
  combinedBuffer.set(MAGIC_BYTES, offset)
  offset += MAGIC_BYTES.length

  // Write version
  combinedBuffer[offset] = VERSION
  offset += 1

  // Write salt
  combinedBuffer.set(salt, offset)
  offset += SALT_LENGTH

  // Write IV
  combinedBuffer.set(iv, offset)
  offset += IV_LENGTH

  // Write filename length
  combinedBuffer.set(new Uint8Array(filenameLengthBuffer.buffer), offset)
  offset += 4

  // Write encrypted filename
  combinedBuffer.set(new Uint8Array(encryptedFilename), offset)
  offset += encryptedFilename.byteLength

  // Write encrypted data
  combinedBuffer.set(new Uint8Array(encryptedData), offset)

  return new Blob([combinedBuffer], { type: "application/octet-stream" })
}

/**
 * Decrypt a VaultKey encrypted file
 * Throws specific error types for better error handling
 */
export async function decryptFile(file: File, password: string): Promise<{ blob: Blob; filename: string }> {
  try {
    // Read the encrypted file
    const buffer = await file.arrayBuffer()
    const data = new Uint8Array(buffer)

    // Minimum file size check (magic + version + salt + iv + filename_length)
    const minSize = 2 + 1 + SALT_LENGTH + IV_LENGTH + 4
    if (data.length < minSize) {
      throw new CorruptedFileError("File is too small to be a valid VaultKey file")
    }

    let offset = 0

    // Read and validate magic bytes
    const magic = data.slice(offset, offset + 2)
    offset += 2
    if (magic[0] !== MAGIC_BYTES[0] || magic[1] !== MAGIC_BYTES[1]) {
      throw new CorruptedFileError("Invalid file format: not a VaultKey encrypted file")
    }

    // Read and validate version
    const version = data[offset]
    offset += 1
    if (version !== VERSION) {
      throw new UnsupportedVersionError(`Unsupported file version: ${version}. Expected version ${VERSION}`)
    }

    // Read salt
    const salt = data.slice(offset, offset + SALT_LENGTH)
    offset += SALT_LENGTH

    // Read IV
    const iv = data.slice(offset, offset + IV_LENGTH)
    offset += IV_LENGTH

    // Read filename length
    const filenameLengthBuffer = data.slice(offset, offset + 4)
    const filenameLength = new Uint32Array(filenameLengthBuffer.buffer)[0]
    offset += 4

    // Validate filename length
    if (filenameLength > 1024 || filenameLength === 0) {
      throw new CorruptedFileError("Invalid filename length in encrypted file")
    }

    // Check if we have enough data
    if (data.length < offset + filenameLength) {
      throw new CorruptedFileError("File is truncated or corrupted")
    }

    // Read encrypted filename
    const encryptedFilename = data.slice(offset, offset + filenameLength)
    offset += filenameLength

    // Read encrypted data
    const encryptedData = data.slice(offset)

    // Derive decryption key
    const key = await deriveKey(password, salt)

    // Decrypt filename
    let filename: string
    try {
      const decryptedFilenameBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, encryptedFilename)
      filename = new TextDecoder().decode(decryptedFilenameBuffer)
    } catch (error) {
      // GCM authentication failure = wrong password or tampered data
      throw new PasswordError("Incorrect password")
    }

    // Decrypt file data
    let decryptedData: ArrayBuffer
    try {
      decryptedData = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, encryptedData)
    } catch (error) {
      // GCM authentication failure = wrong password or tampered data
      throw new PasswordError("Incorrect password")
    }

    const blob = new Blob([decryptedData])
    return { blob, filename }
  } catch (error) {
    // Re-throw our custom errors
    if (
      error instanceof PasswordError ||
      error instanceof CorruptedFileError ||
      error instanceof UnsupportedVersionError
    ) {
      throw error
    }
    // Wrap any other errors
    throw new CorruptedFileError("Failed to decrypt file: " + (error instanceof Error ? error.message : "Unknown error"))
  }
}

/**
 * Validate file size before encryption
 */
export function validateFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}