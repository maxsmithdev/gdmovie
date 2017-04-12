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

      $('#download_url').html('<a href="'+videoUrl+'">Download Link</a>');

      $(document).on('closing', '.remodal', function(e) {
          $('#jwplayer').empty();
      });

      jwplayer("jwplayer").setup({
        width: "100%",
        primary: 'html5',
        setFullscreen: true,
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

}

