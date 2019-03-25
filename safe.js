const fs = require("fs");
const Crypto = require("crypto");
const path = require("path");
const ext = ".crypted";
const chilkat = require('@chilkat/ck-electron4-linux64');
var rsa = new chilkat.Rsa();
var success = rsa.UnlockComponent("Anything for 30-day trial");
if (success !== true) {
    console.log("RSA component unlock failed");
    // return false;
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
                var success1 = crypt.UnlockComponent("Anything for 30-day trial");
                if (success1 !== true) {
                    console.log(crypt.LastErrorText);
                    return;
                }
                crypt.CryptAlgorithm = "blowfish2";
                crypt.CipherMode = "ecb";
                crypt.KeyLength = 256;
                crypt.EncodingMode = "hex";
                const ivHex = "0001020304050607";
                crypt.SetEncodedIV(ivHex,"hex");
                
                const absolutePathKey = path.resolve(passwordFile);
                const absolutePathFile = path.resolve(filePath);
                const absoluteParentOutputPath = path.resolve(outputPath);
                var fileName = path.basename(filePath);
                var newFolder = path.basename(filePath,path.extname(filePath));
                const absoluteOutputPath = path.join(absoluteParentOutputPath,newFolder);
                var data = fs.readFileSync(absolutePathFile)
                

                // The block size of the blowfish algoirthm is 8 bytes, therefore the IV is 8 bytes.
        
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
                success1 = crypt.CkEncryptFile(absolutePathFile,path.join(absoluteOutputPath,fileName + ext));
                fs.writeFileSync(path.join(absoluteOutputPath, 'hash_code.txt'), hashedValue);

                if (crypt.LastMethodSuccess !== true) {
                    console.log(crypt.LastErrorText);
                    return;
                }
                //crypt.CkDecryptFile(path.join(absoluteOutputPath,fileName + ext),path.join(absoluteOutputPath,fileName));

                fs.unlinkSync(absolutePathFile);
                

                return true;
            } catch (exception) {
            throw new Error(exception.message);
            }

           
    }
    static decrypt_blowfish(filePath,keyPath,hashPath){
        const absolutePathKey = path.resolve(keyPath)
        const absolutePathFile = path.resolve(filePath)
        const absoluteHashFile = path.resolve(hashPath)
        let loc = path.dirname(absolutePathFile);
        var fileName = path.basename(absolutePathFile).split(".");
        //var data = fs.readFileSync(absolutePathFile);
        
        var decrypt = new chilkat.Crypt2();
        var success2 = decrypt.UnlockComponent("Anything for 30-day trial");
        if (success2 !== true) {
            console.log(decrypt.LastErrorText);
            return;
        }
        var keyHex = fs.readFileSync(absolutePathKey);
        const ivHex = "0001020304050607";

        decrypt.CryptAlgorithm = "blowfish2";
        decrypt.CipherMode = "ecb";
        decrypt.KeyLength = 256;
        decrypt.EncodingMode = "hex";
        decrypt.SetEncodedIV = (ivHex,"hex");
        decrypt.SetEncodedKey(keyHex,"hex");

        console.log(absolutePathFile);
        var checkHashValue = fs.readFileSync(absoluteHashFile);
        fileName.splice(-1, 1);
        fileName = fileName.join(".");
        console.log(fileName);
        var decrypted = decrypt.CkDecryptFile(absolutePathFile,path.join(loc,fileName));
        if (decrypt.LastMethodSuccess !== true) {
            console.log(decrypt.LastErrorText);
            return;
        }
        var hashDecryptedFile = fs.readFileSync(path.join(loc,fileName));
        var hash = Crypto.createHash('sha256');
        hash.update(hashDecryptedFile);

        if (checkHashValue.toString() !== hash.digest('hex').toString()){
            throw new Error("Wrong hash value, please check again!");
        }
        fs.unlinkSync(absolutePathFile);
        fs.unlinkSync(absoluteHashFile);
        if (fileName.split(".").slice(-1)[0] == "enc") {
            fileName.split(".").splice(-1, 1);
            fileName = new Buffer(fileName, "hex").toString();
            console.log(fileName);
        }

        return true;

    }
    static generateKeys(outputPath) {
       debugger;
        success = rsa.GenerateKey(1024);
        if (success !== true) {
            console.log(rsa.LastErrorText);
            return;
        }
        var publicKey = rsa.ExportPublicKey();
        
        var privateKey = rsa.ExportPrivateKey();

        fs.writeFileSync(path.join(outputPath,'private.xml'), privateKey)
        fs.writeFileSync(path.join(outputPath,'public.xml'), publicKey)
        console.log("Generates keys completed");
        return true;
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

        return true;
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

            return true;

            } catch (exception) {
            throw new Error(exception.message);
            }
        }
    
}

module.exports = Safe;