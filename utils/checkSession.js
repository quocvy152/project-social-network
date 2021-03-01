function checkSession(req, res, next) {
    // nếu chưa đăng nhập và route truy cập vào không phải login và register thì redirect về login
    if(!req.session.email && !(req.path == '/user/login') && !(req.path.toString() == '/user/register') && !(req.path == '/logout')) {
        res.redirect('/user/login');
    } else if(req.session.email && ((req.path == '/user/login') || (req.path.toString() == '/user/register'))){
        res.redirect(`/home/${req.session.email}`);
    } else {
        next();
    }
}

module.exports = checkSession;