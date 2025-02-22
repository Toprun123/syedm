import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
// import { GlitchPass } from "three/addons/postprocessing/GlitchPass.js";
// import { RenderPixelatedPass } from "three/addons/postprocessing/RenderPixelatedPass.js";
// import { GUI } from "three/addons/libs/lil-gui.module.min.js";

// Initialize Scene, Camera, and Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x100f18);
// scene.background = new THREE.Color(0x4caf50);

const camera = new THREE.PerspectiveCamera(30, 800 / 500, 0.1, 1000);

camera.position.set(
  11.338953419047728,
  10.750093497626658,
  -20.445540768015427,
);
camera.updateProjectionMatrix();

const canvas = document.querySelector("#canvas");

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});

window.camera = camera;

renderer.setPixelRatio(Math.min(window.devicePixelRatio * 2, 4));
renderer.setClearColor(0x000000, 0);
renderer.setSize(800, 500);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap; // Use soft shadows
document.body.appendChild(renderer.domElement);

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 3, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

// Position Camera
// camera.position.set(20, 16, 20);
controls.update();

// Add Lighting
// 1. Hemisphere Light for soft ambient diffuse lighting
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2); // Sky color, ground color, intensity
hemisphereLight.position.set(0, 0, 0);
scene.add(hemisphereLight);

// 2. Directional Light for main lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(-5, 10, 5);
directionalLight.castShadow = true;

// Soften shadows
directionalLight.shadow.mapSize.width = 4096; // Increase shadow map resolution
directionalLight.shadow.mapSize.height = 4096;
directionalLight.shadow.camera.near = 0.5; // Start of shadow camera frustum
directionalLight.shadow.camera.far = 50; // End of shadow camera frustum
directionalLight.shadow.camera.left = -15;
directionalLight.shadow.camera.right = 15;
directionalLight.shadow.camera.top = 15;
directionalLight.shadow.camera.bottom = -15;
directionalLight.shadow.radius = 12;

scene.add(directionalLight);

// Transparent Ground Plane
const groundGeometry = new THREE.PlaneGeometry(30, 30);
const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate to lie flat
ground.position.y = 0; // Position at y = 0
ground.receiveShadow = true;
scene.add(ground);

let model;

// Load 3D Model
const loader = new GLTFLoader();
loader.load(
  "../assets/setup_new.glb",
  function (gltf) {
    model = gltf.scene;
    model.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true; // Allow the model to cast shadows
      }
    });
    model.position.set(0, 0, 0); // Center the model
    scene.add(model);
  },
  undefined,
  function (error) {
    console.error("An error occurred while loading the model:", error);
  },
);

const composer = new EffectComposer(renderer);
composer.setSize(800, 500);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.17, // Strength
  0.4, // Radius
  0.4, // Threshold
);
composer.addPass(bloomPass);

// let glitchPass = new GlitchPass();
// composer.addPass(glitchPass);

// const renderPixelatedPass = new RenderPixelatedPass(6, scene, camera);
// composer.addPass(renderPixelatedPass);

const outputPass = new OutputPass();
composer.addPass(outputPass);

// Animate Scene
function animate() {
  requestAnimationFrame(animate);
  if (model) {
    model.rotation.y += 0.003; // Adjust rotation speed here
  }
  controls.update(); // Update OrbitControls
  composer.render();
}

animate();

// // Handle Resizing
// window.addEventListener("resize", () => {
//   camera.updateProjectionMatrix();
// });
