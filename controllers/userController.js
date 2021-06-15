const User = require('../model/User')
exports.home = function (req, res) {
  const user = new User()
  console.log(user)
  res.render('home-guest')
}
exports.register = function (req, res) {
  console.log(req.body)
  res.send('thanks for registering')
}
