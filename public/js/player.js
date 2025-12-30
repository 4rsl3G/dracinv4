// VIDEO PLAYER LOGIC
const video = document.getElementById('mainPlayer');
const playBtn = document.getElementById('playBtn');
const progressBarContainer = document.getElementById('progressBarContainer');
const progressFill = document.getElementById('progressFill');
const curTimeText = document.getElementById('curTime');
const durTimeText = document.getElementById('durTime');
const nextEpBtn = document.getElementById('nextEpBtn');
const sidebarItems = document.querySelectorAll('.episode-item');

let currentEpIndex = 0;
let idleTimer;

// Init Player with first episode logic
function initPlayer() {
    // Check LocalStorage for last watched episode for this series
    const savedEpId = localStorage.getItem(`panstream_last_ep_${SERIES_ID}`);
    let startEp = PLAYLIST[0];

    if (savedEpId) {
        const found = PLAYLIST.find(e => e.episodeId === savedEpId);
        if (found) startEp = found;
    }

    loadEpisode(startEp);
}

function loadEpisode(episode) {
    // UI Update
    document.querySelectorAll('.episode-item').forEach(el => el.classList.remove('active'));
    const sidebarItem = document.querySelector(`.episode-item[data-id="${episode.episodeId}"]`);
    if(sidebarItem) sidebarItem.classList.add('active');
    
    // Update Info
    document.getElementById('playerEp').innerText = `Ep. ${episode.episodeNo}`;
    
    // Load Source
    video.src = episode.playVoucher; // Using playVoucher as source
    video.load();
    
    // Check saved progress
    const savedTime = localStorage.getItem(`panstream_progress_${episode.episodeId}`);
    if (savedTime) {
        video.currentTime = parseFloat(savedTime);
    }

    video.play().then(() => {
        document.getElementById('playPauseIcon').classList.add('hidden');
    }).catch(e => {
        // Auto play blocked
        document.getElementById('playPauseIcon').classList.remove('hidden');
    });

    // Update Index
    currentEpIndex = PLAYLIST.findIndex(e => e.episodeId === episode.episodeId);
    
    // Save as last watched
    localStorage.setItem(`panstream_last_ep_${SERIES_ID}`, episode.episodeId);
}

// Click on Sidebar
function playEpisode(el) {
    const id = el.getAttribute('data-id');
    const ep = PLAYLIST.find(e => e.episodeId === id);
    if(ep) loadEpisode(ep);
}

// Play/Pause Toggle
function togglePlay() {
    if (video.paused) {
        video.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        document.getElementById('playPauseIcon').classList.add('hidden');
    } else {
        video.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

video.addEventListener('click', togglePlay);
playBtn.addEventListener('click', togglePlay);

// Progress Bar
video.addEventListener('timeupdate', () => {
    const percent = (video.currentTime / video.duration) * 100;
    progressFill.style.width = `${percent}%`;
    
    // Time Text
    const curMins = Math.floor(video.currentTime / 60);
    const curSecs = Math.floor(video.currentTime % 60);
    const durMins = Math.floor(video.duration / 60) || 0;
    const durSecs = Math.floor(video.duration % 60) || 0;
    
    curTimeText.innerText = `${curMins}:${curSecs < 10 ? '0' : ''}${curSecs}`;
    durTimeText.innerText = `${durMins}:${durSecs < 10 ? '0' : ''}${durSecs}`;

    // Save progress every second
    if(Math.floor(video.currentTime) % 5 === 0) {
        localStorage.setItem(`panstream_progress_${PLAYLIST[currentEpIndex].episodeId}`, video.currentTime);
    }
});

// Seek
progressBarContainer.addEventListener('click', (e) => {
    const width = progressBarContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = video.duration;
    video.currentTime = (clickX / width) * duration;
});

// Auto Next
video.addEventListener('ended', () => {
    if (currentEpIndex < PLAYLIST.length - 1) {
        loadEpisode(PLAYLIST[currentEpIndex + 1]);
    }
});

nextEpBtn.addEventListener('click', () => {
    if (currentEpIndex < PLAYLIST.length - 1) {
        loadEpisode(PLAYLIST[currentEpIndex + 1]);
    }
});

// Fullscreen
document.getElementById('fullscreenBtn').addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.getElementById('videoWrapper').requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
    } else if (e.code === 'ArrowRight') {
        video.currentTime += 5;
    } else if (e.code === 'ArrowLeft') {
        video.currentTime -= 5;
    }
});

// Idle Controls Hiding
const videoWrapper = document.getElementById('videoWrapper');
videoWrapper.addEventListener('mousemove', () => {
    document.getElementById('videoControls').style.opacity = 1;
    document.body.style.cursor = 'default';
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
        if (!video.paused) {
            document.getElementById('videoControls').style.opacity = 0;
            document.body.style.cursor = 'none';
        }
    }, 2500);
});

// Error Handling
video.addEventListener('error', () => {
    alert('Video source failed to load. Trying to reload...');
});

// Start
initPlayer();
