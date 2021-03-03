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
     * Danh sách những người dùng gửi kết bạn với User
     */
    guestFriends: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    /**
     * Danh sách người dùng User gửi kết bạn
     */
    friendsRequest: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    avatar   : String,
    birthDay : { type: Date, required: true },
    createAt : { type: Date, default: Date.now }
});

const User = mongoose.model('user', userSchema);

exports.USER_COLL = User;
