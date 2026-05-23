from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
import base64
import os

# In production, use environment variables for these
ENCRYPTION_KEY = get_random_bytes(32)  # AES-256 key
NONCE_SIZE = 12

def encrypt_data(data: str) -> str:
    cipher = AES.new(ENCRYPTION_KEY, AES.MODE_GCM, nonce=get_random_bytes(NONCE_SIZE))
    ciphertext, tag = cipher.encrypt_and_digest(data.encode())
    
    encrypted_data = cipher.nonce + tag + ciphertext
    return base64.b64encode(encrypted_data).decode()

def decrypt_data(encrypted_data: str) -> str:
    encrypted_bytes = base64.b64decode(encrypted_data)
    nonce = encrypted_bytes[:NONCE_SIZE]
    tag = encrypted_bytes[NONCE_SIZE:NONCE_SIZE+16]
    ciphertext = encrypted_bytes[NONCE_SIZE+16:]
    
    cipher = AES.new(ENCRYPTION_KEY, AES.MODE_GCM, nonce=nonce)
    decrypted_data = cipher.decrypt_and_verify(ciphertext, tag)
    return decrypted_data.decode() 