const express = require('express')
const router = require('./router')
const app = express()
// for files accessible via their filenames to anybody
app.use(express.static('public'))
// setting up template engine
app.set('views', 'views')
app.set('view engine', 'ejs')
// setting up for parsing posted data
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(router)
app.listen(5000, () => {
  console.log('listening at port: 5000')
})
