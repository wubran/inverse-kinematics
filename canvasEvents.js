var inputs = document.getElementsByTagName("input");


var randButton = document.getElementById("randButton");
randButton.onclick = function(){
  for(let i=0; i<theArm.joints.length; i++){
    theArm.joints[i].theta = Math.PI*Math.random();
  }
  theArm.forwardKinematics();
}

function preventDefaults (e) {
  e.preventDefault()
  e.stopPropagation()
}

canvas.oncontextmenu = function(e) { e.preventDefault(); e.stopPropagation(); }

canvas.addEventListener('mousedown', onClick);
canvas.addEventListener("mouseup", onRelease);
canvas.addEventListener('mouseleave', onMouseLeave);
canvas.addEventListener('mousemove', onMouseMove);

function preventDefaults (e) {
  e.preventDefault()
  e.stopPropagation()
}

function onClick(event){
    //click = true;
    butt = event.button;
}

function onRelease(event){
    butt = -1;
}

function onMouseMove(event){
    //mousemoved = true;
      mouseX = event.offsetX;
      mouseY = event.offsetY;
    if(butt == 2){
        let diffx = clickstart[0] - (xcenter-mouseX);
        let diffy = clickstart[1] - (ycenter-mouseY);
        camera.orbit(-20*diffx/(1000), 20*diffy/(1000));
    }
    clickstart = [xcenter-mouseX,ycenter-mouseY]; //must use center because cavnas corners move when resizing
}

function onMouseLeave(event){
    butt = -1;
}

document.addEventListener('keydown', (event) => {
  const keyName = event.key;
  switch(keyName){
      case 'Control':
          return;
      case 'Escape':

          return;
      case ' ':
          pause = !pause;
          return;
  }
}, false);