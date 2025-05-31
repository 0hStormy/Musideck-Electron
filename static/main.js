let musideckServer = "http://127.0.0.1:5000/"
let noConnection = false

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
    console.log(document.getElementById('ipBox').value)
    if (document.getElementById('ipBox').value != null) {
        musideckServer = `http://${document.getElementById('ipBox').value}:5000`
    }
    try {
        const response = await fetch(musideckServer);

        if (response.ok) {
            noConnection = false
            location.reload()
        }
    } catch (error) {
        console.error("Failed to connect to server: ", error.message);
        document.body.innerHTML = serverErrorHTML;
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
        const serverErrorHTML = `
        <div class="root">
            <div class="titlebar"></div>
            <h1>No Server Connection</h1>
            <p>${error.message}</p>
            <div class="hori">
                <p>IP (no http:// or port)</p>
                <input id="ipBox"></input>
            </div>
            <p>Current IP: ${musideckServer}<p>
            <button onclick="reconnect()">Reconnect</button>
        </div>
        `;
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            if (noConnection == false) {
                noConnection = true
                console.error("Failed to connect to server: ", error.message);
                document.body.innerHTML = serverErrorHTML;
            }
        }
    } finally {
        setTimeout(main, 1000);
    }
}

main();
