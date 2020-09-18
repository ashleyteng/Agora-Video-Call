/*
 * JS Interface for Agora.io SDK
 */

// video profile settings - https://docs.agora.io/en/Video/API%20Reference/web/interfaces/agorartc.stream.html#setvideoprofile
const cameraVideoProfile = '480p_4'; // 640 × 480 @ 30fps
const screenVideoProfile = '480p_2'; //   640 × 480 @ 30fps

// create client instances for camera (client) and screen share (screenClient)
const client = AgoraRTC.createClient({
  mode: 'rtc',
  codec: 'vp8'
}); 
const screenClient = AgoraRTC.createClient({
  mode: 'rtc',
  codec: 'vp8'
}); 

// stream references (keep track of active streams) 
let remoteStreams = {}; // remote streams obj struct [id : stream] 

let localStreams = {
  camera: {
    id: "",
    stream: {}
  },
  screen: {
    id: "",
    stream: {}
  }
};

let mainStreamId; // reference to main stream
let screenShareActive = false; // flag for screen share 

function initClientAndJoinChannel(agoraAppId, channelName) {
  // init Agora SDK
  client.init(agoraAppId, function() {
    console.log('successfully initialized client');
    joinChannel(channelName);
  }, function(err) {
    console.log('[ERROR] : Client failed to initialize: ' + err);
  })
  
  // join channel upon successfull init
}

// listen for client events

// Local Stream Events
// stream-published - local stream successfully published
client.on('stream-published', function(evt) {
  console.log('Local stream successfully published')
  enableUiControls(evt.stream);
})

//Remote Stream Events
// stream-added - new stream added to channel, subscribe to the remote stream.
client.on('stream-added', function(evt) {
  const stream = evt.stream;
  const streamId = stream.getId();
  console.log('New stream added: ' + streamId);
  // subscribe to remote stream
  client.subscribe(stream, function(err) {
    console.log('Error: subscribe failed: ' + streamId);
  })
})
// stream-subscribed - successfully subscribed to remote stream
client.on('stream-subscribed', function(evt) {
  const stream = evt.stream;
  const streamId = stream.getId();
  remoteStreams[streamId] = stream;
  console.log('Successfully subscribed to stream: ' + streamId);
  if($('#full-screen-video').is(':empty')) {
    mainstreamId = streamId;
    stream.play('full-screen-video');
  } else {
    addRemoteStreamMiniView(stream);
  }
})

// add new stream to the UI

// peer-leave - remote stream has left the channel
client.on('peer-leave', function(evt) {
  const stream = evt.stream;
  const streamId = stream.getId();
  console.log('User' + streamID + 'left channel');
  remoteStreams[streamID].stop();
  if(streamID == mainStreamId) {
    const streamIds = Object.keys(remoteStreams);
    const randId = streamIds[Math.floor(Math.random() * streamId.length)];
    var remoteContainerId = '#' + randId + '_container';
    $(remoteContainerId).empty().remove();
    remoteStreams[randId].play('full-screen-video');
    mainStreamId = randId;
  } else {
    var remoteContainerId = '#' + streamID + '_container';
    $(remoteContainerId).empty().remove();
  }
})
// remove stream from the UI

// mute-audio - a remote stream has muted its mic
client.on('mute-audio', function(evt) {
  const stream = evt.stream;
  const streamId = stream.getId();
  console.log('User' + streamID + 'muted their audio');
})
// unmute-audio - a remote stream has un-muted its mic
client.on('unmute-audio', function(evt) {
  const stream = evt.stream;
  const streamId = stream.getId();
  console.log('User' + streamID + 'unmuted their audio');
})
// mute-video - a remote stream has muted its video
client.on('mute-video', function(evt) {
  const stream = evt.stream;
  const streamId = stream.getId();
  console.log('User' + streamID + 'muted their video');
})
// unmute-video - a remote stream has un-muted its video
client.on('unmute-video', function(evt) {
  const stream = evt.stream;
  const streamId = stream.getId();
  console.log('User' + streamID + 'muted their video');
})
// join a channel
function joinChannel(channelName) {
  const token = generateToken();
  const userID = null; // set to null to auto generate uid on successful connection
  // Join the channel using Agora Client
  client.join(token, channelName, userID, function(uid){
    console.log('Joined channel with UID: ' + uid);
    localStreams.camera.id = uid;
    createCameraStream(uid);
  }, function(err) {
    console.log('failed to join channel: ' + err);
  })
  // init the local camera stream
}

// video streams for channel
function createCameraStream(uid) {
  // create the local stream object using video and audio
  const localStream = AgoraRTC.createStream({
    streamID: uid,
    audio: true,
    video: true,
    screen: false
  })
  // set the video profile
  localStream.setVideoProfile(cameraVideoProfile)
  // init the local stream
  localStream.init(function(){
    console.log('local stream success');
    localStream.play('local-video');
    localStreams.camera.stream = localStream;
    
    client.publish(localStream, function(err) {
      console.log('error publishing local stream');
    })
  }, function(err) {
    console.log('local stream failed with err: ' + err);
  })
  // publish local stream
  // enable UI
}

// SCREEN SHARING
function initScreenShare(agoraAppId, channelName) {
  // init the screen client
  // join channel and init screen stream 
}

function joinChannelAsScreenShare(channelName) {
  var token = generateToken();
  var userID; // set to null to auto generate uid on successfull connection
   // Join the channel using screen Client
   // Create the stream object for screen sharing using screen, screenAudio
   // set the screen's video profile
   // init the screen stream and publish it.
   // disable the screen share button
   // add screen stream event listeners
   // stream-published - screen stream successfully published
   // stopScreenSharing - screen sharing stopped
}

function stopScreenShare() {
  // disable the local video stream (will send a mute signal)
  // stop playing the local stream
  // enable the camera feed
  // play the camera within the full-screen-video div
  // call screen clien leave function to leave the channel
  // unpublish the screen client
  // eanble screeen share button
}

// REMOTE STREAMS UI
function addRemoteStreamMiniView(remoteStream){
  var streamId = remoteStream.getId();
  // append the remote stream template to #remote-streams
  $('#remote-streams').append(
    $('<div/>', {'id': streamId + '_container',  'class': 'remote-stream-container col'}).append(
      $('<div/>', {'id': streamId + '_mute', 'class': 'mute-overlay'}).append(
          $('<i/>', {'class': 'fas fa-microphone-slash'})
      ),
      $('<div/>', {'id': streamId + '_no-video', 'class': 'no-video-overlay text-center'}).append(
        $('<i/>', {'class': 'fas fa-user'})
      ),
      $('<div/>', {'id': 'agora_remote_' + streamId, 'class': 'remote-video'})
    )
  );
  // play the remote video stream in the newly created div
  remoteStream.play('agora_remote_' + streamId);
  // add the ability for the user to double click the mini view containers to have it become the full screen video
  var containerId = '#' + streamId + '_container';
  $(containerId).dblclick(function() {
    // play selected container as full screen - swap out current full screen stream
    remoteStreams[mainStreamId].stop();    // stop the main video stream playback
    addRemoteStreamMiniView(remoteStreams[mainStreamId]);    // send the main video stream to a container
    $(containerId).empty().remove();  // remove the stream's miniView container
    remoteStreams[streamId].stop();  // stop the container's video stream playback
    remoteStreams[streamId].play('full-screen-video');  // play the remote stream as the full screen video
    mainStreamId = streamId;  // set the container stream id as the new main stream id
  });
}

function leaveChannel() {
  // if screen sharing is active, stop screen share
  client.unpublish(localStreams.camera.stream);
  client.leave(function() {
    localStreams.camera.stream.stop();
    localStreams.camera.stream.close();
    $('#remote-streams').empty();
    $('#mic-btn').prop('disabled', true)
    $('#video-btn').prop('disabled', true)
    $('#modalForm').modal('show');

  }, function(err) {
    console.log('client failed to leave channel')
  })
  // stop the camera stream playback
  // unpublish the camera stream
  // clean up and close the camera stream
  // disable the UI elements
  // remove divs for the remote feeds
  // leave the Agora Channel
}

// use tokens for added security
function generateToken() {
  return null; // TODO: add a token generation
}