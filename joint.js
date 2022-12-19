let drawFlag = false;

class Arm{
    constructor(...joints){
        this.joints = joints;
        this.sphereRad = joints[4].boneLength + joints[5].boneLength;

        let posAccumulator = [0,0,0];
        for(let i=0; i<joints.length; i++){ // calculate default positions based off of default bones
            joints[i].defaultTruePP = posAccumulator.slice(0,3);
            joints[i].truePP.pos = posAccumulator.slice(0,3);
            posAccumulator[0] += joints[i].defaultTrueBone[0];
            posAccumulator[1] += joints[i].defaultTrueBone[1];
            posAccumulator[2] += joints[i].defaultTrueBone[2];
        }
        this.endPoint = new Point(...posAccumulator,"white");
        this.targetPoint = new Point(...posAccumulator,"white");
        this.targetVect = [0,0,1]
        this.forwardKinematics();
    }
    inEnvelope(x,y,z,a,b,c,r){

    }
    inverseKinematics(){ // position x,y,z, and axis-angle rotation
        // steps (analytical and arm-specific):
        // calculate the elbow target point
        // calculate the base angle to above point
        let dir = this.normalize(this.targetVect);
        let spherePivot = [this.targetPoint.pos[0]-this.sphereRad*dir[0], this.targetPoint.pos[1]-this.sphereRad*dir[1], this.targetPoint.pos[2]-this.sphereRad*dir[2]];
        // treat the x-axis as theta 0 for base angle
        this.joints[0].theta = Math.atan(spherePivot[1]/spherePivot[0]);
        if(spherePivot[0]<0){
            this.joints[0].theta+=Math.PI;
        }

        this.joints[2].theta = Math.PI - 2*Math.asin(0.5*Math.sqrt((spherePivot[0]-this.joints[1].truePP.pos[0])*(spherePivot[0]-this.joints[1].truePP.pos[0])+(spherePivot[1]-this.joints[1].truePP.pos[1])*(spherePivot[1]-this.joints[1].truePP.pos[1])+(spherePivot[2]-this.joints[1].truePP.pos[2])*(spherePivot[2]-this.joints[1].truePP.pos[2]))/5);  // assume isosceles length of L

        // normal of the elbow plane is perpendicular to x,y component of spherePivot, and no z component
        // nevermind, just rotate around the z axis
        let targ2d = [Math.sqrt(spherePivot[0]*spherePivot[0] + spherePivot[1]*spherePivot[1]),spherePivot[2]];
        this.joints[1].theta = Math.atan(targ2d[1]/targ2d[0]);
        if(targ2d[0]<0){
            this.joints[1].theta+=Math.PI;
        }
        this.joints[1].theta-=(Math.PI-this.joints[2].theta)/2

        
        this.forwardKinematics();
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
    normalFromPoints(p1, p2, p3) {
        const v1 = subtractVectors(p2, p1);
        const v2 = subtractVectors(p3, p1);
        return crossProduct(v1, v2);
    }
    subtractVectors(a, b) {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    }
    crossProduct(a, b) {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0],
        ];
    }
    projPlane(norm, point){ // orthographic projection
        let dotted = this.dot3d(point,norm);
        // projected = [
        //     point[0] - norm[0]*dotted,
        //     point[1] - norm[1]*dotted,
        //     point[2] - norm[2]*dotted,
        // ]
        return [point[0] - norm[0]*dotted,point[1] - norm[1]*dotted];
    }
    dot3d(a, b) { // only for 3d
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }
    forwardKinematics(){ // updates positions based on thetas
        // how to calculate final position:
        // add up all true bones

        // how to calculate all true bones:
        // bone 0: rotate (joint 0 and) bone 0 around joint 0, (no change)
        // bone 1: rotate joint 1 and bone 1 around joint 0, then rotate (joint 1 and) bone 1 around joint 1
        // bone 2: rotate joint 2 and bone 2 around joint 0, rotate joint 2 and bone 2 around joint 1, then rotate (joint 2 and) bone 2 around joint 2

        // alternatively, to be able to reuse rotation matrixes:
        // rotate all bones and joints around joint 0
        // rotate bones and joints 1-6 around joint 1 (although joint 1 doesnt need to be rotated around joint 1)
        // rotate bones and joints 2-6 around joint 2 (although joint 2 doesnt need to be rotated around joint 2)...
        for(let i=0; i<this.joints.length; i++){
            this.joints[i].truePivotAxis = this.joints[i].defaultTrueAxis.slice(0,3); // as if theta were 0;
            this.joints[i].trueBone = this.joints[i].defaultTrueBone.slice(0,3); // as if theta were 0;
        }
        for(let i=0; i<this.joints.length; i++){
            let thingsToRotate = [];
            for(let j=i; j<this.joints.length; j++){
                thingsToRotate.push(this.joints[j].truePivotAxis);
                thingsToRotate.push(this.joints[j].trueBone);
            }
            this.rotate3d(...this.joints[i].truePivotAxis,this.joints[i].theta,thingsToRotate);
            // console.log(thingsToRotate)
        }

        let posAccumulator = [0,0,0];
        for(let i=0; i<this.joints.length; i++){ // calculate default positions based off of default bones
            this.joints[i].truePP.pos = posAccumulator.slice(0,3);
            posAccumulator[0] += this.joints[i].trueBone[0];
            posAccumulator[1] += this.joints[i].trueBone[1];
            posAccumulator[2] += this.joints[i].trueBone[2];
        }
        this.endPoint.pos = posAccumulator.slice(0,3);

        drawFlag = true;
    }
    rotate3d(a, b, c, theta, vects) { // rotates the objects in "vects," does not return anything
        // Calculate rotation matrix
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
        let rotationMatrix = [
            [a * a * (1 - cosTheta) + cosTheta, a * b * (1 - cosTheta) - c * sinTheta, a * c * (1 - cosTheta) + b * sinTheta],
            [a * b * (1 - cosTheta) + c * sinTheta, b * b * (1 - cosTheta) + cosTheta, b * c * (1 - cosTheta) - a * sinTheta],
            [a * c * (1 - cosTheta) - b * sinTheta, b * c * (1 - cosTheta) + a * sinTheta, c * c * (1 - cosTheta) + cosTheta]
        ];
      
        // Rotate point
        for(let i=0; i<vects.length; i++){
            const rotatedX = vects[i][0] * rotationMatrix[0][0] + vects[i][1] * rotationMatrix[0][1] + vects[i][2] * rotationMatrix[0][2];
            const rotatedY = vects[i][0] * rotationMatrix[1][0] + vects[i][1] * rotationMatrix[1][1] + vects[i][2] * rotationMatrix[1][2];
            const rotatedZ = vects[i][0] * rotationMatrix[2][0] + vects[i][1] * rotationMatrix[2][1] + vects[i][2] * rotationMatrix[2][2];
            vects[i][0] = rotatedX;
            vects[i][1] = rotatedY;
            vects[i][2] = rotatedZ;
        }
    }
    drawVects(){
        for(let i=0; i<this.joints.length; i++){
            this.joints[i].truePP.project(camera);
            this.joints[i].truePP.draw();
        }
        for(let i=0; i<this.joints.length-1; i++){
            ctx.strokeStyle = this.joints[i].truePP.color;
            ctx.beginPath();
            ctx.moveTo(this.joints[i].truePP.x,this.joints[i].truePP.y);
            ctx.lineTo(this.joints[i+1].truePP.x,this.joints[i+1].truePP.y);
            // ctx.lineTo(this.joints[i].truePP.x,this.joints[i].truePP.y);
            ctx.stroke();
        }
        this.endPoint.project(camera);
        // this.endPoint.draw();
        this.targetPoint.project(camera);
        this.targetPoint.draw();

        ctx.strokeStyle = this.joints[this.joints.length-1].truePP.color;
        ctx.beginPath();
        ctx.moveTo(this.joints[this.joints.length-1].truePP.x,this.joints[this.joints.length-1].truePP.y);
        ctx.lineTo(this.endPoint.x, this.endPoint.y);
        ctx.stroke();
    }
}

class JointBone{
    constructor(defaultTrueAxis,defaultTrueBone,mesh,color="white"){
        // joint is centered at origin with own axis facing vertial and theta=0
        // bone is the vector from this joint to the next joint
        // relativeVector represents this joints's axis (z-axis) in the previous joints's space
        // the relativeVector of the base joint is [0,0,1]
        this.theta = 0;
        this.bone;
        this.boneLength = Math.hypot(...defaultTrueBone);
        this.mesh = mesh;
        this.defaultTruePP = [0,0,0];
        this.defaultTrueAxis = defaultTrueAxis;
        this.defaultTrueBone = defaultTrueBone;

        this.truePP = new Point(0,0,0,color); // true pivot point position
        this.truePivotAxis = defaultTrueAxis;
        this.trueBone = defaultTrueBone; // true vector from the pivot point to next pivot point
    }
}

var baseVect = new JointBone([0,0,1],[0,0,2],undefined,"red"); // base joint, 0 is the x-axis
var shoulder = new JointBone([0,1,0],[0,0,5],undefined,"orange"); // shoulder and upper arm
var elbow = new JointBone([0,1,0],[0,0,4],undefined,"yellow"); // elbow and lower arm
var wristRoll = new JointBone([0,0,1],[0,0,1],undefined,"lime"); // wrist turns
var wristYaw = new JointBone([1,0,0],[0,0,1],undefined,"teal"); // wrist rocks back and forth
var wristTwist = new JointBone([0,0,1],[0,0,1],undefined,"fuchsia"); // secondary wrist turn
var theArm = new Arm(baseVect,shoulder,elbow,wristRoll,wristYaw,wristTwist);
