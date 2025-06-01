const uiThemes = ["modern", "wmp"]

const titlebarThemes = {
    "adwaita": "svg",
    "breeze": "svg",
    "win10": "png",
    "win7": "png",
}

let musideckServer = "http://127.0.0.1:5000/"
let noConnection = false

let uiStyle = localStorage.getItem("uiStyle");
let titlebarStyle = localStorage.getItem("titlebarStyle");
let titlebarFormat = localStorage.getItem("titlebarFormat");

if (!uiStyle) {
  uiStyle = "modern";
  localStorage.setItem("uiStyle", uiStyle);
}

if (!titlebarStyle) {
  titlebarStyle = "adwaita";
  localStorage.setItem("titlebarStyle", titlebarStyle);
}

if (!titlebarFormat) {
  titlebarStyle = "svg";
  localStorage.setItem("titlebarFormat", titlebarFormat);
}

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

function updateDecorationsTheme(newTheme, imageType) {
    decorationsTheme = newTheme
    document.getElementById('close-button').src = `static/titlebar/${decorationsTheme}/close.${imageType}`;
    document.getElementById('min-button').src = `static/titlebar/${decorationsTheme}/min.${imageType}`;
    document.getElementById('max-button').src = `static/titlebar/${decorationsTheme}/max.${imageType}`;
    addCss(`static/titlebar/${decorationsTheme}/titlebar.css`)
}

function addCss(fileName) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = fileName;
    document.head.appendChild(link);
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
            if (uiStyle == "modern") {
                document.querySelector('body').style.backgroundImage = `url("${musideckServer}/static/cover.png${cacheBust}")`;
            }
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
            <h1>No Server Connection</h1>
            <p>${error.message}</p>
            <div class="hori">
                <p>IP (no http:// or port)</p>
                <input id="ipBox"></input>
            </div>
            <p>Current IP: ${musideckServer}<p>
            <button onclick="reconnect()">Reconnect</button>
            <div class="titlebar"></div>
            <div class="decorations">
                <img id="min-button" src="static/titlebar/adwaita/min.svg" alt="">
                <img id="max-button" src="static/titlebar/adwaita/max.svg" alt="">
                <img id="close-button" class="close-button" src="static/titlebar/adwaita/close.svg" alt="">
            </div>
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

// Window management
document.getElementById('close-button').addEventListener('click', () => {
    window.api.sendWindowControl('close');
});

document.getElementById('max-button').addEventListener('click', () => {
    window.api.sendWindowControl('maximize');
});

document.getElementById('min-button').addEventListener('click', () => {
    window.api.sendWindowControl('minimize');
});

addCss(`static/themes/${uiStyle}.css`)
updateDecorationsTheme(titlebarStyle, titlebarFormat)
main();
