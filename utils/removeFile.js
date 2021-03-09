const fs = require('fs');

// dẫn vào thư mục cần xóa file
let prefixPathDel = "C:\\Users\\ASUS\\project-social-network\\public\\images\\avatar";

function removeFile(path) {
    // pathDel để cộng phần prefix của path với tên file cần xóa
    let pathDel = prefixPathDel + "\\" + path;
    fs.unlink(pathDel, err => {
        if(err) {
            console.log({ err });
        } else {
            console.log("Deleted file: " + pathDel);
        }
    });
}

module.exports = removeFile;