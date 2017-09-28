
function initializeWebapplication() {
    var canvas = document.getElementById('layer1');
    var context = canvas.getContext('2d');
    var width = canvas.scrollWidth;
    var height = canvas.scrollHeight;


    context.fillStyle = "#ffffff";
    context.strokeStyle = "#ffffff";
    context.fillRect(0,0,width,height);
}




$(document).ready(initializeWebapplication);