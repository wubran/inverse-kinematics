//	  			 i = 0,1,2,3
let testMatrix = [[1,0,0,0],//r 255
                [0,1,0,0],//g 255
                [0,0,1,0],//b 255
                [0,0,0,1]]//a 255

// window.onresize = canvasResize;
// function canvasResize(initialize) {
//   canvas.width  = window.innerWidth;
//   canvas.height = window.innerHeight;
// }

//3D STARTS HERE!!!!!!!
canvas = document.getElementById('3d');
var ctx = canvas.getContext('2d');
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

var butt = -1; // 0 left, 1 middle, 2 right
var mouseX = 0;
var mouseY = 0;
var clickstart = [0,0];
var xcenter = canvas.width/2;
  var ycenter = canvas.height/2;

const planetosize = 20; //increases distance of plane away from camera AND scales everything down
var bigness = 15/planetosize; // overall scale factor

var initcamdist = 50; // fov effects (becomes orthographic as approaches infinity)
var zoomfac = 1/Math.sqrt(initcamdist);
var camdistort = 50; // fov effects (becomes orthographic as approaches infinity)

camera = new Cam(39.33347860859019, 24.170967999528635, 19.20004600289643);

// function updatefov(){
//     let scalefac = (initcamdist*camdistort/50)/(Math.hypot(camera.vector[0], camera.vector[1], camera.vector[2]));
//     camera.pdist *= scalefac;
//     for(var i = 0; i < 3; i++){
//         camera.pos[i] *= scalefac;
//     }
// }
// updatefov();

var originsize = canvas.width/40;
var originpoints = [];

originpoints = [];
originpoints.push(new Point(originsize,0,0,"rgba(255,120,120,0.5)"));
originpoints.push(new Point(0,originsize,0,"rgba(120,255,120,0.5)"));
originpoints.push(new Point(0,0,originsize,"rgba(120,120,255,0.5)"));
originpoints.push(new Point(-originsize,0,0,"rgba(255,120,120,0.5)"));
originpoints.push(new Point(0,-originsize,0,"rgba(120,255,120,0.5)"));
originpoints.push(new Point(0,0,-originsize,"rgba(120,120,255,0.5)"));

function draworigin(){
    let names = ["+","+","+","-","-","-"];
    i = 0;
    for(let dot of originpoints){
        dot.project(camera);
        dot.draw(50*zoomfac);
        ctx.lineWidth = 2;
        ctx.strokeStyle = dot.color;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.moveTo(xcenter,ycenter);
        ctx.lineTo(dot.x, dot.y);
        ctx.stroke();
        ctx.font = "bold " + 100*zoomfac + "px Clear Sans";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "black";
        ctx.shadowBlur = 4;
        ctx.fillText(names[i], dot.x, dot.y);
        ctx.shadowBlur = 0;
        i++; //lazy to change the for loop
    }
}
function refresh(){
    //fillscreen();
    // ctx.clearRect(0,0,canvas.width, canvas.height)
    // ctx.fillStyle="black";
    // ctx.fillRect(0,0,canvas.width,canvas.height);
    camera.update();
    // outline.draw();
    draworigin();
    // grid.draw();
}


function transform(vect, useA){ //uses the testmatrix
    let outMatrix = [0,0,0];
    if(useA){
        outMatrix.push(0);
    }
    for(let i=0; i<outMatrix.length; i++){ 
        outMatrix[i] = (vect[0]*testMatrix[0][i]+vect[1]*testMatrix[1][i]+vect[2]*testMatrix[2][i]+((useA)?(vect[3]*testMatrix[3][i]):0));
    }
    return outMatrix;
}

xcenter = canvas.width/2;
function do3Dcanvases(){
    ctx.fillStyle="black";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    camera.update();
    draworigin();
}

do3Dcanvases();
setInterval(function(){ //the big loop
    if(butt==2){
        do3Dcanvases();
    }
}, 1000/60);
