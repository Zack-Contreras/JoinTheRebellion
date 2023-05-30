//https://www.youtube.com/watch?v=xJAfLdUgdc4
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import space from '../img/space3.jpg'

const clock = new THREE.Clock()
const xwingUrl = new URL('../assets/stylized_x-_wing.glb', import.meta.url)

const renderer = new THREE.WebGLRenderer({alpha: true})
renderer.setClearColor(0xffffff, 0);

renderer.shadowMap.enabled = true

renderer.setSize(window.innerWidth, window.innerHeight)

document.querySelector('#hero').appendChild(renderer.domElement)

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
    75, 
    window.innerWidth / window.innerHeight,
    .1,
    1000
)

const orbit = new OrbitControls(camera, renderer.domElement)

const axesHelper = new THREE.AxesHelper();
//scene.add(axesHelper)

camera.position.set(0, 2, 20)
orbit.update()

// const planeGeometry = new THREE.PlaneGeometry(30, 30)
// const planeMaterial = new THREE.MeshStandardMaterial({color: 0x0000Fa, side: THREE.DoubleSide})
// const plane = new THREE.Mesh(planeGeometry, planeMaterial)
// scene.add(plane)
// plane.receiveShadow = true
// plane.rotation.x = -.5 * Math.PI;

// const boxGeometry = new THREE.BoxGeometry()
// const boxMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00})
// const box = new THREE.Mesh(boxGeometry, boxMaterial)
// scene.add(box)


const gridHelper = new THREE.GridHelper(30)
//scene.add(gridHelper)

const ambientLight = new THREE.AmbientLight(0x333333)
scene.add(ambientLight)


let rotated = false;
let initialHoverPosition; // Initial position of the hover animation
const flyInDuration = .5; // Duration of the flying animation in seconds
const flyInEndPosition = new THREE.Vector3(0, 0, 0);
const rotationAmplitude = 0.07;
let model, hoverAmplitude, hoverFrequency, initialY, mixer;
const assetLoader = new GLTFLoader();
assetLoader.load(xwingUrl.href, function(gltf) {
    model = gltf.scene;
    console.log(model)
    scene.add(model);
    model.position.set(-10, -0, -100);
    model.rotateY(.1)
    //model.rotateY(1.2)

    const scaleDownFactor = 0.5; // Adjust the scale factor as needed

    model.scale.x *= scaleDownFactor;
    model.scale.y *= scaleDownFactor;
    model.scale.z *= scaleDownFactor;

    initialY = model.position.y; // Store the initial y-position of the object
    hoverAmplitude = 0.5; // Adjust the amplitude of the hover motion as needed
    hoverFrequency = 1;

    let elapsedTime = 0;
    let isFlyInAnimationComplete = false;
    function animateModel() {
        const deltaTime = clock.getDelta();
    
        // Check if the fly-in animation is complete
        if (!isFlyInAnimationComplete) {
          elapsedTime += deltaTime;
      
          // Calculate the interpolation factor (0 to 1) based on the elapsed time and duration
          const t = Math.min(elapsedTime / flyInDuration, 1);
      
          // Interpolate the position from the initial position to the destination position
          const interpolatedPosition = new THREE.Vector3();
          interpolatedPosition.lerpVectors(model.position, flyInEndPosition, t);
      
          // Update the model's position
          model.position.copy(interpolatedPosition);
      
          // Check if the fly-in animation is complete
          if ((elapsedTime) >= flyInDuration) {
            isFlyInAnimationComplete = true;
            initialHoverPosition = model.position.clone();
          }
        } else {
          console.log("IN ELSE");
          // Calculate the vertical position offset based on time
          const time = performance.now() * 0.001;
          const verticalOffset = Math.sin(time * hoverFrequency) * hoverAmplitude;
          // Apply the hover animation to the object with a smooth transition from fly-in position
          const targetPosition = initialHoverPosition.clone().add(new THREE.Vector3(0, verticalOffset, 0));
          // Apply the hover animation to the object
          model.position.lerp(targetPosition, deltaTime * 5); // Adjust the blending speed as needed

          const targetRotation = new THREE.Euler(verticalOffset * rotationAmplitude, 0, 0);
          model.rotation.x = THREE.MathUtils.lerp(model.rotation.x, targetRotation.x, deltaTime * 5); // Adjust the blending speed as needed
         // model.rotation.x = verticalOffset * 0.07; // Adjust rotation based on vertical offset
        }

         // Render the scene
        renderer.render(scene, camera);

        // Continue the animation loop
        requestAnimationFrame(animateModel);
      }

      animateModel()
})
//#region Directional Light
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, .8)
scene.add(directionalLight)
directionalLight.position.set(15, 50, 30)
directionalLight.castShadow = true
directionalLight.shadow.camera.bottom = -12

const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5)
//scene.add(dLightHelper)

const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
//scene.add(dLightShadowHelper)
//#endregion

const textureLoader = new THREE.TextureLoader()

//scene.background = textureLoader.load(space)

// textureLoader.load(space, (texture) => {
//     // Adjust the texture's aspect ratio to match the renderer's aspect ratio
//     texture.wrapS = THREE.RepeatWrapping;
//   texture.wrapT = THREE.RepeatWrapping;
//   texture.repeat.set(1, 1);
//   texture.minFilter = THREE.LinearFilter;
//     scene.backgroundSize = "cover"
  
//     // Set the texture as the background of the scene
//     scene.background = texture;
  
//     // Render the scene
//     renderer.render(scene, camera);
//   });
scene.background = null;
renderer.render(scene, camera);
// const gui = new dat.GUI();

// const options = {
//     sphereColor: '#0000FF',
//     wireframe: false,
//     speed: 0.01,
// };

// gui.add(options, 'speed', 0, .1)


// let step = 0
// let speed = 0.01
// function animate() {
//    // box.rotation.y += .01

//     const time = Date.now() * 0.001; // Get the current time
//     const displacement = Math.sin(time * hoverFrequency) * hoverAmplitude;
//    // model?.position?.y && (model.position.y = initialY + displacement)

//    const delta = clock.getDelta(); // Assuming you have a clock instance defined
//     mixer?.update(delta);
//     renderer.render(scene,camera)
// }
// renderer.setAnimationLoop(animate)



function flattenKeyframes(keyframes) {
    const result = [];
    for (let i = 0; i < keyframes.length; i++) {
      const keyframe = keyframes[i];
      const { time, ...values } = keyframe;
      result.push(time, ...Object.values(values));
    }
    return result;
}
