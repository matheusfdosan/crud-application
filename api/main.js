// Imports
require("dotenv").config()
const express = require("express")
const mongosse = require("mongoose")
const session = require("express-session")

const app = express()
const PORT = process.env.PORT || 4000

// Database connection
mongosse.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const db = mongosse.connection

db.on("error", (error) => {
  console.log(error)
})
db.once("open", () => {
  console.log("Connected to mongo database")
})

// Middlewares
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(
  session({
    secret: "my secret key",
    saveUninitialized: true,
    resave: false,
  })
)

app.use((req, res, next) => {
  res.locals.message = req.session.message
  delete req.session.message
  next()
})

// Usar a foto salva no ./uploads
app.use(express.static("uploads"))

// Template Engine EJS
app.set("view engine", "ejs")

// Route prefix
app.use("", require("../routes/routes"))

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`)
})
