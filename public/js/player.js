document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('mainVideo');
    const playBtn = document.getElementById('playPauseBtn');
    const container = document.getElementById('videoContainer');
    const progressArea = document.getElementById('progressArea');
    const progressFill = document.getElementById('progressFill');
    const curTimeEl = document.getElementById('curTime');
    const durTimeEl = document.getElementById('durTime');
    const spinner = document.getElementById('loadingSpinner');
    
    let currentEpIndex = 0;

    // --- 1. INIT PLAYER ---
    function init() {
        const lastEpId = localStorage.getItem(`panstream_last_${SERIES_ID}`);
        let startEp = PLAYLIST[0];

        if (lastEpId) {
            const found = PLAYLIST.find(e => e.episodeId === lastEpId);
            if (found) startEp = found;
        }
        
        loadEpisode(startEp);
    }

    // --- 2. LOAD EPISODE ---
    window.loadEpisode = function(episode) { // Attach to window for scope safety
        // UI Active State
        document.querySelectorAll('.episode-item').forEach(el => el.classList.remove('active'));
        const activeItem = document.querySelector(`.episode-item[data-id="${episode.episodeId}"]`);
        if(activeItem) {
            activeItem.classList.add('active');
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Load Video
        spinner.style.display = 'block';
        video.src = episode.playVoucher;
        
        // Restore Progress
        const savedTime = localStorage.getItem(`panstream_time_${episode.episodeId}`);
        if(savedTime) video.currentTime = parseFloat(savedTime);

        video.play().then(() => {
            updatePlayBtn(true);
            spinner.style.display = 'none';
        }).catch(() => {
            updatePlayBtn(false);
            spinner.style.display = 'none';
        });

        // Update Index
        currentEpIndex = PLAYLIST.findIndex(e => e.episodeId === episode.episodeId);
        
        // Save Context
        localStorage.setItem(`panstream_last_${SERIES_ID}`, episode.episodeId);
    };

    // --- 3. GLOBAL PLAY FUNCTION (Called from HTML) ---
    window.playEpisode = function(el) {
        const id = el.getAttribute('data-id');
        const ep = PLAYLIST.find(e => e.episodeId === id);
        if(ep) loadEpisode(ep);
    };

    // --- 4. CONTROLS LOGIC ---
    function updatePlayBtn(isPlaying) {
        playBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        if(isPlaying) container.classList.remove('paused');
        else container.classList.add('paused');
    }

    playBtn.addEventListener('click', () => {
        if(video.paused) video.play();
        else video.pause();
    });

    video.addEventListener('play', () => updatePlayBtn(true));
    video.addEventListener('pause', () => updatePlayBtn(false));
    video.addEventListener('waiting', () => spinner.style.display = 'block');
    video.addEventListener('playing', () => spinner.style.display = 'none');
    
    // Toggle play on video click
    video.addEventListener('click', () => {
        if(video.paused) video.play();
        else video.pause();
    });

    // Time Update & Progress
    video.addEventListener('timeupdate', () => {
        if(isNaN(video.duration)) return;
        const percent = (video.currentTime / video.duration) * 100;
        progressFill.style.width = `${percent}%`;
        
        curTimeEl.innerText = formatTime(video.currentTime);
        durTimeEl.innerText = formatTime(video.duration);

        // Save progress every 2s
        if(Math.floor(video.currentTime) % 2 === 0) {
            localStorage.setItem(`panstream_time_${PLAYLIST[currentEpIndex].episodeId}`, video.currentTime);
        }
    });

    // Seek
    progressArea.addEventListener('click', (e) => {
        const width = progressArea.clientWidth;
        const clickX = e.offsetX;
        const duration = video.duration;
        video.currentTime = (clickX / width) * duration;
    });

    // Auto Next
    video.addEventListener('ended', () => {
        if(currentEpIndex < PLAYLIST.length - 1) {
            loadEpisode(PLAYLIST[currentEpIndex + 1]);
        }
    });

    // Fullscreen
    document.getElementById('fullscreenBtn').addEventListener('click', () => {
        if (!document.fullscreenElement) {
            if(container.requestFullscreen) container.requestFullscreen();
            else if(video.webkitEnterFullscreen) video.webkitEnterFullscreen(); // iOS support
        } else {
            document.exitFullscreen();
        }
    });

    function formatTime(s) {
        const min = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }

    // Start
    init();
});
