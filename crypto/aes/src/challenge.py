from Crypto.Cipher import AES
from hashlib import md5
from random import randint, randbytes
from secrets import FLAG


# create ASCII printable key to share with my friends
KEY1 = "".join(chr(randint(32, 126)) for _ in range(32))
KEY2 = "".join(chr(randint(32, 126)) for _ in range(32))

def encrypt(key, plaintext):
    iv = randbytes(16)
    cipher = AES.new(md5(key.encode()).digest(), AES.MODE_CBC, iv=iv)
    return iv + cipher.encrypt(plaintext.encode())

def decrypt(key, ciphertext):
    iv, ciphertext = ciphertext[:16], ciphertext[16:]
    cipher = AES.new(md5(key.encode()).digest(), AES.MODE_CBC, iv=iv)

    return cipher.decrypt(ciphertext).decode()

print(f"Here is your encrypted flag: {encrypt(KEY1, FLAG).hex()}")
print(f"Here is its encrypted key:   {encrypt(KEY2, KEY1).hex()}")
print(f"To make sure you have the right key, here is its last byte: {KEY1[-1]}")

for _ in range(700):
    try:
        key = bytes.fromhex(input("Enter the encrypted key: "))
        if decrypt(KEY2, key) == KEY1:
            print("Yep, that's correct! Good thing only my friends know the decrypted version...")
        else:
            print("Incorrect key")
    except Exception:
        print("Please provide a valid key")

print("Alright that's enough from you...") 