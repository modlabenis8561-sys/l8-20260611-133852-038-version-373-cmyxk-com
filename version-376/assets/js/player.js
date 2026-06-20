function initMoviePlayer(videoId, buttonId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var hlsInstance = null;
    var ready = false;

    if (!video || !button || !sourceUrl) {
        return;
    }

    function safePlay() {
        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    function attachSource() {
        if (ready) {
            safePlay();
            return;
        }

        ready = true;
        button.classList.add("is-hidden");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
            video.addEventListener("loadedmetadata", safePlay, { once: true });
            video.load();
            safePlay();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, safePlay);
            return;
        }

        video.src = sourceUrl;
        video.load();
        safePlay();
    }

    button.addEventListener("click", attachSource);
    video.addEventListener("click", function () {
        if (video.paused) {
            attachSource();
        }
    });
    video.addEventListener("play", function () {
        button.classList.add("is-hidden");
    });
    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
