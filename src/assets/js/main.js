import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import gsap from 'gsap';

// Creating Scene
const scene = new THREE.Scene();

// Creating Camera
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3.5;

// Creating renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#canvas"),
    antialias: true,
    alpha: true,
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerHeight, window.innerWidth);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

// Adding postProcessing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.0030;
composer.addPass(rgbShiftPass);

// Adding new variable to animate on mousemove
let model;

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// Loading the hdr file
new RGBELoader()
    .load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr', function (texture) {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        scene.environment = envMap;
        texture.dispose();
        pmremGenerator.dispose();

        // Adding 3D model
        const loader = new GLTFLoader();
        loader.load('/model/DamagedHelmet.gltf', (gltf) => {
            model = gltf.scene;
            scene.add(model);
        }, undefined, (error) => {
            console.error("An error occurred while loading the GLTF model:", error);
        });
    });

// Adding mousemov animation
window.addEventListener('mousemove', (e) => {
    if (model) {
        const rotationX = (e.clientX / window.innerWidth - .5) * (Math.PI * .3);
        const rotationY = (e.clientY / window.innerHeight - .5) * (Math.PI * .3);
        gsap.to(model.rotation, {
            x: rotationY,
            y: rotationX,
            duration: 0.5,
            ease: "power2.out"
        });
    }
});

// Making 3D model responsive
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight)
});

// render
function animate() {
    window.requestAnimationFrame(animate);
    composer.render();
}
animate();
