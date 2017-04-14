var _GOOGLE_CLIENT_ID = '744306491233-tp2a5t5ffe9rofu5uto31oq96hqcjam9.apps.googleusercontent.com';
var _GOOGLE_DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v2/rest"];
var _GOOGLE_SCOPES = 'https://www.googleapis.com/auth/drive';
var _JWPLAYER_CLIENT_ID = "Z+cCupezLDq3rdFGCUpD5dPphw5L1vsOid7D5w==";
var _TOP_NAV = [];
var _TOP_NAV_CURRENT_ID;
var isIE8 = window.XDomainRequest ? true : false;

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

            //console.log(response);

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
     
     //console.log("File Click", {id:fileId, name:fileName});
     createJwplayer(fileId);
  });

}

function createNav(folders, currentId){
  $('#nav').empty();

  //console.log("Current Id : " + currentId);

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
     //console.log('Nav Click', "id : " + folderId);
     for(var key in _TOP_NAV){
       if(removeAfter > 0){
         //console.log("Nav Click", "remove id : " + folderId);
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

function callback(data){
  console.log(data);
  var inst = $('[data-remodal-id=modal]').remodal();
  $(document).on('closing', '.remodal', function(e) {
      $('#jwplayer').empty();
  });

  jwplayer("jwplayer").setup({
    setFullscreen: true,
      playlist: [{
          sources: [{
              "file": "https://r15---sn-vgqs7nee.c.docs.google.com/videoplayback?id=7c2fab07828abe5a&itag=18&source=webdrive&requiressl=yes&ttl=transient&mm=30&mn=sn-vgqs7nee&ms=nxu&mv=m&pl=28&ei=LZvwWMg7we2qBdzzh-gC&mime=video/mp4&lmt=1492000512346663&mt=1492163303&ip=107.178.195.205&ipbits=0&expire=1492177773&cp=QVJOVEJfVldVRFhNOmlURmVCYUV3SnND&sparams=ip%2Cipbits%2Cexpire%2Cid%2Citag%2Csource%2Crequiressl%2Cttl%2Cmm%2Cmn%2Cms%2Cmv%2Cpl%2Cei%2Cmime%2Clmt%2Ccp&signature=1668BF49951804001ACEE2D6BF190F782D81D1D5.89C7E6E4638D7E560497ADD1188022B056E44C7F&key=ck2&app=explorer&driveid=0B-WBApkYziP5Q1QyMnJldGJKVjg",
              "type": "video/mp4"
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
}

function createCrossDomainRequest(url, handler) {
    var request;
    if (isIE8) {
        request = new window.XDomainRequest();
    } else {
        request = new XMLHttpRequest();
    }
    return request;
}

function callOtherDomain(url) {
  var xhr = createCrossDomainRequest();
  if (xhr) {
      if (isIE8) {
          xhr.onload = function(){
            console.log(xhr.responseText);
            //hanlder(xhr.responseText);
          };
          xhr.open("GET", url, true);
          xhr.send();
      } else {
          xhr.open('GET', url, true);
          xhr.onreadystatechange = function(){
            console.log(xhr.responseText);

             //hanlder(xhr.responseText);
          };
          xhr.send();
      }
  }
}


function createJwplayer(fileId){
callOtherDomain('https://docs.google.com/get_video_info?authuser=&sle=true&hl=en&docid=' + fileId);

 // res.header('Access-Control-Allow-Origin', '*');
 //    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
 //    res.header('Access-Control-Allow-Headers', 'accept, content-type, x-parse-application-id, x-parse-rest-api-key, x-parse-session-token');

// $.ajax({ 
//     type: 'GET',
//     url: 'https://script.google.com/macros/s/AKfycbxuig31xgSOLyDR7ydiM-rrTYD4-8ojQfcgfHnz-iA/dev',
//     data: { fileId : fileId },
//     crossDomain: true,
//     dataType: 'jsonp',
//     jsonpCallback: 'callback',
//     success: function(data){},
//     error: function(){}
// });


//   var request = gapi.client.drive.files.get({
//     'fileId': fileId
//   });

//   request.execute(function(resp) {
//     console.log(resp);
//     if(resp.downloadUrl != undefined){
//       var inst = $('[data-remodal-id=modal]').remodal();
//       var videoUrl = resp.downloadUrl.replace('&gd=true','');

//       $('#download_url').html('<a href="'+videoUrl+'">Download Link</a>');

//       $(document).on('closing', '.remodal', function(e) {
//           $('#jwplayer').empty();
//       });

//       jwplayer("jwplayer").setup({
//         width: "100%",
//         primary: 'html5',
//         setFullscreen: true,
//           playlist: [{
//               sources: [{
//                   "file": videoUrl,
//                   "type": resp.mimeType
//               }],
//           }],
//           tracks: [{
//               "file": "http://file0.assrt.net/onthefly/091007/-/3/intimid-knockknock-proper-limited.big5.srt?_=1488124462&-=8abac67670dd3b6ecb8fe74cc654052b",
//               "label": "English",
//               "kind": "captions",
//               "default": true
//           }]
//       });

//       inst.open();
//     }else{
//       alert('Not found Download Url.');
//     }
// });

}

