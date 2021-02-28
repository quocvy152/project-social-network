function checkSession(req, res, next) {
    if(!req.session.email && !(req.path == '/user/login') && !(req.path.toString() == '/user/register')) {
        res.redirect('/user/login');
    } else if(req.session.email && ((req.path == '/user/login') || (req.path.toString() == '/user/register'))){
        res.redirect(`/home/${req.session.email}`);
    } else {
        next();
    }
}

module.exports = checkSession;