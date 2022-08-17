import { initializeApp} from "https://www.gstatic.com/firebasejs/9.9.1/firebase-app.js";
import { collection, doc, setDoc, getDocs, getDoc, deleteDoc, onSnapshot, getFirestore,  QuerySnapshot } from "https://www.gstatic.com/firebasejs/9.9.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/9.9.1/firebase-auth.js';


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

async function setUserDoc(email) {
  const docData = {
    admin: "false",
    room: "none"
  };
  await setDoc(doc(db, "users", email), docData);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

//get all of the html elements
var selectedRoom = null;

var modal = document.getElementById("id01");

var loginButton = document.getElementById("submitLogin");

var emailInput = document.getElementById("einput");
var passwordInput = document.getElementById("pinput");

var emailDescription = document.getElementById("emailDescription");
var passwordDescription = document.getElementById("passwordDescription");

var signInMessage = document.getElementById("signIn");

var mainLoginButton = document.getElementById("mainLogin");

const auth = getAuth(app);

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

//does the work of signing in or creating an account
loginButton.onclick = function (e) {
  //console.log(null != auth.currentUser.email);
  //console.log("called");
  emailDescription.innerHTML ="";
  passwordDescription.innerHTML ="";

  console.log(emailInput.value);
  console.log(passwordInput.value);
  if (emailInput.value.length == 0){
    emailDescription.innerHTML = "Invalid email";
  } else if (passwordInput.value.length == 0){
    passwordDescription.innerHTML = "Invalid Password";
  } else {
    signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("signed in", user.email, user.displayName);
      modal.style.display = "none";
      return;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log("can't sign in:", errorCode);
      if (errorCode === "auth/wrong-password"){
        passwordDescription.innerHTML = "Incorrect password for email";
      } else if (errorCode === "auth/invalid-email") {
        emailDescription.innerHTML = "email must be in the form __@__.__";
      } else if (errorCode === "auth/user-not-found"){
        createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value).then((result) => {
          const user = result.user;
          console.log("created account", user.email, user.displayName);
          navigate("/");
          modal.style.display = "none";
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log("can't create account:", errorCode);
          if (errorCode === "auth/weak-password"){
            passwordDescription.innerHTML = "Password must at least 6 characters long";
          }
        });
      }

    });
  }

  if (null != auth.currentUser){
    signInMessage.innerHTML = "Signed in as " + auth.currentUser.email;
    mainLoginButton.innerHTML = auth.currentUser.email;
    loginButton.innerHTML = "Change Accounts";
  }
};

//changes the login appearance if the user is already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    const uid = user.uid;

      //FIRESTORE integration (user data)
      //confirm that getDoc for user works
      //if somehow not there, add entry for this user
      //(also will help with accounts made before this was implemented)
      // WORKS

    getDoc(doc(db, "users", auth.currentUser.email)).then(docSnap => {
      if (docSnap.exists()) {
        console.log("Document already exists!");
        sessionStorage.setItem("myRoom",  docSnap.data()["room"]);
      } else {
        console.log("No such document!");
        setUserDoc(auth.currentUser.email);
        sessionStorage.setItem("myRoom", "none");
        console.log("Such document now exists!");
      }

      if(docSnap.data()["admin"] === "true" || docSnap.data()["admin"] == true) {
        sessionStorage.setItem("isAdmin", "true");
      } else {
        sessionStorage.setItem("isAdmin", "false");
      }
    });

    sessionStorage.setItem("email", auth.currentUser.email);
    console.log("This is the user's currently reserved room:");
    console.log(sessionStorage.getItem("myRoom"));

    onLoadLogin();
  }
});

//loads the correct format if the user is signed in
function onLoadLogin(){
  //await auth;
  console.log(auth.currentUser);
  if (null != auth.currentUser){
    signInMessage.innerHTML = "Signed in as " + auth.currentUser.email;
    mainLoginButton.innerHTML = auth.currentUser.email;
    loginButton.innerHTML = "Change Accounts";
  }
}

// Queue functions and variables

var joined = document.getElementById( 'join' );
var joinedQueue = document.getElementById( 'joinQueue' );
var joinedMessage = document.getElementById( 'joinAsk' );
var intervalID = window.setInterval( queueCallback, 10000 );

// number of users on the queue, -1 if the queue is disabled
var queueLen = 0;

// position of current user on the queue, -1 if not on queue
var queuePos = -1;

// true when all rooms occupied, false otherwise
var allOccupied = false;

// keeps queue stats up to date
async function queueCallback() {
  console.log( 'queue callback called' );
  var availableRoom = await updateOccupied();
  updateQueueStatus( availableRoom );
}

// adds or removes user from queue if signed in
joined.onclick = function ( e ) {
  console.log( 'join/leave called' );

  // user must be signed in to join queue
  if ( null != auth.currentUser ){
    joinOrLeave();
  } else {
    console.log( 'not signed in, cant join queue' );
  }
};

// removes or adds user to queue
async function joinOrLeave() {

  // update whether user on queue
  await updateOnQueue();

  // if user on queue, remove them
  if( queuePos >= 0 ) {
    removeUser();
  } else {

    // if user not on queue, add them
    await setDoc( doc( db, 'queue', auth.currentUser.email ),{
      position: queueLen
    } );
    queuePos = queueLen;
    queueLen++;
    joinedMessage.innerHTML = 'You are on the queue!\nYour position: ' + queueLen;

    // changes join queue to leave queue
    joinedQueue.innerHTML = 'Leave Queue';
    joined.innerHTML = 'Leave';
    console.log( 'joined queue' );
  }

  // closes pop up
  document.getElementById( 'queue' ).style.display='none';
}

// updates queue length and checks if user on queue
async function updateOnQueue() {
  var onQueue = 0;
  var enabled = false;
  const queueSnap = await getDocs( collection( db, 'queue' ) );
  queueSnap.docs.forEach( doc => {
    enabled = true;
    if( doc.id === auth.currentUser.email ) {
      console.log( 'user queued' );
      queuePos = onQueue;
    }
    onQueue++;
    console.log( 'queueLen++' );
  } );
  if( enabled ) {
    queueLen = onQueue;
  } else {
    queueLen = -1;
  }
}

// updates queue info
async function updateOnLoad() {
  console.log( 'updating...' );
  await updateOccupied();
  await updateQueueStatus( null );
  await updateOnQueue();
  if( queuePos >= 0 ) {
    console.log( 'updating button' );
    joinedMessage.innerHTML = 'You are on the queue!\nYour position: ' + queuePos;
    joinedQueue.innerHTML = 'Leave Queue';
    joined.innerHTML = 'Leave';
  }
}

// updates queue once window loads
window.addEventListener( 'load', ( event ) => {
  console.log( 'window.onload' );
  updateOnLoad();
} );

// checks whether all rooms are occupied, the last available room is returned, otherwise returns null
async function updateOccupied() {
  console.log( 'updating open rooms' );
  var floor1Results = await getDocs( collection( db,'floor1' ) );
  var floor3Results = await getDocs( collection( db,'floor3' ) );
  var floor4Results = await getDocs( collection( db,'floor4' ) );

  var floor1 = floor1Results.docs;
  var floor3 = floor3Results.docs;
  var floor4 = floor4Results.docs;

  var occupied = true;
  var open = null;
  floor1.forEach( ( room ) => {
    if( ! room.data().occupied && room.data().available ) {
      occupied = false;
      open = room.id;
    }
  } );
  floor3.forEach( ( room ) => {
    if( ! room.data().occupied && room.data().available ) {
      occupied = false;
      open = room.id;
    }
  } );
  floor4.forEach( ( room ) => {
    if( ! room.data().occupied && room.data().available ) {
      occupied = false;
      open = room.id;
    }
  } );

  allOccupied = occupied;
  return open;
}

// updates queue status depending on available rooms and number of people on queue
async function updateQueueStatus( availableRoom ) {
  console.log( 'updating queue status' );
  console.log( 'queuePos: ' + queuePos + '\nallOccupied: ' + allOccupied );

  // if user head of queue and not all rooms occupied, notify user
  if( queuePos === 0 && ! allOccupied ) {
    notifyHead( availableRoom );
  }

  // if no users are on the queue and there are free rooms, disable the queue
  if( queueLen === 0 && ! allOccupied ) {
    disableQueue();
  } else if( queueLen === -1 && allOccupied ) {

    // if queue not enabled and all rooms are occupied, enable the queue
    enableQueue();
  }
}

// shows the queue button so users may join
async function enableQueue() {
  console.log( 'enabling queue' );
  queueLen = 0;
  joinedQueue.style.display = 'inline';
}

// hides the queue button and removes any left over users from the queue
// (there should not be left over users but it prevents possible issues with the queue from arising)
async function disableQueue() {
  console.log( 'disabling queue' );
  joinedQueue.style.display = 'none';
  const queueSnap = await getDocs( collection( db, 'queue' ) );
  queueSnap.docs.forEach( ( DOC ) => {
    const docRef = doc( db, 'queue', DOC.id );
    deleteDoc( docRef );
  } );
  queueLen = -1;
  queuePos = -1;
}

// notifies head of queue that room is available
async function notifyHead( availableRoom ) {
  console.log( 'notifying head of open room' );
  window.alert( 'Room ' + availableRoom + ' is available for you to occupy' );
  removeUser();
}

// removes user from queue and decrements position of users behind them in queue
async function removeUser() {
  const queueSnap = await getDocs( collection( db, 'queue' ) );
  queueSnap.docs.forEach( DOC => {

      // remove user from the queue
      if( DOC.id === auth.currentUser.email ) {
        const docRef = doc( db, 'queue', auth.currentUser.email );
        deleteDoc( docRef );
        queueLen--;
        joinedMessage.innerHTML = 'Would you like to join the queue?';
        joinedQueue.innerHTML = 'Join Queue';
        joined.innerHTML = 'Yes';
        console.log( 'removed from queue' );
      } else if( DOC.data().position > queuePos ) {

        // decrement queue positions after removed user
        var currentPosition = DOC.data().position;
        setDoc( DOC, {position : currentPosition--} );
      }
    } );
    queuePos = -1;
}
