const express = require('express');

const { hash, compare }  = require('bcrypt');

const uploadMulter = require('../utils/uploadMulter');
const removeFile   = require('../utils/removeFile');

const { USER_COLL } = require('../database/user-coll');
const { USER }      = require('../models/user');
const { isValidObjectId } = require('mongoose');

const router = express.Router();

router.route('/')
    .get(async (req, res) => {
        try {
            const { email } = req.session;

            if(!email) res.redirect('/user/login');

            let infoUser = await USER_COLL.findOne({ email })
                .populate('friends guestFriends friendRequests')
                
            if(!infoUser) res.json({ error: true, message: 'CANNOT_FIND_USER' });

            let listUser = await USER_COLL.find({ email: { $ne: email } })
                .populate('friends guestFriends friendRequests')

            if(!listUser) res.json({ error: true, message: 'CANNOT_GET_LIST_USER' });

            res.render('about', {
                infoUser, updateAvtSuccess: undefined, listUser
            });
        } catch (error) {
            return res.json({ error: true, message: error.message });
        }
    })

/**
 * Hai hàm checkAllErrorRegister và checkAllErrorLogin đều trả về String khi xảy ra lỗi
 */
router.route('/register')
    .get((req, res) => {
        res.render('register', { errorRegister: undefined, infoUser: {}, regSuccess: null });
    })
    .post(async (req, res) => {
        try {
            const { email, password, confirmPass, username, phone, birthdayDate, birthdayMonth, birthdayYear, gender } = req.body;

            // tạo một biến thông báo lỗi chung, kiểm tra và thông báo lỗi từ từ thông qua biến này (mỗi thời điểm chỉ thông báo 1 lỗi)
            let errorRegister = null;
            
            errorRegister = await USER.checkAllErrorRegister(email, password, confirmPass, username, phone, birthdayDate, birthdayMonth, birthdayYear);

            let passHash = await hash(password, 8);
            if(!passHash) res.json({ error: true, message: 'CANNOT_HASH_PASH' });
            
            // tạo biến infoUser để rút gọn biến gửi đi để render
            if(errorRegister) return res.render('register', { errorRegister, infoUser: req.body, regSuccess: null });

            // trước khi tạo ra ngày sinh cho user cần định dạng đoạn string khởi tạo ngày đúng chuẩn
            let birthdayOfUser = new Date(USER.validStrBirthday(birthdayDate, birthdayMonth, birthdayYear));
            let newUser = new USER_COLL({ email, password: passHash, username: USER.removeSpace(username), phone, avatar: null, gender: parseInt(gender), birthDay: birthdayOfUser });

            let infoUserSave = await newUser.save(); 
            if(!infoUserSave) {
                res.json({ error: true, message: 'CANNOT_SAVE_USER' });
            } else {
                return res.render('register', { errorRegister: null, infoUser: {}, regSuccess: infoUserSave });
            }
        } catch (error) {
            return res.json({ error: true, message: error.message });
        }
    })

router.route('/login')
    .get(async (req, res) => {
        let listUser = await USER_COLL.find({});
        // sử dụng hàm toLocaleString để ngăn cách các hàng trong con số để dễ đọc
        res.render('login', { errorLogin: undefined, infoUser: { totalUser: listUser.length.toLocaleString() } });
    })
    .post(async (req, res) => {
        try {
            const { email, password } = req.body;
            
            let errorLogin = null;

            errorLogin = await USER.checkAllErrorLogin(email, password);
            if(errorLogin) {
                res.render('login', { errorLogin, infoUser: req.body });
            }

            req.session.email = email;
            
            res.redirect(`/user`);
        } catch (error) {
            return res.json({ error: true, message: error.message });
        }
    })

router.route('/add/:receiverAddFriendID')
    .get(async (req, res) => {
        try {
            const { email } = req.session;
            const { receiverAddFriendID } = req.params;

            if(!email) res.redirect('/user/login');
            if(!isValidObjectId(receiverAddFriendID)) res.json({ error: true, message: 'INVALID_OBJECTID_OF_RECEIVER_ADD_FRIEND' });

            let infoUserSendAddFr = await USER_COLL.findOneAndUpdate({ email }, {
                $addToSet: { guestFriends: receiverAddFriendID }
            }, { new: true });
            if(!infoUserSendAddFr) res.json({ error: true, message: 'CANNOT_UPDATE_INFO_USER_SEND_ADD_FRIEND' });

            let infoUserReceivceAddFr = await USER_COLL.findByIdAndUpdate({ _id: receiverAddFriendID }, {
                $addToSet: { friendRequests: infoUserSendAddFr._id }
            }, { new: true });
            if(!infoUserReceivceAddFr) res.json({ error: true, message: 'CANNOT_UPDATE_INFO_USER_RECEIVCE_ADD_FRIEND' });

            res.redirect('/user');
        } catch (error) {
            return res.json({ error: true, message: error.message });
        }
    })

// hoàn tác lại request kết bạn đã gửi cho user khác
router.route('/cancel-request/:receiverCancelId')
    .get(async (req, res) => {
        try {
            const { email } = req.session;
            const { receiverCancelId } = req.params;
            
            if(!email) res.redirect('/user/login');
            if(!isValidObjectId(receiverCancelId)) res.json({ error: true, message: 'INVALID_OBJECTID_OF_RECEIVER_CANCEL_REQUEST' });

            let infoUserCancelReq = await USER_COLL.findOneAndUpdate({ email }, { 
                $pull: { guestFriends: receiverCancelId }
            }, { new: true });
            if(!infoUserCancelReq) res.json({ error: true, message: 'CANNOT_UPDATE_GUEST_FRIEND_OF_USER_CANCEL_REQUEST' });
            
            let infoReceiverCancelReq = await USER_COLL.findByIdAndUpdate({ _id: receiverCancelId }, {
                $pull: { friendRequests: infoUserCancelReq._id }
            }, { new: true });
            if(!infoReceiverCancelReq) res.json({ error: true, message: 'CANNOT_UPDATE_FRIEND_REQUEST_OF_USER_RECEIVCE_CANCEL_REQUEST' });

            res.redirect('/user');
        } catch (error) {
            return res.json({ error: true, message: error.message });
        }
    })

router.route('/confirm/:receiverConf')
    .get(async (req, res) => {
        try {
            const { email } = req.session;
            const { receiverConf } = req.params;
            
            if(!email) res.redirect('/user/login');
            if(!isValidObjectId(receiverConf)) res.json({ error: true, message: 'INVALID_OBJECTID_OF_RECEIVER_CONFIRM' });

            let infoUserConf = await USER_COLL.findOneAndUpdate({ email }, {
                $pull    : { friendRequests: receiverConf },
                $addToSet: { friends: receiverConf }
            }, { new: true });
            if(!infoUserConf) res.json({ error: true, message: 'CANNOT_UPDATE_INFO_USER_CONFIRM' });

            let infoReceiverConf = await USER_COLL.findByIdAndUpdate({ _id: receiverConf }, {
                $pull    : { guestFriends: infoUserConf._id },
                $addToSet: { friends: infoUserConf._id } 
            }, { new: true });
            if(!infoReceiverConf) res.json({ error: true, message: 'CANNOT_UPDATE_INFO_RECEIVER_CONFIRM' });

            res.redirect('/user');
        } catch (error) {
            return res.json({ error: true, message: error.message });
        }
    })

router.route('/unfriend/:receiverUnfriend')
    .get(async (req, res) => {
        try {
            const { email } = req.session;
            const { receiverUnfriend } = req.params;
            
            if(!email) res.redirect('/user/login');
            if(!isValidObjectId(receiverUnfriend)) res.json({ error: true, message: 'INVALID_OBJECTID_OF_RECEIVER_UNFRIEND' });

            let infoUserUnfriend = await USER_COLL.findOneAndUpdate({ email }, {
                $pull: { friends: receiverUnfriend }
            }, { new: true });
            if(!infoUserUnfriend) return res.json({ error: true, message: 'CANNOT_UPDATE_INFOUSER_UNFRIEND' });

            let infoReceiverUnfriend = await USER_COLL.findByIdAndUpdate({ _id: receiverUnfriend }, {
                $pull: { friends: infoUserUnfriend._id }
            }, { new: true });
            if(!infoReceiverUnfriend) return res.json({ error: true, message: 'CANNOT_UPDATE_INFORECEIVER_UNFRIEND' });

            res.redirect('/user');
        } catch (error) {
            return res.json({ error: true, message: error.message });
        }
    })

// xóa user ra khỏi danh sách gợi ý kết bạn
router.route('/remove-request/:receiverRemoveReqId')
    .get(async (req, res) => {
        try {
            const { email } = req.session;
            const { receiverRemoveReqId } = req.params;
            
            if(!email) res.redirect('/user/login');
            if(!isValidObjectId(receiverRemoveReqId)) res.json({ error: true, message: 'INVALID_OBJECTID_OF_RECEIVER_REMOVE_REQUEST' });

            let infoSenderRemoveReq = await USER_COLL.findOneAndUpdate({ email }, {
                $pull: { friendRequests: receiverRemoveReqId }
            }, { new: true });
            if(!infoSenderRemoveReq) res.json({ error: true, message: 'CANNOT_INFO_USER_SENDER_REMOVE_REQUEST' });

            let infoReceiverRemoveReq = await USER_COLL.findByIdAndUpdate({ _id: receiverRemoveReqId }, {
                $pull: { guestFriends: infoSenderRemoveReq._id }
            }, { new: true });
            if(!infoReceiverRemoveReq) res.json({ error: true, message: 'CANNOT_INFO_USER_RECEIVER_REMOVE_REQUEST' });

            res.redirect('/user');
        } catch (error) {
            res.json({ error: true, message: error.message });
        }
    })


router.route('/profile')
    .post(uploadMulter.single('avatar'), async (req, res) => {
        try {
            const { email } = req.session; 
            const { filename } = req.file;

            if(!email) res.redirect('/user/login');

            let infoUser = await USER_COLL.findOne({ email });
            if(!infoUser) res.json({ error: true, message: 'USER_NOT_FOUND' });

            // remove đi file ảnh cũ đảm bảo mỗi user chỉ có 1 avatar trong chỗ lưu avatar
            if(infoUser.avatar) await removeFile(infoUser.avatar);

            let infoUserUpdate = await USER_COLL.findOneAndUpdate({ email }, { avatar: filename }, { new: true });
            if(!infoUserUpdate) res.json({ error: true, message: 'CANNOT_UPDATE_AVATAR' });

            let listUser = await USER_COLL.find({ email: { $ne: email } });
            if(!listUser) res.json({ error: true, message: 'CANNOT_GET_LIST_USER' });

            res.render('about', { infoUser: infoUserUpdate, updateAvtSuccess: true, listUser });
        } catch (error) {
            res.json({ error: true, message: error.message });
        }
    })

exports.USER_ROUTE = router;