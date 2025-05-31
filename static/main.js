const musideckServer = "http://127.0.0.1:5000/"

function httpGet(theUrl) {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false);
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

function httpPost(theUrl, requestBody=null) {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", theUrl, false);
    xmlHttp.send(requestBody);
    return xmlHttp.responseText;
}

async function reconnect() {
    try {
        const response = await fetch(window.location.href);

        if (response.ok) {
            location.reload()
        }
    } catch (error) {
        console.error("Failed to connect to server: ", error.message);
        document.body.innerHTML = `<div class="root"><h1>Failed to reconnect!</h1><p>${error.message}</p><button>Reconnect</button></div>`;
    }
}

async function playbackChange(endpoint) {
    const response = await fetch(`${musideckServer}/${endpoint}`);
    const songJSON = await response.json();
    if (songJSON.status == "Playing") {
        document.getElementById('media-state').src = "static/img/pause.svg";
    } else {
        document.getElementById('media-state').src = "static/img/play.svg"
    }
}

var lastCoverVersion = null;

async function main() {
    try {
        const response = await fetch(`${musideckServer}/get`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const songJSON = await response.json();
        const cacheBust = `?v=${songJSON.title}`;

        if (songJSON.art_url !== lastCoverVersion) {
            lastCoverVersion = songJSON.art_url;

            document.getElementById('title').innerHTML = songJSON.title;
            document.getElementById('album').innerHTML = songJSON.album;
            document.getElementById('artist').innerHTML = songJSON.artist;
            document.getElementById('cover').src = `${musideckServer}/static/cover.png${cacheBust}`;
            document.querySelector('body').style.backgroundImage = `url("${musideckServer}/static/cover.png${cacheBust}")`;
        }

        if (songJSON.status == "Playing") {
            document.getElementById('media-state').src = "static/img/pause.svg";
        } else {
            document.getElementById('media-state').src = "static/img/play.svg";
        }

        document.getElementById('bar').style.width = `${(songJSON.position / songJSON.duration) * 100}%`;
    } catch (error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            console.error("Failed to connect to server: ", error.message);
            document.body.innerHTML = `<div class="root"><h1>Musideck lost server connection!</h1><p>${error.message}</p><button onclick="reconnect()">Reconnect</button></div>`;
        }
    } finally {
        setTimeout(main, 1000);
    }
}

main();
