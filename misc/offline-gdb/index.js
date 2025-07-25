const express = require('express')
const fs = require('fs')
const app = express()
const path = require("path");
const spawnSync = require("child_process").spawnSync;
const randomBytes = require("crypto").randomBytes;
const port = 3000

app.use(express.urlencoded({extended: false}))
app.use("/uploads", express.static("./uploads"));
app.set('view engine', 'ejs')

function getFiles(ext) {
  let arr = []
  for (filename of fs.readdirSync("uploads/js")) {
    if (filename.endsWith(ext)) {
      arr.push(filename)
    }
  }

  return arr
}


app.get('/', (_, res) => {
  res.redirect('/compiler')
})

app.get('/interpreter', (req, res) => {
  let path = req.query.path
  if (path !== undefined && !path.includes("..")) {
    let result;
    try {
      result = require(`./uploads/${path}`).output
      if (result === undefined) {
        result = "`output` variable was not defined!";
      }
    } catch {
      result = "--- error occurred while running ---";
    }
    res.render('interpreter', {files: getFiles('.js'), result});
  } else {
    res.render('interpreter', {files: getFiles('.js')});
  }
})

app.get('/compiler', (req, res) => {
  res.render('compiler')
})

app.post('/compiler', (req, res) => {
  let code = req.body.code;
  let randomString = randomBytes(8).toString("hex");
  let success = false;
  let result

  if (code.includes("\\")) {
    result = { stdout: "", stderr: "No backslashes please!" }
  } else {
      fs.writeFileSync(`/tmp/${randomString}.cpp`, code)
  try {
    result = spawnSync('g++', [`/tmp/${randomString}.cpp`, "-o", `/tmp/${randomString}.out`], { encoding: 'utf-8', timeout: 2000 })
  }
  catch {
    result = { stdout: "", stderr: "An error occurred during compilation - this is likely a problem to do with the CTF infrastructure"}
  }

  if (result.error) {
    result = { stdout: "", stderr: "An error occurred during compilation - this is likely a problem to do with the CTF infrastructure"}
  }

  fs.rmSync(`/tmp/${randomString}.cpp`)
  try {
    fs.rmSync(`/tmp/${randomString}.out`)

  } catch(err) {

  }

  if (result.stdout.length === 0 && result.stderr.length === 0) {
    success = true;
    fs.writeFileSync(`uploads/cpp/${randomString}.cpp`, code)
  }
  }
  
  res.render('compiler', {
    filename: `cpp/${randomString}.cpp`,
    success,
    result
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
