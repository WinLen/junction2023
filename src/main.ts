import { BoxColliderShape, BoxGeometry, Time, Camera3D, AtmosphericComponent, ColliderComponent, Color, DirectLight, Engine3D, View3D, LitMaterial, HoverCameraController, MeshRenderer, Object3D, PlaneGeometry, Scene3D, Vector3 } from '@orillusion/core';
import { Physics, Rigidbody, Ammo } from '@orillusion/physics';
import { Stats } from '@orillusion/stats';


document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <canvas id="canvas" width=${window.innerWidth} height=${window.innerHeight}>
  </div>
  <p>123<p>`;
 


class PennyPusheModel {
  pusher: Promise<any> | undefined;

  async createAmmoPusher(scene3D: { addChild: (arg0: any) => void; }){
    let world: Ammo.btDiscreteDynamicsWorld = Physics.world;
    let pusher = new Object3D();
    let bodyMat = new LitMaterial();

    bodyMat.baseMap = Engine3D.res.whiteTexture;
    bodyMat.normalMap = Engine3D.res.normalTexture;
    bodyMat.aoMap = Engine3D.res.whiteTexture;
    bodyMat.maskMap = Engine3D.res.whiteTexture;
    bodyMat.emissiveMap = Engine3D.res.blackTexture;
    
    let meshPusher = pusher.addComponent(MeshRenderer);
    meshPusher.geometry = new BoxGeometry(45, 20, 10);
    meshPusher.material = bodyMat;
    var geometry = new Ammo.btBoxShape(new Ammo.btVector3(45,20,10));
  
    var transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(0, 0, 0));
    transform.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));
    var motionState = new Ammo.btDefaultMotionState(transform);
    var localInertia = new Ammo.btVector3(0, 0, 0);
    geometry.calculateLocalInertia(1000, localInertia);
  
    var bodyRb = new Ammo.btRigidBody(
      new Ammo.btRigidBodyConstructionInfo(
        1000,
        motionState,
        geometry,
        localInertia
      )
    );

    let collider = pusher.addComponent(ColliderComponent);
    collider.shape = new BoxColliderShape();
    collider.shape.size = new Vector3(45, 20, 10);
    collider.start();
    collider.onEnable(scene3D);
    console.log(collider);
  
  
    bodyRb.setActivationState(4);
    world.addRigidBody(bodyRb);
  
    scene3D.addChild(pusher);
    return pusher;
  }

  


  createObject(positionY: any, scene3D: { addChild: (arg0: any) => void; }) {
    const obj = new Object3D();
    let mr = obj.addComponent(MeshRenderer);
    let rigidbody = obj.addComponent(Rigidbody);
    rigidbody.mass = 1;
    rigidbody.friction = 10;
  
    let collider = obj.addComponent(ColliderComponent);
    collider.shape = new BoxColliderShape();
    collider.shape.size = new Vector3(2, 2, 0.5);
  
    mr.geometry = new BoxGeometry(2, 2, 0.5);
    obj.y = positionY;
  
    mr.material = new LitMaterial();
    mr.material.baseColor = new Color(Math.random(), Math.random(), Math.random(), 1.0);
  
    scene3D.addChild(obj);
  
    return obj;
  }

  createPlate(rotationZ: any, scene3D: { addChild: (arg0: any) => void; }) {

    const floor = new Object3D();
    let mr = floor.addComponent(MeshRenderer);
    mr.geometry = new PlaneGeometry(50, 50, 1, 1);
    mr.castShadow = true;
    mr.receiveShadow = true;
  
  
    let floorMat = new LitMaterial();
    mr.material = floorMat;
    floorMat.baseMap = Engine3D.res.grayTexture;
    floorMat.roughness = 0.85;
    floorMat.metallic = 0.01;
    floorMat.envIntensity = 0.01;

    let rigidbody = floor.addComponent(Rigidbody);
    rigidbody.mass = 0;
 
    let collider = floor.addComponent(ColliderComponent);
    collider.shape = new BoxColliderShape();
    collider.shape.size = new Vector3(50, 1, 50);
  
    floor.rotationZ = rotationZ;
    scene3D.addChild(floor);
    return floor;
  }

  createSide(scene3D: { addChild: (arg0: any) => void; }) {
    const side = new Object3D();
    let mr = side.addComponent(MeshRenderer);
    let rigidbody = side.addComponent(Rigidbody);
    rigidbody.mass = 0;
    let collider = side.addComponent(ColliderComponent);
    collider.shape = new BoxColliderShape();
    let height = 30;
    collider.shape.size = new Vector3(50, height, 1);
    mr.geometry = new BoxGeometry(50, height, 1);
    mr.material = new LitMaterial();
    mr.material.baseColor = new Color(Math.random(), Math.random(), Math.random(), 1.0);
    
    side.y = height/2;
    scene3D.addChild(side);
    return side;
  }

  calculateNewPosition() {
    let k = Math.sin(Time.time * 0.001) * 10;
    return new Vector3(0, 0, k);
  }

  updatePusherPosition(pusher: { getComponent: (arg0: any) => any; }) {
    let newPosition = this.calculateNewPosition();
    let rigidBody = pusher.getComponent(Rigidbody);

    if (rigidBody && rigidBody._btRigidbody) {
        let transform = new Ammo.btTransform();
        rigidBody._btRigidbody.getMotionState().getWorldTransform(transform);
        transform.setOrigin(new Ammo.btVector3(newPosition.x, newPosition.y, newPosition.z));
        rigidBody._btRigidbody.getMotionState().setWorldTransform(transform);
    }
  }


  async run() {
    Engine3D.setting.shadow.autoUpdate = true;
    Engine3D.setting.shadow.updateFrameRate = 1;
    Engine3D.setting.shadow.shadowSize = 2048;
    Engine3D.setting.shadow.shadowBound = 150;
    let canvas = document.getElementById("canvas");
    Physics.gravity = new Vector3(0, -9.8 ,0);
    await Physics.init();
    await Engine3D.init({ canvasConfig: { canvas }, renderLoop: () => this.loop() });
    
    let scene3D = new Scene3D();
    scene3D.addComponent(Stats);

  let sky = scene3D.addComponent(AtmosphericComponent);

  let cameraObj = new Object3D();
  let camera = cameraObj.addComponent(Camera3D);

  camera.perspective(30, window.innerWidth / window.innerHeight, 1, 5000.0);

  let controller = camera.object3D.addComponent(HoverCameraController);
  controller.setCamera(100, -15, 200, new Vector3(0, 50, 0))

  scene3D.addChild(cameraObj);





  let light = new Object3D();

  let component = light.addComponent(DirectLight);

  light.rotationX = 45;
  light.rotationY = 30;
  component.intensity = 2;
  scene3D.addChild(light);


  let interval = setInterval(() => {
    this.createObject(65, scene3D)
    if (scene3D.entityChildren.length > 60000) {
        clearInterval(interval);
    }
  }, 50);


  this.createPlate(0, scene3D);


  let ls = this.createSide(scene3D);
  ls.z = -25;

  let rs = this.createSide(scene3D);
  rs.z = 25;

  let fs = this.createSide(scene3D);
  fs.x = 25;
  fs.rotationY = 90;

  let bs = this.createSide(scene3D);
  bs.x = -25;
  bs.rotationY = 90;


  //let pusher = this.createAmmoPusher(scene3D);
  //this.pusher = pusher;

  let view = new View3D();

  view.scene = scene3D;

  view.camera = camera;

  Engine3D.startRenderView(view);

  }
  
  private async loop() {
    Physics.update();
    if (this.pusher) {
      this.updatePusherPosition(await this.pusher);
    }
  }

}

new PennyPusheModel().run();