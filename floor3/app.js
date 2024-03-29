import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { collection, doc, setDoc, getDocs, getDoc, onSnapshot, getFirestore,  QuerySnapshot } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
// Follow this pattern to import other Firebase services
// import { } from 'firebase/<service>';

class Room {
  contructor( _db, _ID, _floor ){
    this.ID = _ID;
    this.floor = _floor;
    this.DB = _db;
    this.data;
    const check = onSnapshot( doc( _db, _floor, _ID ), ( doc ) => {this.data = doc.data(); reload();} );
    //console.log( this.data );
  }

  printToConsole(){
    console.log( this.data );
  }
  //update the room status
  async update(){
    var temp = await getDoc( doc( this.DB, this.floor, this.ID ) );
    this.data = temp.data();
    //console.log( this.data );
  }
  //display if the room is occupied
  async occupy(){
    if ( this.data["occupied"] == false ){
      this.data["occupied"] = true;
      this.data["user"] = sessionStorage.getItem( "email" );
      await setDoc( doc( this.DB, this.floor, this.ID ), this.data );
      setUserRoom( this.ID );
      sessionStorage.setItem( "myRoom", this.ID );
    }
  }
  //display if the the room is unoccupied
  async unoccupy( timeout ){
    //console.log( this.data["occupied"] );
    if ( this.data["occupied"] == true ){
      if( sessionStorage.getItem( "isAdmin" ) === "true" || timeout ) {
        const unreserve = {
          room: "none"
        };
        await setDoc( doc( db, "users", this.data["user"] ), unreserve, { merge: true } );
      }
      this.data["time"]["seconds"] = Math.round( Date.now() / 1000 );
      this.data["time"]["nanoseconds"] = Date.now() % 1000;
      this.data["occupied"] = false;
      this.data["user"] = "none";
      await setDoc( doc( this.DB, this.floor, this.ID ), this.data );
      setUserRoom( "none" );
      sessionStorage.setItem( "myRoom", "none" );
    }
  }
}

async function setUserRoom( newLoc ) {
  const docData = {
    admin: sessionStorage.getItem( "isAdmin" ),
    room: newLoc
  };
  await setDoc( doc( db, "users", sessionStorage.getItem( "email" ) ), docData );
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

const app = initializeApp( firebaseConfig );
const db = getFirestore( app );

var floor1 = [], floor2 = [], floor3 = [], floor4 = [];

const unsub = onSnapshot( doc( db, "cities", "SF" ), ( doc ) => {
    console.log( "Current data: ", doc.data() );
} );

//create a list of room objects
async function getFloor( db, floor ) {
  var floorList = new Array();
  var result = await getDocs( collection( db,floor ) );
  var floor1Data = result.docs;
  floor1Data.forEach( ( DOC ) => floorList.push( DOC.id ) );
  return floorList;
}
//assign ID to the rooms
async function idToRooms( floorList, db, floor ){
  var list = new Array();
  for ( var i = 0; i < floorList.length; ++i ){
    let room = new Room;
    room.contructor( db, floorList[i], floor );
    //await room.update();
    list.push( room );
  }

  return list;
}
//select floor
async function getRoomList( db, floorNumber ){
  var floorStr = "";
  if ( floorNumber == 1 ){
    floorStr = "floor1";
  } else if ( floorNumber == 2 ){
    floorStr = "floor2";
  } else if ( floorNumber == 3 ){
    floorStr = "floor3";
  } else if ( floorNumber == 4 ){
    floorStr = "floor4";
  }
  var floor = await getFloor( db, floorStr );
  floor = await idToRooms( floor, db, floorStr );
  return floor;
}

var canvas = document.getElementById( "mycanvas" );
const ctx = canvas.getContext( '2d' );

var infoDisplay = document.getElementById( "info" );

var button = document.getElementById( "button" );

var selectedRoom = null;


var myImage = new Image( 692, 414 );
myImage.src = "wireless_folsom3.png" ;
ctx.drawImage( myImage,0,0 );

floor1 = await getRoomList( db, 3 );

//refresh the floor page
function reload(){
  ctx.clearRect( 0, 0, canvas.width, canvas.height );
  ctx.drawImage( myImage,0,0 );

  for ( var i = 0; i < floor1.length; i++ ){
    if ( Math.round( Date.now() / 1000 ) - floor1[i].data["time"]["seconds"] >= 7200 ){
      floor1[i].unoccupy( true );
    }
    ctx.beginPath();
    ctx.lineWidth = "4";
    if ( floor1[i].data.occupied || !floor1[i].data.available ){
      ctx.strokeStyle = "rgba( 255,0,0,.5 )";
    } else {
      ctx.strokeStyle = "rgba( 0,255,0,.5 )";
    }
    ctx.rect( floor1[i].data.topLeft[0], floor1[i].data.topLeft[1], floor1[i].data.bottomRight[0] - floor1[i].data.topLeft[0], floor1[i].data.bottomRight[1] - floor1[i].data.topLeft[1] );
    ctx.stroke();
  }

  if ( selectedRoom != null ){
    drawSelectedRoom();
  } else {
    button.style.visibility = "hidden";
  }
}

var mouse = {
        down: false,
        button: 1,
        x: 0,
        y: 0,
        px: 0,
        py: 0
    };

//display info about the room
canvas.onmousedown = function ( e ) {
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
//display the status of a room
function drawSelectedRoom(){
  ctx.beginPath();
  ctx.lineWidth = "2";
  ctx.strokeStyle = "rgba( 0,0,0,1 )";

  if ( selectedRoom.data.occupied ){
    ctx.fillStyle = "rgba( 255,0,0,.25 )";
  } else {
    ctx.fillStyle = "rgba( 0,255,0,.25 )";
  }

  if ( !selectedRoom.data.available ){
    ctx.fillStyle = "rgba( 255,0,0,.25 )";
  }

  ctx.fillRect( selectedRoom.data.topLeft[0], selectedRoom.data.topLeft[1], selectedRoom.data.bottomRight[0] - selectedRoom.data.topLeft[0], selectedRoom.data.bottomRight[1] - selectedRoom.data.topLeft[1] );
  ctx.stroke();

  ctx.beginPath();
  ctx.lineWidth = "3";
  ctx.strokeStyle = "rgba( 0,0,255,1 )";
  ctx.arc( ( selectedRoom.data.topLeft[0] + selectedRoom.data.bottomRight[0] ) / 2, ( selectedRoom.data.topLeft[1] + selectedRoom.data.bottomRight[1] ) / 2, 26, 0, 2 * Math.PI );
  ctx.stroke();

  var status = "Occupied";
  if ( !selectedRoom.data.occupied ){
    status = "Unoccupied";
  }

  var canUse = " ";
  if ( !selectedRoom.data.available ){
    canUse = "Room is closed";
  }
  infoDisplay.innerHTML = "Room Number: " + selectedRoom.ID + "<br>" + "Status: " + status + "<br>" + canUse;

  if ( !( selectedRoom.data.available ) ){
    button.style.visibility = "hidden";
  } else {
    if ( selectedRoom.data.occupied ){
      button.style.background = "rgb( 255,0,0 )";
      button.innerHTML = "Unoccupy";
      if( sessionStorage.getItem( "isAdmin" ) === "true" || sessionStorage.getItem( "myRoom" ) === selectedRoom.data.ID ) {
        button.style.visibility = "visible";
      } else {
        button.style.visibility = "hidden";
      }
    } else {
      button.style.background = "rgb( 0,255,0 )";
      button.innerHTML = "Occupy";
      if( sessionStorage.getItem( "isAdmin" ) === "true" || sessionStorage.getItem( "myRoom" ) == "none" ) {
        button.style.visibility = "visible";
      } else {
        button.style.visibility = "hidden";
      }
    }
  }
}

//the mouse selects the room
canvas.onmouseup = function ( e ) {
    mouse.down = false;
    e.preventDefault();

    var rect = canvas.getBoundingClientRect();

    var changed = false;

    for ( var i = 0; i < floor1.length; i++ ){
      //console.log( mouse.x , mouse.y );
      var x = floor1[i].data.topLeft[0] / canvas.width * canvas.scrollWidth;
      var y = floor1[i].data.topLeft[1] / canvas.height * canvas.scrollHeight;

      var dx = floor1[i].data.bottomRight[0] / canvas.width * canvas.scrollWidth;
      var dy = floor1[i].data.bottomRight[1] / canvas.height * canvas.scrollHeight;

      //console.log( x,y, dx, dy );
      if ( mouse.x > x && mouse.y > y && mouse.x < dx && mouse.y < dy ){
        selectedRoom = floor1[i];
        changed = true;
      }
    }

    if ( !changed ){
      selectedRoom = null;
      infoDisplay.innerHTML = "Room Number: <br> Status: <br>";
      reload();
    } else {
      reload();
      drawSelectedRoom();
    }
    //console.log( "selected room:", selectedRoom );
};

//click on the button to occupy or unoccupy room
button.onclick = function () {
  console.log( "button clicked" );
  if ( selectedRoom.data.occupied ){
    selectedRoom.unoccupy( false );
    button.style.background = "rgb( 0,255,0 )";
    button.innerHTML = "Occupy";
  } else {
    selectedRoom.occupy();
    button.style.background = "rgb( 255,0,0 )";
    button.innerHTML = "Unoccupy";
  }
  reload();
}

var intervalID = window.setInterval( myCallback, 10 );

function myCallback() {
  reload();
}
