function encrypt(){
        cute = document.getElementById("desPath").files[0].path;
        cute1 = document.getElementById("myFile").files[0].path;
        cute2 = document.getElementById("keyFile").files[0].path;
          // window.Safe = Safe;
          // let s=new Safe();
     

        // alert (document.getElementById('myFile').files[0].path);
        // result = (Safe.encrypt_aes256cbc('./File  (copy).txt','./KeyFile.txt','./Test'));
        // Safe.encrypt_aes256cbc('./File  (copy).txt','./key.txt','./Test');
        // Safe.encrypt_aes256cbc(cute1,cute2,cute);
        // alert (result);

        // result = (Safe.encrypt_blowfish(cute1,cute2,cute));
        // alert (result);


        var e = document.getElementById("hashtype");
        var hashtype = e.options[e.selectedIndex].value;

        if (hashtype == "AES"){
            result = (Safe.encrypt_aes256cbc(cute1,cute2,cute));
            if (result){
                alert ("Encrypt successfully!")
            }
        }
        else if (hashtype == "RSA") {
            result = (Safe.encrypt_rsa(cute1,cute2,cute));
            if (result){
                alert ("Encrypt successfully!")
            }
        }
        else{
            result = (Safe.encrypt_blowfish(cute1,cute2,cute));
            if (result){
                alert ("Encrypt successfully!")
            }
        }
      }