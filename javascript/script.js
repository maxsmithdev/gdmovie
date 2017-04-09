var _GOOGLE_CLIENT_ID = '744306491233-tp2a5t5ffe9rofu5uto31oq96hqcjam9.apps.googleusercontent.com';
var _GOOGLE_DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v2/rest"];
var _GOOGLE_SCOPES = 'https://www.googleapis.com/auth/drive';
var _JWPLAYER_CLIENT_ID = "Z+cCupezLDq3rdFGCUpD5dPphw5L1vsOid7D5w==";
var _TOP_NAV = [];
var _TOP_NAV_CURRENT_ID;

jwplayer.key = _JWPLAYER_CLIENT_ID;

function initClient(){
  gapi.client.init({
    discoveryDocs: _GOOGLE_DISCOVERY_DOCS,
    clientId: _GOOGLE_CLIENT_ID,
    scope: _GOOGLE_SCOPES
  }).then(function () {

    var authorizeBtn = $('#authorize-button');
    var signoutBtn = $('#signout-button');
    var updateSigninStatus = function(isSignedIn) {
      if (isSignedIn) {
          authorizeBtn.css('display', 'none');
          signoutBtn.css('display', 'block');

          gapi.client.drive.files.list({
            'orderBy' : 'folder',
            'q' : "'root' in parents"
          }).then(function(response) {

            console.log(response);

              _TOP_NAV["ROOT"] = {id : "ROOT", name : "Home"};
              createNav(_TOP_NAV, 0);
              createFolder(response);
          });

      } else {
          authorizeBtn.css('display', 'block');
          signoutBtn.css('display', 'none');
          $('#content').empty();
          $('#nav').empty();
          $('#jwplayer').empty();
      }
    };

    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

    authorizeBtn.click(function(e){
       gapi.auth2.getAuthInstance().signIn();
    });

    signoutBtn.click(function(e){
      gapi.auth2.getAuthInstance().signOut();
    });
  });
}

function createFolder(response){
  $('#loading').remove();

  for(var i=0;i<response.result.items.length;i++){
     var data = response.result.items[i];
     var name = data.title;
     var mimeType = data.mimeType;
     var id = data.id;

     if(mimeType == "application/vnd.google-apps.folder"){
        $('#content').append('<a href="#" class="folder" folder-id="'+ id +'"><img src="./img/folder.png" /><p id="folder_title">' + name + '</p></a>');
     }else if(mimeType == "video/mkv"){
        $('#content').append('<a href="#" class="file" file-id="'+ id +'"><img src="./img/mkv.png" /><p id="file_title">' + name + '</p></a>');
     }else if(mimeType == "video/mp4"){
        $('#content').append('<a href="#" class="file" file-id="'+ id +'"><img src="./img/mp4.png" /><p id="file_title">' + name + '</p></a>');
     }
  }

  $('.folder').click(function(e) {
      e.preventDefault();
      var folderId = $(this).attr('folder-id');
      var folderName = $(this).children('p#folder_title').html();

      $('#content').html('<div id="loading">Loading...</div>');

      _TOP_NAV[folderId] = { id : folderId, name : folderName };
      createNav(_TOP_NAV, folderId);

      gapi.client.drive.files.list({
        'q' : "'"+ folderId + "' in parents"
      }).then(function(response) {
          // console.log(response);
          createFolder(response);
      });
  });

  $('.file').click(function(e){
     e.preventDefault();
     var fileId = $(this).attr('file-id');
     var fileName = $(this).children('p#file_title').html();
     
     console.log("File Click", {id:fileId, name:fileName});
     createJwplayer(fileId);
  });

}

function createNav(folders, currentId){
  $('#nav').empty();

  console.log("Current Id : " + currentId);

  for(var key in folders){
      if(folders.hasOwnProperty(key)) {
          if(key == currentId){
            $('#nav').append('<span>'+ folders[key].name +'</span>');
          }else{
            $('#nav').append('<a href="#" class="nav" folder-id="'+ folders[key].id +'">'+ folders[key].name +'</a> > ');
          }
      }
  }

  $('.nav').click(function(e){
     e.preventDefault();
     var folderId = $(this).attr('folder-id');
     var removeAfter = -1;
     
      _TOP_NAV_CURRENT_ID = folderId;
     console.log('Nav Click', "id : " + folderId);
     for(var key in _TOP_NAV){
       if(removeAfter > 0){
         console.log("Nav Click", "remove id : " + folderId);
         delete _TOP_NAV[key];
       }
       
        if (key == folderId) {
            removeAfter = 1;
        }
     }
     
     $('#content').html("");
     createNav(_TOP_NAV, folderId);
     
     $('#content').html('<div id="loading">Loading...</div>');
      if (folderId != "ROOT") {
          gapi.client.drive.files.list({
              'q': "'" + folderId + "' in parents"
          }).then(function(response) {
              // console.log(response);
              createFolder(response);
          });
      } else {
          gapi.client.drive.files.list({
              'q': "'root' in parents"
          }).then(function(response) {
              // console.log(response);
              createFolder(response);
          });
      }

  });
}

function createJwplayer(fileId){

  var request = gapi.client.drive.files.get({
    'fileId': fileId
  });

  request.execute(function(resp) {
    console.log(resp);
    if(resp.downloadUrl != undefined){
      var inst = $('[data-remodal-id=modal]').remodal();
      var videoUrl = resp.downloadUrl.replace('&gd=true','');
      $(document).on('closing', '.remodal', function(e) {
          $('#jwplayer').empty();
      });

      jwplayer("jwplayer").setup({
        width: "100%",
        aspectratio: "16:9",
          playlist: [{
              sources: [{
                  "file": videoUrl,
                  "type": resp.mimeType
              }],
          }],
          tracks: [{
              "file": "http://file0.assrt.net/onthefly/091007/-/3/intimid-knockknock-proper-limited.big5.srt?_=1488124462&-=8abac67670dd3b6ecb8fe74cc654052b",
              "label": "English",
              "kind": "captions",
              "default": true
          }]
      });

      inst.open();
    }else{
      alert('Not found Download Url.');
    }
});


    // var accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
    // var videoUrl = "https://www.googleapis.com/drive/v3/files/"+ fileId + "?alt=media";
    // var xhr = new XMLHttpRequest();
    // xhr.open('GET', videoUrl);
    // xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    
    // xhr.onload = function() {
    //   alert("Loaded.");
    //   console.log(xhr.responseText);
    // };
    
    // xhr.onerror = function() {
    //   alert('Error.');
    // };

    // xhr.send();


  // gapi.client.drive.files.get({
  //       fileId: fileId
  // }).then(function(response) {
  //   console.log(response);
  // });

  //var videoUrl = "https://www.drive.google.com/uc?export=download&confirm=oN25&id=" + id;
  //var videoUrl = "https://www.googleapis.com/drive/v3/files/"+ id +"?alt=media";

  //$('#jwplayer').append('<form action="'+ videoUrl +'" method="post" target="iframe" id="fromUrl" style="display:none;"></form>');
  //$('#jwplayer').append('<iframe src="'+videoUrl+'" id="iframe" style="display:none;" />');
  //$('#fromUrl').submit();
  // $.ajax({ //my ajax request
  //           url: videoUrl,
  //           type: "POST",
  //           cache: false,
  //           dataType: "json",
  //           crossDomain: true,
  //           success : function(response){
  //             console.log(response);
  //           }
  //   });

// $.ajax({
//             url: "https://www.drive.google.com/uc",
//             type: "POST",
//             crossDomain: true,
//             data: JSON.stringify({export: "download", confirm : 2, id : id}),
//             dataType: "json",
//             success: function (response) {
//                 var resp = JSON.parse(response)
//                 alert(resp.status);
//             },
//             error: function (xhr, status) {
//                 alert("error");
//             }
//         });

  // $.post("https://www.googleapis.com/drive/v2/files/"+id, function(data) {
  //     console.log(data);
  // //     var linkReg = new RegExp('\{.*\}');
  // //     var links = data.match(linkReg);
  // //     var link;
      
  // //     if(links.length > 0){
  // //       var json = JSON.parse(links[0]);
  // //       link = json != undefined ? json.downloadUrl : "";
  // //     }

  // //     console.log("Link " + link);
  // });
}

