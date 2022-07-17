var canvas = document.getElementById("mycanvas");
const ctx = canvas.getContext('2d');

var infoDisplay = document.getElementById("info");

var button = document.getElementById("button");

var selectedRoom = null;

var myImage = new Image(684, 393);
myImage.src = "wireless_folsom2.png" ;
ctx.drawImage(myImage,0,0);