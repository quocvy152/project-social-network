const mongoose = require('mongoose');

const { Schema }   = mongoose;

const userSchema = new Schema({
    email   : { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    username: { type: String, required: true, trim: true },
    phone   : { type: String, required: true },
    /**
     * Danh sách bạn của User
     */
    friends : [
        { 
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    /**
     * Danh sách những người dùng User đã gửi kết bạn cho họ
     */
    guestFriends: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    /**
     * Danh sách những người gửi kết bạn với User
     */
    friendRequests: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    avatar   : String,
    // trường giới tính qui định 1 là Male, 0 là Female, 2 là AnotherSex (giới tính Khác)
    gender   : Number,
    birthDay : { type: Date, required: true },
    createAt : { type: Date, default: Date.now }
});

const User = mongoose.model('user', userSchema);

exports.USER_COLL = User;
