//save password of user
const Store = require('electron-store');
var passwordHash = require('password-hash');

class DataStore extends Store{
    constructor(settings){
        super(settings)
        this.infos = this.get('infos') || {psw: passwordHash.generate("000000"),filePath:[]}    
    }
    getHashPassword(){
        return this.infos.psw
    }
    saveInfo(){
        // save user info (username and password in to json file)
        this.set('infos',this.infos)
             
        return this
    }
    updatePassword(oldPassword, newPassword){
        if (passwordHash.verify(oldPassword,this.infos.psw)){
            this.infos.psw = passwordHash.generate(newPassword);
            return 0;
        }
        else{
            return -1;
        }
    }
    updateFilePath(filePath){
        //string
        this.infos.filePath.push(filePath);
        return this.saveInfo()
    }
}
module.exports = DataStore