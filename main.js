import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(4, 4, 4);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const gridSize = 10;
const gridSpacing = 1; // distance between grid lines
const gridDivisions = gridSize / gridSpacing;
const gridColor = 0xffffff; // white

const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, gridColor);
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper( 5 );
scene.add(axesHelper);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();


const inputX = document.getElementById('input-x');
inputX.addEventListener('input', () => {
  vector.setX(parseFloat(inputX.value));
  arrowHelper.setDirection(vector);
});

const inputY = document.getElementById('input-y');
inputY.addEventListener('input', () => {
  vector.setY(parseFloat(inputY.value));
  arrowHelper.setDirection(vector);
});

const inputZ = document.getElementById('input-z');
inputZ.addEventListener('input', () => {
  vector.setZ(parseFloat(inputZ.value));
  arrowHelper.setDirection(vector);
});


/*
Line Logic
*/
const material = new THREE.LineBasicMaterial({
    color: 0x0000ff,
});

const points = [];
points.push( new THREE.Vector3( - 2, 0, 0 ) );
points.push( new THREE.Vector3( 0, 2, 0 ) );

const geometry = new THREE.BufferGeometry().setFromPoints( points );

const line = new THREE.Line( geometry, material );
scene.add( line );


const plane2 = new THREE.GridHelper(gridSize, gridDivisions, gridColor);
plane2.rotation.x = Math.PI / 2; // rotate the plane to face in the z-axis
scene.add(plane2);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();