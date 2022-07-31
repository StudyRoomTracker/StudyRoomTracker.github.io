import { initializeApp} from "https://www.gstatic.com/firebasejs/9.9.1/firebase-app.js";
//import { collection, doc, setDoc, getDocs, getDoc, onSnapshot, getFirestore,  QuerySnapshot } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js"; 
import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.9.1/firebase-auth.js'
//import { getAuth } from 'https://www.gstatic.com/firebasejs/9.9.1/firebase-auth.js'


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
//const db = getFirestore(app);


var selectedRoom = null;

var modal = document.getElementById("id01");

var loginButton = document.getElementById("submitLogin");

var emailInput = document.getElementById("einput");
var passwordInput = document.getElementById("pinput");

const auth = getAuth(app);

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

loginButton.onclick = function (e) {
  console.log(emailInput.value);
  console.log(passwordInput.value);
  createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value).then((result) => {
      const user = result.user;
      console.log(user.email, user.displayName);
      navigate("/");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
    });
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
