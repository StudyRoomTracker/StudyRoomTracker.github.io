import { initializeApp} from "https://www.gstatic.com/firebasejs/9.9.1/firebase-app.js";
//import { collection, doc, setDoc, getDocs, getDoc, onSnapshot, getFirestore,  QuerySnapshot } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js"; 
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/9.9.1/firebase-auth.js'
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
}

loginButton.onclick = function (e) {
  console.log(null != auth.currentUser.email);
  if (null == auth.currentUser.email){

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
  }

  if (null != auth.currentUser){
    signInMessage.innerHTML = "Signed in as " + auth.currentUser.email;
    mainLoginButton.innerHTML = auth.currentUser.email;
    loginButton.innerHTML = "Change Accounts"
  }
}
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    const uid = user.uid;
    onLoadLogin();
  } else {
    // User is signed out
    // ...
  }
});

function onLoadLogin(){
  //await auth;
  console.log(auth.currentUser);
  if (null != auth.currentUser){
    signInMessage.innerHTML = "Signed in as " + auth.currentUser.email;
    mainLoginButton.innerHTML = auth.currentUser.email;
    loginButton.innerHTML = "Change Accounts"
  }
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
