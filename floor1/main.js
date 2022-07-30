import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { collection, doc, setDoc, getDocs, getDoc, onSnapshot, getFirestore,  QuerySnapshot } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js"; 
// Follow this pattern to import other Firebase services
// import { } from 'firebase/<service>';

export class Room {
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
    //console.log(this.data["time"]["seconds"]);
    //console.log(Math.round(Date.now() / 1000));
    if (this.data["occupied"] == false){
      this.data["time"]["seconds"] = Math.round(Date.now() / 1000);
      this.data["time"]["nanoseconds"] = Date.now() % 1000;
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
    //onSnapshot(doc(db, floor, floorList[i]), (doc) => {room.data = doc.data();});
    //await room.update();
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



