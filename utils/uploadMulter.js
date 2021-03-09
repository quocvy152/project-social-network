const multer = require('multer');
const changePathImage = require('./changePathImage');

const pathToSaveAvatar = 'C:\\Users\\ASUS\\project-social-network\\public\\images\\avatar';

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `${pathToSaveAvatar}`);
    },
    filename: function (req, file, cb) {
        cb(null, changePathImage(file.originalname, Date.now()));
    }
})

var upload = multer({ storage });

module.exports = upload;