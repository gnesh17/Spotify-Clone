console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;
const singers = ["Ed Sheeran", "Adele", "Justin Bieber", "Taylor Swift", "Shawn Mendes", "Billie Eilish", "Bruno Mars", "Charlie Puth", "The Weeknd", "Dua Lipa"];


function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
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
            // songs.push(element.href.split(`/${folder}/`)[1])

        }
    }



    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""


    // does not generate a random singer name

    // for (const song of songs) {
    //     songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" width="34" src="img/music.svg" alt="">
    //                         <div class="info">
    //                             <div> ${song.replaceAll("%20", " ")}</div>
    //                             <div>Gnesh</div>
    //                         </div>
    //                         <div class="playnow">
    //                             <span>Play Now</span>
    //                             <img class="invert" src="img/play.svg" alt="">
    //                         </div> </li>`;
    // }



    // generates a random singer name

    for (const song of songs) {
        let randomSinger = singers[Math.floor(Math.random() * singers.length)]; // Get a random singer name
    
        songUL.innerHTML += `<li><img class="invert" width="34" src="img/music.svg" alt="">
                                <div class="info">
                                    <div> ${song.replaceAll("%20", " ")}</div>
                                    <div class="singer">${randomSinger}</div>
                                </div>
                                <div class="playnow">
                                    <span>Play Now</span>
                                    <img class="invert" src="img/play.svg" alt="">
                                </div> 
                            </li>`;
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
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"


}

async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>

            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p class="card-description">${response.description}</p>
        </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])

        })
    })
}

async function main() {

    // Display all the albums on the page
    await displayAlbums()

    // Load first card automatically
    let firstCard = document.querySelector(".card");
    if (firstCard) {
        let firstFolder = firstCard.dataset.folder;
        songs = await getSongs(`songs/${firstFolder}`);
        playMusic(songs[0], true); // Load the first song but keep it paused
    }


    // Attach an event listener to play, next and previous
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

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })


    previous.addEventListener("click", () => {
        currentSong.pause();
        console.log("Previous clicked");
    
        let index = songs.indexOf(currentSong.src.split("/").pop());
    
        // If there's a previous song in the same playlist
        if (index > 0) {
            playMusic(songs[index - 1]);
        } 
        // else {
        //     // If at the first song of the current playlist
        //     let cards = Array.from(document.getElementsByClassName("card"));
        //     let currentCardIndex = cards.findIndex(card => card.dataset.folder === currFolder.split("/").pop());
    
        //     if (currentCardIndex > 0) {
        //         // Play last song of the previous folder
        //         let prevFolder = cards[currentCardIndex - 1].dataset.folder;
        //         getSongs(`songs/${prevFolder}`).then(() => {
        //             playMusic(songs[songs.length - 1]);
        //         });
        //     } else {
        //         // If at the first song of the first folder, loop to the last song of the last folder
        //         let lastFolder = cards[cards.length - 1].dataset.folder;
        //         getSongs(`songs/${lastFolder}`).then(() => {
        //             playMusic(songs[songs.length - 1]);
        //         });
        //     }
        // }
    });
    

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
        // else{
        //     let cards = Array.from(document.getElementsByClassName("card"));
        //     let currentCardIndex = cards.findIndex(card => card.dataset.folder === currFolder.split("/").pop());

        //     if (currentCardIndex + 1 < cards.length) {
        //         // Play first song of the next card
        //         let nextFolder = cards[currentCardIndex + 1].dataset.folder;
        //         getSongs(`songs/${nextFolder}`).then(() => {
        //             playMusic(songs[0]);
        //         });
        //     } else {
        //         // Loop back to the first card
        //         let firstFolder = cards[0].dataset.folder;
        //         getSongs(`songs/${firstFolder}`).then(() => {
        //             playMusic(songs[0]);
        //         });
        //     }
        // }
    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    let lastVolume = 1;

    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            // Save current volume before muting
            lastVolume = currentSong.volume;

            // Mute the song
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            // Restore the last volume before muting
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = lastVolume;
            document.querySelector(".range").getElementsByTagName("input")[0].value = lastVolume * 100;
        }
    });


    // event listner to play next song
    currentSong.addEventListener("ended", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

        if (index + 1 < songs.length) {
            // Play next song in the same card
            playMusic(songs[index + 1]);
        } else {
            // Move to the next card
            let cards = Array.from(document.getElementsByClassName("card"));
            let currentCardIndex = cards.findIndex(card => card.dataset.folder === currFolder.split("/").pop());

            if (currentCardIndex + 1 < cards.length) {
                // Play first song of the next card
                let nextFolder = cards[currentCardIndex + 1].dataset.folder;
                getSongs(`songs/${nextFolder}`).then(() => {
                    playMusic(songs[0]);
                });
            } else {
                // Loop back to the first card
                let firstFolder = cards[0].dataset.folder;
                getSongs(`songs/${firstFolder}`).then(() => {
                    playMusic(songs[0]);
                });
            }
        }
    });

}

main() 