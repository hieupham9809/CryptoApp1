const fs = require("fs");
const Crypto = require("crypto");
const path = require("path");
const ext = ".crypted";
const chilkat = require('@chilkat/ck-electron4-linux64');
var rsa = new chilkat.Rsa();
var success = rsa.UnlockComponent("Anything for 30-day trial");
if (success !== true) {
    console.log("RSA component unlock failed");
    return;
}
class Safe {

    // constructor(filePath, password, encName = false) {
    //     this.filePath = filePath;
    //     this.password = password;
    //     this.encName = encName;
    //   }
    static encrypt_blowfish(filePath, passwordFile, outputPath=path.dirname(filePath)){
        try {
                var crypt = new chilkat.Crypt2();
                var success = crypt.UnlockComponent("Anything for 30-day trial");
                if (success !== true) {
                    console.log(crypt.LastErrorText);
                    return;
                }
                const absolutePathKey = path.resolve(passwordFile);
                const absolutePathFile = path.resolve(filePath);
                const absoluteParentOutputPath = path.resolve(outputPath);
                var fileName = path.basename(filePath);
                var newFolder = path.basename(filePath,path.extname(filePath));
                const absoluteOutputPath = path.join(absoluteParentOutputPath,newFolder);
                var data = fs.readFileSync(absolutePathFile)
                crypt.CryptAlgorithm = "blowfish2";
                crypt.CipherMode = "cfb";
                crypt.KeyLength = 256;
                crypt.EncodingMode = "hex";

                // The block size of the blowfish algoirthm is 8 bytes, therefore the IV is 8 bytes.
                var ivHex = "0001020304050607";
                crypt.SetEncodedIV(ivHex,"hex");
        
                // The secret key must equal the size of the key.  For
                // 256-bit encryption, the binary secret key is 32 bytes.
                //var keyHex = "603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4";
                var keyHex = fs.readFileSync(absolutePathKey);
                crypt.SetEncodedKey(keyHex,"hex");

                // Hash file
                var hash = Crypto.createHash('sha256');
                hash.update(data);
                var hashedValue = hash.digest('hex');

                
                if (!fs.existsSync(absoluteOutputPath)){
                    fs.mkdirSync(absoluteOutputPath);
                }
                success = crypt.CkEncryptFile(absolutePathFile,path.join(absoluteOutputPath,fileName + ext));
                fs.writeFileSync(path.join(absoluteOutputPath, 'hash_code.txt'), hashedValue);

                if (crypt.LastMethodSuccess !== true) {
                    console.log(crypt.LastErrorText);
                    return;
                }
                

                fs.unlinkSync(absolutePathFile);
                

                return true;
            } catch (exception) {
            throw new Error(exception.message);
            }

           
    }
    static decrypt_blowfish(filePath,passwordFile,hashPath){
        
    }
    static generateKeys(outputPath) {
       
        success = rsa.GenerateKey(1024);
        if (success !== true) {
            console.log(rsa.LastErrorText);
            return;
        }
        var publicKey = rsa.ExportPublicKey();
        
        var privateKey = rsa.ExportPrivateKey();

        fs.writeFileSync(path.join(outputPath,'private.xml'), privateKey)
        fs.writeFileSync(path.join(outputPath,'public.xml'), publicKey)
        console.log("Generates keys completed")
    }
    static encrypt_rsa(filePath, relativeOrAbsolutePathToPublicKey,outputPath=path.dirname(filePath)) {
        const absolutePathKey = path.resolve(relativeOrAbsolutePathToPublicKey)
        const absolutePathFile = path.resolve(filePath)
        const publicKey = fs.readFileSync(absolutePathKey, 'utf8')
        var fileName = path.basename(filePath);
        var newFolder = path.basename(filePath,path.extname(filePath));
        const data = fs.readFileSync(absolutePathFile,'utf8');
        var hash = Crypto.createHash('sha256');
        hash.update(data);
        var hashedValue = hash.digest('hex');
        
        var rsaEncryptor = new chilkat.Rsa();
        
        // Encrypted output is always binary.  In this case, we want
        // to encode the encrypted bytes in a printable string.
        // Our choices are "hex", "base64", "url", "quoted-printable".
        rsaEncryptor.EncodingMode = "base64";
        success = rsaEncryptor.ImportPublicKey(publicKey);
        var usePrivateKey = false;
        var encrypted = rsaEncryptor.EncryptStringENC(data,usePrivateKey);
        if (rsaEncryptor.LastMethodSuccess !== true) {
            console.log(rsaEncryptor.LastErrorText);
            return;
        }
        if (!fs.existsSync(path.join(outputPath,newFolder))){
            fs.mkdirSync(path.join(outputPath,newFolder));
        }
        fs.writeFileSync(path.join(outputPath, newFolder, fileName + ext), encrypted);
        fs.writeFileSync(path.join(outputPath, newFolder, 'hash_code.txt'), hashedValue);
        fs.unlinkSync(filePath);

        return true;
        //console.log(EncryptStr);
    }
    static decrypt_rsa(filePath, relativeOrAbsolutePathtoPrivateKey,hashPath) {
        const absolutePathKey = path.resolve(relativeOrAbsolutePathtoPrivateKey)
        const absolutePathFile = path.resolve(filePath)
        const absoluteHashFile = path.resolve(hashPath)
        let loc = path.dirname(filePath);
        var fileName = path.basename(absolutePathFile).split(".");
        var data = fs.readFileSync(absolutePathFile);
        var rsaDecryptor = new chilkat.Rsa();
        rsaDecryptor.EncodingMode = "base64";
        const privateKey = fs.readFileSync(absolutePathKey, 'utf8')
        var checkHashValue = fs.readFileSync(absoluteHashFile);
        fileName.splice(-1, 1);
        fileName = fileName.join(".");

        success = rsaDecryptor.ImportPrivateKey(privateKey);
        var usePrivateKey = true;
        var decrypted = rsaDecryptor.DecryptStringENC(data,usePrivateKey);
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
    }
    static encrypt_aes256cbc(filePath,passwordFile,outputPath=path.dirname(filePath)) {
        try {
            var data = fs.readFileSync(filePath);
            var password = fs.readFileSync(passwordFile);
            var loc = path.dirname(filePath);
            var fileName = path.basename(filePath);
            var newFolder = path.basename(filePath,path.extname(filePath));
            var cipher = Crypto.createCipher("aes-256-cbc", password);
            var encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
            var hash = Crypto.createHash('sha256');
            hash.update(data);
            var hashedValue = hash.digest('hex');

            fs.unlinkSync(filePath);
            if (!fs.existsSync(path.join(outputPath,newFolder))){
                fs.mkdirSync(path.join(outputPath,newFolder));
            }
            fs.writeFileSync(path.join(outputPath, newFolder, fileName + ext), encrypted);
            fs.writeFileSync(path.join(outputPath, newFolder, 'hash_code.txt'), hashedValue);

            return true;
            } catch (exception) {
            throw new Error(exception.message);
            }
      }
    
    static decrypt_aes256cbc(filePath,passwordFile,hashPath) {
        try {
            var data = fs.readFileSync(filePath);
            var checkHashValue = fs.readFileSync(hashPath);
            let loc = path.dirname(filePath);
            var fileName = path.basename(filePath).split(".");
            var password = fs.readFileSync(passwordFile);
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