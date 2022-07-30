import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { collection, doc, setDoc, getDocs, getDoc, onSnapshot, getFirestore,  QuerySnapshot } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js"; 
// Follow this pattern to import other Firebase services
// import { } from 'firebase/<service>';

class Room {
  contructor(_db, _ID, _floor){
    this.ID = _ID;
    this.floor = _floor;
    this.DB = _db
    this.data;
    const check = onSnapshot(doc(_db, _floor, _ID), (doc) => {this.data = doc.data(); reload();});
    //console.log(this.data);
  }

  printToConsole(){
    console.log(this.data);
  }

  async update(){
    var temp = await getDoc(doc(this.DB, this.floor, this.ID));
    this.data = temp.data();
    //console.log(this.data);
  }

  async occupy(){
    if (this.data["occupied"] == false){
      this.data["occupied"] = true;
      await setDoc(doc(this.DB, this.floor, this.ID), this.data); 
    }
  }

  async unoccupy(){
    //console.log(this.data["occupied"]);
    if (this.data["occupied"] == true){
      this.data["occupied"] = false;
      await setDoc(doc(this.DB, this.floor, this.ID), this.data); 
    }
  }
}

// TODO: Replace the following with your app's Firebase project configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBbW8o4MQxx1UEa8-datcBWlEqlrBb9-gA",
  authDomain: "studyroomtracker.firebaseapp.com",
  databaseURL: "https://studyroomtracker-default-rtdb.firebaseio.com",
  projectId: "studyroomtracker",
  storageBucket: "studyroomtracker.appspot.com",
  messagingSenderId: "380986676354",
  appId: "1:380986676354:web:dd2bf38160c807d086109b",
  measurementId: "G-ST790R47GE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get a list of cities from your database
export async function getCities(db) {
  const citiesCol = collection(db, 'cities');
  const citySnapshot = await getDocs(citiesCol);
  const cityList = citySnapshot.docs.map(doc => doc.data());
  return cityList;
}

//create a list of room objects
export async function getFloor(db, floor) {
  var floorList = new Array();
  var result = await getDocs(collection(db,floor));
  var floor1Data = result.docs;
  floor1Data.forEach((DOC) => floorList.push(DOC.id));
  return floorList;
}

export async function idToRooms(floorList, db, floor){
  var list = new Array();
  for (var i = 0; i < floorList.length; ++i){
    let room = new Room;
    room.contructor(db, floorList[i], floor);
    onSnapshot(doc(db, floor, floorList[i]), (doc) => {room.data = doc.data();});
    await room.update();
    //room.update();
    //console.log(room.data);
    list.push(room);
  }

  return list;
}

export async function getRoomList(db, floorNumber){
  var floorStr = "";
  if (floorNumber == 1){
    floorStr = "floor1";
  } else if (floorNumber == 2){
    floorStr = "floor2";
  } else if (floorNumber == 3){
    floorStr = "floor3";
  } else if (floorNumber == 4){
    floorStr = "floor4";
  }
  var floor = await getFloor(db, floorStr);
  floor = await idToRooms(floor, db, floorStr);
  return floor;
}

//floor1 = await getRoomList(db, 3);
var floor1;

/*
var canvas = document.getElementById("mycanvas");
const ctx = canvas.getContext('2d');
*/

var infoDisplay = document.getElementById("info");

var button = document.getElementById("button");

var selectedRoom = null;

var modal = document.getElementById("id01");

var loginButton = document.getElementById("submitLogin.loginbtn");


/*
var myImage = new Image(692, 414);
myImage.src = "wireless_folsom3.png" ;
ctx.drawImage(myImage,0,0);

reload();

function reload(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(myImage,0,0);

  for (var i = 0; i < floor1.length; i++){
    ctx.beginPath();
    ctx.lineWidth = "4";
    if (floor1[i].data.occupied){
      ctx.strokeStyle = "rgba(255,0,0,.5)";
    } else {
      ctx.strokeStyle = "rgba(0,255,0,.5)";
    }
    ctx.rect(floor1[i].data.topLeft[0], floor1[i].data.topLeft[1], floor1[i].data.bottomRight[0] - floor1[i].data.topLeft[0], floor1[i].data.bottomRight[1] - floor1[i].data.topLeft[1]);
    ctx.stroke();
  }

  if (selectedRoom != null){
    drawSelectedRoom();
  }
}
*/

var mouse = {
        down: false,
        button: 1,
        x: 0,
        y: 0,
        px: 0,
        py: 0
    };

/*
canvas.onmousedown = function (e) {
    mouse.button = e.which;
    mouse.px = mouse.x;
    mouse.py = mouse.y;
    var rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left,
    mouse.y = e.clientY - rect.top,
    mouse.down = true;
    e.preventDefault();
    reload();
    selectedRoom = null;
    infoDisplay.innerHTML = "Room Number: <br> Status: <br>";
    button.style.visibility = "hidden";
};

function drawSelectedRoom(){
  ctx.beginPath();
  ctx.lineWidth = "2";
  ctx.strokeStyle = "rgba(0,0,0,1)";

  if (selectedRoom.data.occupied){
    ctx.fillStyle = "rgba(255,0,0,.25)";
  } else {
    ctx.fillStyle = "rgba(0,255,0,.25)";
  }

  ctx.fillRect(selectedRoom.data.topLeft[0], selectedRoom.data.topLeft[1], selectedRoom.data.bottomRight[0] - selectedRoom.data.topLeft[0], selectedRoom.data.bottomRight[1] - selectedRoom.data.topLeft[1]);
  ctx.stroke();

  ctx.beginPath();
  ctx.lineWidth = "3";
  ctx.strokeStyle = "rgba(0,0,255,1)";
  ctx.arc((selectedRoom.data.topLeft[0] + selectedRoom.data.bottomRight[0]) / 2, (selectedRoom.data.topLeft[1] + selectedRoom.data.bottomRight[1]) / 2, 26, 0, 2 * Math.PI);
  ctx.stroke();

  var status = "Occupied";
  if (!selectedRoom.occupied){
    status = "Unoccupied";
  }

  var canUse = "";
  if (selectedRoom.available){
    canUse = "Room is closed";
  }

  infoDisplay.innerHTML = "Room Number: " + selectedRoom.ID + "<br>" + "Status: " + status + "<br>" + canUse;

  
  if (selectedRoom.data.occupied){
    button.style.background = "rgb(255,0,0)";
    button.innerHTML = "Unoccupy";
  } else {
    button.style.background = "rgb(0,255,0)";
    button.innerHTML = "Occupy";
  }

  button.style.visibility = "visible";
}

canvas.onmouseup = function (e) {
    mouse.down = false;
    e.preventDefault();

    var rect = canvas.getBoundingClientRect();

    var changed = false;

    for (var i = 0; i < floor1.length; i++){
      //console.log(mouse.x , mouse.y);
      var x = floor1[i].data.topLeft[0] / canvas.width * canvas.scrollWidth;
      var y = floor1[i].data.topLeft[1] / canvas.height * canvas.scrollHeight;

      var dx = floor1[i].data.bottomRight[0] / canvas.width * canvas.scrollWidth;
      var dy = floor1[i].data.bottomRight[1] / canvas.height * canvas.scrollHeight;

      //console.log(x,y, dx, dy);
      if (mouse.x > x && mouse.y > y && mouse.x < dx && mouse.y < dy){
        selectedRoom = floor1[i];
        changed = true;
      }
    }

    if (!changed){
      selectedRoom = null;
      infoDisplay.innerHTML = "Room Number: <br> Status: <br>";
      reload();
    } else {
      reload();
      drawSelectedRoom();
    }
    //console.log("selected room:", selectedRoom);
};

button.onclick = function () {
  if (selectedRoom.data.occupied){
    selectedRoom.unoccupy();
    button.style.background = "rgb(0,255,0)";
    button.innerHTML = "Occupy";
  } else {
    selectedRoom.occupy();
    button.style.background = "rgb(255,0,0)";
    button.innerHTML = "Unoccupy";
  }
  reload();
}
*/


// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

loginButton.onclick = function () {
  alert("test!");

}

/*
  //read input from email box
  var email = document.getElementById("retrieveLogin").elements[0].value;
  //read input from password box
  var psw = document.getElementById("retrieveLogin").elements[1].value;

  if(email.match([^@]+@[^@]+\.[^@]+)) {
    //valid email
    getAuth().getUserByEmail(email)
    .then((userRecord) => {
    // See the UserRecord reference doc for the contents of userRecord.
      alert("Successfully fetched user data");
    })
    .catch((error) => {
      alert("Error fetching user data");
    });
    alert("Not implemented!");
  } else {
    alert("This is not a valid email address.\nPlease enter a valid email and try again.");
  }
*/
