class arm{
    constructor(){
        this.joints = [];
        this.thetas = [0,0,0,0,0,0]; //base, shoulder, elbow, wrist, wrist, wrist
        this.boneLengths = []
        this.boneVectors = []
        this.positions = [[],[],[],[],[],[]]
        this.sphereRadius = 5;
    }
    inverseKinematics(pos,dir,r){ // position x,y,z, and axis-angle rotation
        // steps:
        // calculate the elbow target point
        // calculate the base angle to above point
        dir = normalize(dir);
        let spherePivot = [pos[0]-sphereRadius*dir[0], pos[1]-sphereRadius*dir[1], pos[2]-sphereRadius*dir[2]];
        // treat the x-axis as theta 0 for base angle
        thetas[0] = Math.atan(spherePivot[1]/spherePivot[0]);
    }
    linearMove(x,y,z,a,b,c,r){

    }
    normalize(vect){
        let mag = Math.hypot(...vect);
        for(let i = 0; i<vect.length; i++){
            vect[i]/=mag;
        }
        return vect;
    }
    draw(){

    }
    forwardkinematics(){ // updates positions based on thetas

    }
    rotate3d(x,y,z,a,b,c,r){

    }
}

class jointBone{
    constructor(theta,bone,relativeVector,mesh){
        // joint is centered at origin with own axis facing vertial
        // vector represents the bone
        // relativeVector represents this vector's axis (z-axis) in the previous vector's space
        // the relativeVector of the base vector is [0,0,1]
        this.theta = theta;
        this.bone = bone;
        this.relativeVector = relativeVector;
        this.mesh = mesh;
    }
}

let bong = new jointBone();