import { initializeApp} from "https://www.gstatic.com/firebasejs/9.9.1/firebase-app.js";
import { collection, doc, setDoc, getDocs, getDoc, onSnapshot, getFirestore,  QuerySnapshot } from "https://www.gstatic.com/firebasejs/9.9.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/9.9.1/firebase-auth.js'


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
    admin: false,
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
}

//does the work of signing in or creating an account
loginButton.onclick = function (e) {
  //console.log(null != auth.currentUser.email);
  console.log("called");
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
    loginButton.innerHTML = "Change Accounts"
  }
}

//changes the login appearance if the user is already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    const uid = user.uid;
    onLoadLogin();

      //FIRESTORE integration (user data)
      //confirm that getDoc for user works
      //if somehow not there, add entry for this user
      //(also will help with accounts made before this was implemented)
      // WORKS

    getDoc(doc(db, "users", auth.currentUser.email)).then(docSnap => {
      if (docSnap.exists()) {
        console.log("Document already exists!");
      } else {
        console.log("No such document!");
        setUserDoc(auth.currentUser.email);
        console.log("Such document now exists!");
      }
    })

    sessionStorage.setItem("email", auth.currentUser.email);

  }
});

//loads the correct format if the user is signed in
function onLoadLogin(){
  //await auth;
  console.log(auth.currentUser);
  if (null != auth.currentUser){
    signInMessage.innerHTML = "Signed in as " + auth.currentUser.email;
    mainLoginButton.innerHTML = auth.currentUser.email;
    loginButton.innerHTML = "Change Accounts"
  }
}
