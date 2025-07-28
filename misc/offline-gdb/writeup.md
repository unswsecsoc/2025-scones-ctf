# Writeup for `offline gdb`

|      author     | category | value |
|-----------------|----------|-------|
| yellowsubmarine |   misc   |  300  |

With the rapid advancement of AI technology, we decided to make GDB offline.

## Solution

<details>
<summary>Click here to reveal the solution!</summary>

### The Big Idea

We're given a site with two endpoints: a C++ compiler and a JavaScript interpreter. Our C++ files are compiled and the *source code* (not executable!) is stored under `uploads/cpp/<random number>.cpp`, but only if the source code doesn't produce any errors or warnings when trying to compile. The JS interpreter shows a bunch of predefined scripts that can be run, for instance:
```js
function fizzbuzz() {
    let finalString = "";
    for (let i = 1; i <= 100; i++) {
        if (i % 15 == 0) {
            finalString += "FizzBuzz\n";
        } else if (i % 3 == 0) {
            finalString += "Fizz\n";
        } else if (i % 5 == 0) {
            finalString += "Buzz\n";
        } else {
            finalString += i.toString() + "\n";
        }
    }

    return finalString;
}

module.exports =  { output : fizzbuzz() };
```

Note that the "output" of the program is stored as a module export under the "export" variable - this is later retrieved by the JS runner and outputted. Interestingly, it seems like we can reference our C++ files from this JS runner as well, by specifying the path to run as `cpp/<random number>.cpp` instead of `js/<predefined script>.js`. So, it seems like we have to get remote code execution by uploading a C++ compilable script that can also run in JavaScript (and trigger our payload) - this is called a polyglot. (note: you can actually get file reads from C compilation output using [preprocessor tricks](github.com/welchbj/ctf/blob/master/docs/miscellaneous.md), but the flag file is an unconvential name).

It turns out JS and C++ have very similar constructs - braces for code blocks, semicolons, the same syntax for comments (this is highly important, as it makes a polyglot harder to construct), however not enough to avoid getting warnings/errors e.g. if we don't specify a main function or its data type properly, we get an error or a warning, respectively, but javascript doesn't understand the data type before the function name. So, we have to look for crucial parser differentials.

One such is the backslash `\`, which allows you to continue a line in C/C++, but *not* in JS - this includes comments! Thus, the following is compilable in even C, and runnable in JS:
```c
// and so begins our polyglot \
module.exports = { output: require('child_process').execSync('whoami').toString() } /*
int main(void) { }
// */
```

So, problem solved, right? Except... the compiler disallows backslashes. Dang...

It turns out, there's another sneaky parser differential, which inspired by the idea of playing around with C/C++ directives: the `#` character. To figure out how to use it, we should actually think about it from a javascript perspective!

After some research, it seems it's used to define a private variable in a class: https://stackoverflow.com/questions/5234660/what-is-the-hash-character-used-for-in-javascript . While C has no notion of classes, C++ conveniently does :P.

A `#` in C++ denoes a directive. So, we need something of the format `#<identifier>` (which would just be a variable declaration - probably useless because we can't do anything else with it) OR `#identifier = <value>`, give or take some spaces. Unfortunately, a lot of C++ directives are very particular about the second and so on arguments to a directive (e.g. `#define` expects the second argument to be an identifier, so it can't start with "=")... except `#pragma`! We can write `#pragma = blah blah` and it will interpreted as C-compilable no matter how many spaces there are and what characters there are...

...except comments, which are still treated normally when placed at the end of a directive, which means we cannot "escape" from the C++ world to the Javascript world so easily (e.g. with just multiline comments). This brings us to our final parser differential: the backtick! In a `#pragma` directive, this would just appear as a regular character, but in Javascript, this denotes a multiline string! This means we can set the "pragma" variable as a multiline string that contains our C++ main function, and escape back out into Javascript later to make everything syntactically correct! Thus, our final polyglot (you can add code into the main function if you want :P):

```js
class a {
  #pragma =`
};
int main(void){}
//`}; console.log('hi');
```
```c++
class a {
  #pragma =`
};
int main(void){}
//`}; console.log('hi');
```

(it's very cool to see how the syntax highlighting differs for the exact same piece of code haha)

So now we have RCE. Using this we can run `ls` to get the flag file's name, and then print it out to yield the flag.

### Flag(s)

- `SCONES{iS_1t_c++_0R_J4vaScript?!?!!!}`

</details>
