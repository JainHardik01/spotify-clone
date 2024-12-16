console.log("We start the Java Scrpit")

let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinuteseconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }

    const minutes = Math.floor(seconds / 60)
    const remainingseconds = Math.floor(seconds % 60)

    const formattedminutes = String(minutes).padStart(2, "0")
    const formattedSeconds = String(remainingseconds).padStart(2, "0")

    return `${formattedminutes}:${formattedSeconds}`;
}

async function getSongs(folder) {

    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();

    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])

        }
    }

    //Show all songs in the palylist

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        let decodedSongString = decodeURIComponent(song);
        songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div> ${decodedSongString.replaceAll("%20", " ")}</div>
                                <div> Hardik </div>
                            </div>
                            <div class="palynow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div> </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {

            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })

    })
    return songs

}


const playMusic = (track, pause = false) => {

    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track)
    document.querySelector(".songtime").innerHTML = " 00:00 / 00:00"


}


async function displayAlbum() {
    let a = await fetch(`/song/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/song/") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]


            //Get the metadata of the folder
            let a = await fetch(`/song/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play">
                <img src="img/paly.svg" alt="">
            </div>
            <img src="/song/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.descrpiton}</p>
        </div>`
        }
    }

    //Load the playlist whenever card is clicked

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`song/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}

async function main() {
    await getSongs(`song/ncs`)
    playMusic(songs[0], true)

    //Display all the albums on the page
      displayAlbum()

    // Atttach an event play, next and pause 

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    //Listen update

    currentSong.addEventListener("timeupdate", () => {

        document.querySelector(".songtime").innerHTML = `${secondsToMinuteseconds(currentSong.currentTime)}/${secondsToMinuteseconds(currentSong.duration)}`
        let a = document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration)*100 + "%";

        //end of song change img
        if (currentSong.currentTime == currentSong.duration) {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    //Add event listner to seekbar  

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100

    })

    //Add event Listner of hambuger

    document.querySelector(".hambuger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //Add event Listner of cross

    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-150%"
    })

    //Add an event Listner previous 

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })


    //Add an event Listner next 

    next.addEventListener("click", () => {
        console.log("next click")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    //Add an event to volume

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting Volume", e.target.value, "/100")
        currentSong.volume = parseInt(e.target.value) / 100

        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })



    //Add event listner to mute the track

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else {

            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10

        }

    })

}



main()
