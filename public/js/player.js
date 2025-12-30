document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('mainVideo');
    const container = document.getElementById('videoContainer');
    const playBtn = document.getElementById('playPauseBtn');
    const centerIcon = document.getElementById('centerPlayIcon');
    const progressArea = document.getElementById('progressArea');
    const progressFill = document.getElementById('progressFill');
    const curTimeEl = document.getElementById('curTime');
    const durTimeEl = document.getElementById('durTime');
    const spinner = document.getElementById('loadingSpinner');
    const overlayEpNum = document.getElementById('overlayEpNum');
    
    let currentEpIndex = 0;

    // --- 1. INITIALIZATION ---
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
    window.loadEpisode = function(episode) {
        // UI Updates
        document.querySelectorAll('.episode-item').forEach(el => {
            el.classList.remove('bg-white/10', 'border-primary');
            el.classList.add('border-transparent');
            el.querySelector('.playing-indicator').classList.add('hidden');
        });

        const activeItem = document.querySelector(`.episode-item[data-id="${episode.episodeId}"]`);
        if(activeItem) {
            activeItem.classList.add('bg-white/10', '!border-primary');
            activeItem.querySelector('.playing-indicator').classList.remove('hidden');
            
            // Auto scroll playlist
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        overlayEpNum.innerText = episode.episodeNo;
        spinner.classList.remove('hidden');
        
        // Load Source
        video.src = episode.playVoucher;
        
        // Restore Time
        const savedTime = localStorage.getItem(`panstream_time_${episode.episodeId}`);
        if(savedTime) video.currentTime = parseFloat(savedTime);

        video.play().then(() => {
            updatePlayState(true);
            spinner.classList.add('hidden');
        }).catch(() => {
            updatePlayState(false);
            spinner.classList.add('hidden');
        });

        currentEpIndex = PLAYLIST.findIndex(e => e.episodeId === episode.episodeId);
        localStorage.setItem(`panstream_last_${SERIES_ID}`, episode.episodeId);
    };

    // Global Accessor
    window.playEpisode = function(el) {
        const id = el.getAttribute('data-id');
        const ep = PLAYLIST.find(e => e.episodeId === id);
        if(ep) loadEpisode(ep);
    };

    // --- 3. CONTROLS LOGIC ---
    function updatePlayState(isPlaying) {
        if(isPlaying) {
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            centerIcon.classList.add('opacity-0', 'scale-50');
            centerIcon.classList.remove('opacity-100', 'scale-100');
        } else {
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            centerIcon.classList.remove('opacity-0', 'scale-50');
            centerIcon.classList.add('opacity-100', 'scale-100');
        }
    }

    function togglePlay() {
        if(video.paused) video.play();
        else video.pause();
    }

    // Event Listeners
    playBtn.addEventListener('click', togglePlay);
    document.getElementById('tapArea').addEventListener('click', togglePlay); // Tap video to toggle

    video.addEventListener('play', () => updatePlayState(true));
    video.addEventListener('pause', () => updatePlayState(false));
    video.addEventListener('waiting', () => spinner.classList.remove('hidden'));
    video.addEventListener('playing', () => spinner.classList.add('hidden'));

    // Progress Logic
    video.addEventListener('timeupdate', () => {
        if(isNaN(video.duration)) return;
        const percent = (video.currentTime / video.duration) * 100;
        progressFill.style.width = `${percent}%`;
        
        curTimeEl.innerText = formatTime(video.currentTime);
        durTimeEl.innerText = formatTime(video.duration);

        if(Math.floor(video.currentTime) % 2 === 0) {
            localStorage.setItem(`panstream_time_${PLAYLIST[currentEpIndex].episodeId}`, video.currentTime);
        }
    });

    // Seek
    progressArea.addEventListener('click', (e) => {
        const rect = progressArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const duration = video.duration;
        video.currentTime = (x / width) * duration;
    });

    // Auto Next with SweetAlert
    video.addEventListener('ended', () => {
        if(currentEpIndex < PLAYLIST.length - 1) {
            const nextEp = PLAYLIST[currentEpIndex + 1];
            
            // Toast Notification
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                background: '#1a1a1a',
                color: '#fff'
            });
            Toast.fire({
                icon: 'success',
                title: `Playing Next: Episode ${nextEp.episodeNo}`
            });

            loadEpisode(nextEp);
        }
    });

    // Fullscreen
    document.getElementById('fullscreenBtn').addEventListener('click', () => {
        if (!document.fullscreenElement) {
            if(container.requestFullscreen) container.requestFullscreen();
            else if(video.webkitEnterFullscreen) video.webkitEnterFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    function formatTime(s) {
        const min = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }

    // Start Player
    init();
});
