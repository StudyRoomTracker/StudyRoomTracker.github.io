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
    const check = onSnapshot(doc(_db, _floor, _ID), (doc) => {this.data = doc.data(); console.log(doc.data());});
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
const firebaseConfig = {
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

var floor1 = [], floor2 = [], floor3 = [], floor4 = [];

const unsub = onSnapshot(doc(db, "cities", "SF"), (doc) => {
    console.log("Current data: ", doc.data());
});

// await setDoc(doc(db, "cities", "LA"), {
//   name: "Los Angeles",
//   state: "CA",
//   country: "USA"
// });

// Get a list of cities from your database
async function getCities(db) {
  const citiesCol = collection(db, 'cities');
  const citySnapshot = await getDocs(citiesCol);
  const cityList = citySnapshot.docs.map(doc => doc.data());
  return cityList;
}

//create a list of room objects
async function getFloor(db, floor) {
  var floorList = new Array();
  var result = await getDocs(collection(db,floor));
  var floor1Data = result.docs;
  floor1Data.forEach((DOC) => floorList.push(DOC.id));
  return floorList;
}

async function idToRooms(floorList, db, floor){
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

async function getRoomList(db, floorNumber){
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

floor1 = await getRoomList(db, 1);

// //console.log(JSON.stringify(floor1));
// for (var i = 0; i < floor1.length; ++i){
//   console.log(floor1[i].data);
// }
// floor1[0].unoccupy();

var canvas = document.getElementById("mycanvas");
const ctx = canvas.getContext('2d')
var myImage = new Image(634, 424);
myImage.src = "wireless_folsom1.png" ;
ctx.drawImage(myImage,0,0);

for (var i = 0; i < floor1.length; i++){
  ctx.beginPath();
  ctx.lineWidth = "2";
  ctx.strokeStyle = "rgba(0,255,0,.5)";
  ctx.rect(floor1[i].data.topLeft[0], floor1[i].data.topLeft[1], floor1[i].data.bottomRight[0] - floor1[i].data.topLeft[0], floor1[i].data.bottomRight[1] - floor1[i].data.topLeft[1]);
  ctx.stroke();
}




