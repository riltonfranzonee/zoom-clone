/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
const messageList = document.getElementById('messages-list');

myVideo.muted = true;

const peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '3000',
});

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });

  videoGrid.append(video);
};

let myVideoStream;

peer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);

  const video = document.createElement('video');

  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  });
};

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
      call.answer(stream);

      const video = document.createElement('video');

      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on('user-connected', userId => {
      connectToNewUser(userId, stream);
    });
  });

const msg = $('input');

$('html').keydown(e => {
  if (e.which === 13 && msg.val().length) {
    socket.emit('message', msg.val());
    msg.val('');
  }
});

const scrollToBottom = () => {
  const d = $('.main__chat__window');
  d.scrollTop(d.prop('scrollHeight'));
};

socket.on('createMessage', message => {
  const li = document.createElement('li');
  const name = document.createElement('b');
  name.appendChild(document.createTextNode('user'));
  li.appendChild(name);
  li.appendChild(document.createTextNode(message));
  li.className = 'message';
  scrollToBottom();

  messageList.appendChild(li);
});

const setMuteButton = () => {
  const html = `<i class="fas fa-microphone"></i>
  <span>Mute</span>
  `;

  document.querySelector('.main__mute_button').innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `<i class="unmute fas fa-microphone-slash"></i>
  <span>Unmute</span>
  `;

  document.querySelector('.main__mute_button').innerHTML = html;
};

const setPlayButton = () => {
  const html = `<i class="stop fas fa-video-slash"></i>
  <span>Play video</span>
  `;

  document.querySelector('.main__video_button').innerHTML = html;
};

const setStopButton = () => {
  const html = `<i class="fas fa-video"></i>
  <span>Stop video</span>
  `;

  document.querySelector('.main__video_button').innerHTML = html;
};

const toggleMute = () => {
  const { enabled } = myVideoStream.getAudioTracks()[0];

  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const toggleVideo = () => {
  const { enabled } = myVideoStream.getVideoTracks()[0];

  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayButton();
  } else {
    setStopButton();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};
