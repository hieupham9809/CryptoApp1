const fs = require("fs-extra");
class Directory{
    static move(oldPath, newPath){
        fs.move(oldPath, newPath, function (err) {
            if (err) {
                console.error(err)
                return
            } else {
                console.log("success move folder!")
                return true;
            }
        });
    
        // function copy() {
        //     var readStream = fs.createReadStream(oldPath);
        //     var writeStream = fs.createWriteStream(newPath);
    
        //     readStream.on('error', callback);
        //     writeStream.on('error', callback);
    
        //     readStream.on('close', function () {
        //         fs.unlink(oldPath, callback);
        //     });
    
        //     readStream.pipe(writeStream);
        // }
    
    }
}
module.exports = Directory;
