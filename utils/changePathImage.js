function changePathImage(pathImg, dateSaveImg) {
    let typeOfImg = pathImg.substr(pathImg.indexOf('.'), pathImg.length - pathImg.indexOf('.'));
    pathImg = pathImg.substr(0, pathImg.indexOf('.'));
    return pathImg + '-' + dateSaveImg + typeOfImg;
}

module.exports = changePathImage;