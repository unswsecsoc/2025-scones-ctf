# Writeup for `example challenge`

|      author     | category | value |
|-----------------|----------|-------|
|    krishtilani  |    pwn   |  400  |

sample description

## Solution

<details>
<summary>Click here to reveal the solution!</summary>

### The Big Idea

Calling flag stores the flag on the heap, even if not printed.
UAF and get a leak by adding SCONES somewhere in the "blinds" array.
Overwrite one of the blinds entries to point to the flag, and read flag.

### Walkthrough

1. send '%6$p %7$p %8$p %9$p' as those are the parts of the flag.
2. decode.

### Flag(s)

- SCONES{h3y_th0z3_w3r3_my_5c0n3z}

</details>
