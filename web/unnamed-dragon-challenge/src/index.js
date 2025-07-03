// Modified from CTF-XSS-BOT
const express = require("express")
const app = express();
const path = require("path")
const route = express.Router()
const bot = require("./bot")
const rateLimit = require("express-rate-limit")

app.use(express.urlencoded({ extended: false }))
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const limit = rateLimit({
    ...bot,
    handler: ((req, res, _next) => {
        const timeRemaining = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
        res.status(429).json({
            error: `Too many requests, please try again later after ${timeRemaining} seconds.`,
        });
    })
})


route.post("/submit", limit, async (req, res) => {
    const { save } = req.body;
    if (!save) {
        return res.status(400).send({ error: "Save is missing." });
    }
    // if (!RegExp(bot.urlRegex).test(url)) {
    // return res.status(422).send({ error: "URL din't match this regex format " + bot.urlRegex })
    // }
    if (await bot.bot(save)) {
        return res.send({ success: "Admin successfully imported the save file." });
    } else {
        return res.status(500).send({ error: "Admin failed to import the save file." });
    }
});

route.get("/submit", (_, res) => {
    const { name } = bot
    res.render("index", { name });
});

app.use("/", route)

app.listen(9999, () => {
    console.log("Server running at http://localhost:9999");
});
