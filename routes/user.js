const express = require('express');
const { hash, compare }  = require('bcrypt');

const { USER_COLL } = require('../models/user-coll');
const { USER }      = require('../models/user');

const router = express.Router();

/**
 * Hai hàm checkAllErrorRegister và checkAllErrorLogin đều trả về String khi xảy ra lỗi
 */
router.route('/register')
    .get((req, res) => {
        res.render('register', { errorRegister: undefined, email: undefined, password: undefined, phone: undefined });
    })
    .post(async (req, res) => {
        try {
            const { email, password, phone, birthdayDate, birthdayMonth, birthdayYear } = req.body;

            // tạo một biến thông báo lỗi chung, kiểm tra và thông báo lỗi từ từ thông qua biến này (mỗi thời điểm chỉ thông báo 1 lỗi)
            let errorRegister = null;
            let errorAll = null;
            
            let passHash = await hash(password, 8);
            if(!passHash) res.json({ error: true, message: 'CANNOT_HASH_PASH' });

            errorRegister = await USER.checkAllErrorRegister(email, password, phone, birthdayDate, birthdayMonth, birthdayYear);
                
            if(errorRegister) return res.render('register', { errorRegister, email, password, phone });

            let birthdayOfUser = new Date(USER.validStrBirthday(birthdayDate, birthdayMonth, birthdayYear));
            let newUser = new USER_COLL({ email, password: passHash, phone, birthDay: birthdayOfUser });

            let infoUserSave = await newUser.save(); 
            if(!infoUserSave) res.json({ error: true, message: 'CANNOT_SAVE_USER' });

            res.redirect('/user/login');
        } catch (error) {
            return res.json({ error: true, message: error.message });
        }
    })

router.route('/login')
    .get((req, res) => {
        res.render('login', { errorLogin: undefined, email: undefined, password: undefined });
    })
    .post(async (req, res) => {
        try {
            const { email, password } = req.body;
            
            let errorLogin = null;

            errorLogin = await USER.checkAllErrorLogin(email, password);
            if(errorLogin) {
                res.render('login', { errorLogin, email, password });
            }

            res.redirect(`/user/${email}`);
        } catch (error) {
            return res.json({ error: true, message: error.message });
        }
    })

router.route('/:email')
    .get(async (req, res) => {
        try {
            const { email } = req.params;

            let infoUser = await USER_COLL.findOne({ email });
            if(!infoUser) res.json({ error: true, message: 'CANNOT_FIND_USER' });

            res.render('about', {
                infoUser
            });
        } catch (error) {
            return res.json({ error: true, message: error.message });
        }
    })

exports.USER_ROUTE = router;