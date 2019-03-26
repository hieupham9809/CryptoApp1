function encrypt(){
    debugger;
        des_path = document.getElementById("desPath").value; 
        if (des_path == "") {
            cute = "";
        }
        else {
            cute = document.getElementById("desPath").files[0].path;
        }
        cute1 = document.getElementById("myFile").files[0].path;
        cute2 = document.getElementById("keyFile").files[0].path;
      
        var e = document.getElementById("hashtype");
        var hashtype = e.options[e.selectedIndex].value;

        if (hashtype == "AES"){
            if (cute == ""){
                result = (Safe.encrypt_aes256cbc(cute1,cute2));
            }
            else{
                result = (Safe.encrypt_aes256cbc(cute1,cute2,cute));
            }
            if (result){
                alert ("Encrypt successfully!")
            }
        }
        else if (hashtype == "RSA") {          
            if (cute == ""){
                result = (Safe.encrypt_rsa(cute1,cute2));
            }
            else{
                result = (Safe.encrypt_rsa(cute1,cute2,cute));
            }
            if (result){
                alert ("Encrypt successfully!")
            }
        }
        else{            
            if (cute == ""){
                result = (Safe.encrypt_blowfish(cute1,cute2));
            }
            else{
                result = (Safe.encrypt_blowfish(cute1,cute2,cute));
            }
            if (result){
                alert ("Encrypt successfully!")
            }
        }
      }