const express = require('express');
const router = express.Router();

router.route('/clear-session')
    .get(async (req, res) => {
        try {
            let { email } = req.session;

            if(!email) res.redirect('/user/login');

            req.session.destroy((err) => {
                if(err){
                console.log(err);
                }else{
                    res.redirect('/user/login');
                }
            });
        } catch (error) {
            return res.json({ error: true, message: error.message });
        }
    });

exports.LOGOUT_ROUTE = router;