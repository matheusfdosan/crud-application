const express = require("express")
const router = express.Router()
const User = require("../models/users")
const multer = require("multer")
const fs = require("fs")
// Upload de Imagem

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads")
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname)
  },
})

let upload = multer({
  storage: storage,
}).single("image")

// Inserir usuário dentro do banco de dados
router.post("/add", upload, (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    image: req.file.filename,
  })
  user
    .save()
    .then((user) => {
      req.session.message = {
        type: "SUCESS",
        message: "Usuário Adicionado com Sucesso!",
      }
      console.log("Usuário Salvo: " + user)
      res.redirect("/")
    })
    .catch((err) => {
      res.json({ message: err.message, type: "DANGER" })
    })
})

router.get("/", (req, res) => {
  User.find()
    .exec()
    .then((users) => {
      console.log(users)
      res.render("index", { title: "HomePage", users: users })
    })
    .catch((err) => {
      res.json({ message: err })
    })
})

router.get("/add", (req, res) => {
  res.render("add_user", { title: "Add Users" })
})

// Editar um usuário

router.get("/edit/:id", (req, res) => {
  let id = req.params.id
  User.findById(id)
    .then((user) => {
      if (user == null) {
        res.redirect("/")
      } else {
        res.render("edit_user", { title: "Edit User", user: user })
      }
    })
    .catch((err) => {
      console.log(err)
    })
})

// Atualizando dados do usuário
router.post("/update/:id", upload, (req, res) => {
  let id = req.params.id
  let name = req.body.name
  let email = req.body.email
  let phone = req.body.phone
  let new_image = ""

  if (req.file) {
    new_image = req.file.filename
    try {
      fs.unlinkSync("./uploads" + req.body.old_image)
    } catch (err) {
      console.log(err)
    }
  } else {
    new_image = req.body.old_image
  }

  User.findByIdAndUpdate(id, {
    name: name,
    email: email,
    phone: phone,
    image: new_image,
  })
    .then(() => {
      req.session.message = {
        type: "SUCESSO",
        message: "Usuário atualizado com sucesso!",
      }
      res.redirect("/")
    })
    .catch((err) => {
      res.json({ message: err.message, type: "DANGER" })
    })
})

// Deletar usuários
router.get("/delete/:id", (req, res) => {
  let id = req.params.id
  User.findByIdAndDelete(id)
    .then((user) => {
      if (user.image != "") {
        try {
          fs.unlinkSync("./uploads/" + user.image)
        } catch (err) {
          console.log(err)
        }
      }

      req.session.message = {
        type: "info",
        message: "Usuário deletado com sucesso!",
      }
      res.redirect("/")
    })
    .catch((err) => {
      res.json({ message: err.message })
    })
})

router.get("/about", (req, res) => {
  res.render("about")
})

router.get("/contact", (req, res) => {
  res.render("contact")
})

module.exports = router
