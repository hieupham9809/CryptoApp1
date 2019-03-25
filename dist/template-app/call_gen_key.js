function gen_key(){
          debugger;
        cute = document.getElementById("desPath").files[0].path;
        alert (cute);
        result = Safe.generateKeys(cute);
        if (result){
                alert ("Key Generate successfully!")
            }
      }