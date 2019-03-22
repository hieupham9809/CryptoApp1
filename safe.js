const fs = require("fs");
const Crypto = require("crypto");
const path = require("path");
const ext = ".crypted";
class Safe {

    // constructor(filePath, password, encName = false) {
    //     this.filePath = filePath;
    //     this.password = password;
    //     this.encName = encName;
    //   }
    static encrypt_aes256cbc(filePath,password) {
        try {
            var data = fs.readFileSync(filePath);
            var loc = path.dirname(filePath);
            var fileName = path.basename(filePath);
            var newFolder = path.basename(filePath,path.extname(filePath));
            var cipher = Crypto.createCipher("aes-256-cbc", password);
            var encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
            var hash = Crypto.createHash('sha256');
            hash.update(data);
            var hashedValue = hash.digest('hex');

            fs.unlinkSync(filePath);
            if (!fs.existsSync(path.join(loc,newFolder))){
                fs.mkdirSync(path.join(loc,newFolder));
            }
            fs.writeFileSync(path.join(loc, newFolder, fileName + ext), encrypted);
            fs.writeFileSync(path.join(loc, newFolder, 'hash_code.txt'), hashedValue);

            return true;
            } catch (exception) {
            throw new Error(exception.message);
            }
      }
    
    static decrypt_aes256cbc(filePath,password,hashPath) {
        try {
            var data = fs.readFileSync(filePath);
            var checkHashValue = fs.readFileSync(hashPath);
            let loc = path.dirname(filePath);
            var fileName = path.basename(filePath).split(".");

            fileName.splice(-1, 1);
            fileName = fileName.join(".");
            var decipher = Crypto.createDecipher("aes-256-cbc", password);

            var decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
            var hash = Crypto.createHash('sha256');
            hash.update(decrypted);
            
            if (checkHashValue.toString() !== hash.digest('hex').toString()){
                throw new Error("Wrong hash value, please check again!");
            }
            fs.unlinkSync(filePath);
            fs.unlinkSync(hashPath);
            if (fileName.split(".").slice(-1)[0] == "enc") {
                fileName.split(".").splice(-1, 1);
                fileName = new Buffer(fileName, "hex").toString();
                console.log(fileName);
            }

            fs.writeFileSync(path.join(loc, fileName), decrypted);

            } catch (exception) {
            throw new Error(exception.message);
            }
        }

}

module.exports = Safe;