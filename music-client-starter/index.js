let PlayerStatusState = 0;
let repeatOnce = false;

window.onload = function () {
  document.getElementById("logoutbutton").onclick = logout;
  document.getElementById("searchMusicButton").onclick = searchSong;
  document.getElementById("lol").style.display = "none";
  if (sessionStorage.getItem("username") === null) {
    notLoggedIn();
  } else {
    loggedIn();
  }
};

function loggedIn() {
  searchSong();
  fetchPlayList();
}

function notLoggedIn() {
  location.href = "login.html";
}

function logout() {
  sessionStorage.removeItem("username");
  sessionStorage.removeItem("accesstoken");
  notLoggedIn();
}

function fetchAllSongs() {
  fetch("http://localhost:3000/api/music", {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("accesstoken")}`,
    },
  })
    .then((response) => response.json())
    .then((songs) => console.log(songs));
}

function searchSong() {
  const search = document.getElementById("MusicToSearch").value;
  fetch(`http://localhost:3000/api/music?search=${search}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("accesstoken")}`,
    },
  })
    .then((response) => response.json())
    .then((songs) => {
      console.log(songs);
      document.getElementById("lol").style.display = "inline";
      createSongsList(songs);
    });
}

function createSongsList(songs) {
  let tbody = document.getElementById("tbodyAll");
  tbody.innerHTML = "";

  for (let i = 0; i < songs.length; i++) {
    let element = `<tr>
<th scope="row">${i + 1}</th>
<td>${songs[i].title}</td>
<td>${songs[i].releaseDate}</td>
<td>

<i data-music="${
      songs[i].id
    }" onclick="addToPlaylist(this)" style="color: red; margin-left:10%;" ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z"/></svg></i>

</td>
</tr>`;
    tbody.innerHTML += element;
  }
}

function fetchPlayList() {
  fetch(`http://localhost:3000/api/playlist`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("accesstoken")}`,
    },
  })
    .then((response) => response.json())
    .then((songs) => createPlaylist(songs));
}

function createPlaylist(songs) {
  let tbody = document.getElementById("tbodyPlaylist");
  tbody.innerHTML = "";
  for (let elem of songs) {
    // songsArr.push(songs[i].urlPath);

    // sessionStorage.setItem(`song${i}`, songs[i].title)
    // console.log(sessionStorage.getItem("song1"))
    let element = `<tr>
  <th scope="row">${elem.orderId}</th>
  <td>${elem.title}</td>
  <td><i data-music="${elem.songId}" onclick="removeItem(this)" style="color: red; margin-left:10%;">
  <svg  width="24" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12.002 2.005c5.518 0 9.998 4.48 9.998 9.997 0 5.518-4.48 9.998-9.998 9.998-5.517 0-9.997-4.48-9.997-9.998 0-5.517 4.48-9.997 9.997-9.997zm4.253 9.25h-8.5c-.414 0-.75.336-.75.75s.336.75.75.75h8.5c.414 0 .75-.336.75-.75s-.336-.75-.75-.75z" fill-rule="nonzero"/></svg>
  </i>
  <i data-play="${elem.orderId}" onclick="findSongToPlay(${elem.orderId})" id="playForTheFirstTime" style="color: black; margin-left:10%;" class="fa fa-play"></i>
  </td>
</tr>`;
    tbody.innerHTML += element;
  }
}

function addToPlaylist(obj) {
  //console.log("my obj ",obj);
  let songId = obj.getAttribute("data-music");
  fetch(`http://localhost:3000/api/playlist/add`, {
    method: "POST",
    body: JSON.stringify({
      songId,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("accesstoken")}`,
    },
  });
  fetchPlayList();
}

function removeItem(obj) {
  console.log("my obj ", obj);
  let songId = obj.getAttribute("data-music");
  fetch(`http://localhost:3000/api/playlist/remove`, {
    method: "POST",
    body: JSON.stringify({
      songId,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("accesstoken")}`,
    },
  });
  fetchPlayList();
}

function play(title, path, order) {
  document.getElementById("paragraph").innerHTML = order + ". " + title;
  let form = document.getElementById("audioForm");
  form.innerHTML = `<button onclick="findSongToPlay(${order - 1})" 
  style="border-style: none"> <img src="./Images/back.png" width="30px" alt="" /></button>
   <audio controls autoplay onended="findSongToPlay(${
     order + 1
   })" class="right-width">
   <source src="http://localhost:3000/${path}" type="audio/mpeg">
</audio> 
<button onclick="findSongToPlay(${
    order + 1
  })"  style="border-style: none">   <img src="./Images/next.png" width="30px" alt="" /></button> 
<button onclick="shuffleOrRepeat(${order})""  style="border-style: none"> <img id="repeatshuffleImage"  src="./Images/off.png" width="30px" alt="" /></button>

`;
}

function shuffleOrRepeat(order) {
  PlayerStatusState++;
  if (PlayerStatusState == 3) PlayerStatusState = 0;
  findSongToPlay(order);
}

function findSongToPlay(order) {
  //console.log("is is ",order)
  //let order= obj.getAttribute("data-play")
  fetch(`http://localhost:3000/api/playlist`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("accesstoken")}`,
    },
  })
    .then((response) => response.json())
    .then((songs) => {
      if (order <= 0) {
        order = songs.length;
      }
      if (order > songs.length) {
        order = 1;
      }
      let songToPlay = songs.filter((elem) => {
        //console.log(elem.orderId+ " vs "+ order);
        return elem.orderId == order;
      });
      //console.log("Song to play ",songToPlay)

      if (PlayerStatusState == 1) {
        console.log("case 1: repeat once", songToPlay[0].title);
        repeatOne(
          songToPlay[0].title,
          songToPlay[0].urlPath,
          songToPlay[0].orderId
        );

        document.getElementById("repeatshuffleImage").src =
          "./Images/repeat.png";
      } else if (PlayerStatusState == 2) {
        console.log("case 2: shuffle", songToPlay[0].title);
        shuffle(
          songToPlay[0].title,
          songToPlay[0].urlPath,
          songToPlay[0].orderId,
          songs.length
        );
        document.getElementById("repeatshuffleImage").src =
          "./Images/shuffle.png";
      } else {
        console.log("case else 0", songToPlay[0].orderId);
        PlayerStatusState = 0;
        repeatAll(
          songToPlay[0].title,
          songToPlay[0].urlPath,
          songToPlay[0].orderId
        );
      }
    });
}

function repeatOne(title, path, order) {
  repeatOnce = true;
  document.getElementById("paragraph").innerHTML = order + ". " + title;
  let form = document.getElementById("audioForm");
  form.innerHTML = `<button onclick="findSongToPlay(${order})" 
  style="border-style: none"> <img src="./Images/back.png" width="30px" alt="" /></button>
   <audio onended="play('${title}','${path}',${order})" controls autoplay class="right-width">

   <source src="http://localhost:3000/${path}" type="audio/mpeg">
</audio> 
<button onclick="findSongToPlay(${order})"  style="border-style: none">   <img  src="./Images/next.png" width="30px" alt="" /></button> 
<button onclick="shuffleOrRepeat(${order})"  style="border-style: none"> <img id="repeatshuffleImage"   src="./Images/off.png" width="30px" alt="" /></button>

`;
}

function repeatAll(title, path, order, length) {
  document.getElementById("paragraph").innerHTML = order + ". " + title;
  let form = document.getElementById("audioForm");
  form.innerHTML = `<button onclick="findSongToPlay(${order - 1})" 
  style="border-style: none"> <img src="./Images/back.png" width="30px" alt="" /></button>
   <audio onended="findSongToPlay(${
     order + 1
   })" controls autoplay class="right-width">
   <source src="http://localhost:3000/${path}" type="audio/mpeg">
</audio>
<button onclick="findSongToPlay(${
    order + 1
  })"  style="border-style: none">   <img src="./Images/next.png" width="30px" alt="" /></button>
<button onclick="shuffleOrRepeat(${order})"  style="border-style: none"> <img id="repeatshuffleImage"  src="./Images/off.png" width="30px" alt="" /></button>

`;
}

function shuffle(title, path, order, length) {
  let nextID = Math.floor(Math.random() * (length + 1) - 1);
  document.getElementById("paragraph").innerHTML = order + ". " + title;
  let form = document.getElementById("audioForm");
  form.innerHTML = `<button onclick="findSongToPlay(${order - 1})" 
  style="border-style: none"> <img src="./Images/back.png" width="30px" alt="" /></button>
   <audio onended="findSongToPlay(${nextID})" controls autoplay class="right-width">
   <source src="http://localhost:3000/${path}" type="audio/mpeg">
</audio>
<button onclick="findSongToPlay(${nextID})"  style="border-style: none">   <img  src="./Images/next.png" width="30px" alt="" /></button>
<button onclick="shuffleOrRepeat(${order})""  style="border-style: none"> <img id="repeatshuffleImage"  src="./Images/off.png" width="30px" alt="" /></button>

`;
}
