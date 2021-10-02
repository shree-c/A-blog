const Follow = require('../model/Follow')
exports.addFollow = function (req, res) {
    console.log(req.params.username)
    let follow = new Follow(req.params.username, req.visitorId);
    follow.create().then(()=>{
        req.flash('success', `successfully followed ${req.params.username}`)
        req.session.save(()=>{
            res.redirect(`/profile/${req.params.username}`)
        })
    }).catch((err)=>{
        err.forEach((err)=>{
            req.flash('errors', err);
        })
        req.session.save(()=>{
            res.redirect(`/`)
        });
    });
}