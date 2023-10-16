import * as THREE from 'three';
import * as math from 'mathjs';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

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


const inputX = document.getElementById("input-x");
const inputY = document.getElementById("input-y");
const inputZ = document.getElementById("input-z");

const material = new THREE.LineBasicMaterial({
  color: 0x0000ff,
});

const geometry = new THREE.BufferGeometry();

const plotButton = document.getElementById("plot");
plotButton.addEventListener("click", () => {
  
  const equation = document.getElementById("equation").value;

  const points = [];

  for (let x = 1; x <= 1; x++) {
    for (let y = 1; y <= 5; y++) {
      for (let z = 1; z <= 1; z++) {
        const result = eval(equation);
        if (!isNaN(result)) {
          const point = new THREE.Vector3(x, y, z);
          points.push(point);
          const length = point.length();
          const arrowHelper = new THREE.ArrowHelper(point.normalize(), new THREE.Vector3(0, 0, 0), length, 0xff0000);
          scene.add(arrowHelper);
        }
      }
    }
  }
});

const applyButton = document.getElementById("apply");

applyButton.addEventListener("click", () => {
  const matrix = document.getElementById("matrix-input").value;
  const matrixArray = matrix.split(",").map((val) => parseFloat(val));
  const matrix3 = new THREE.Matrix3();
  matrix3.set(...matrixArray);

  const vectorInput = document.getElementById("vector-input").value;
  const vectorArray = vectorInput.split(",").map((val) => parseFloat(val));
  const vector = new THREE.Vector3(...vectorArray);
  vector.applyMatrix3(matrix3);

  const length = vector.length();
  const arrowHelper = new THREE.ArrowHelper(vector.normalize(), new THREE.Vector3(0, 0, 0), length, 0xff0000);
  scene.add(arrowHelper);
});


const clearButton = document.getElementById("clear");

clearButton.addEventListener("click", () => {
  scene.children.forEach((child) => {
    if (child instanceof THREE.ArrowHelper || child instanceof THREE.PlaneHelper) {
      scene.remove(child);
    }
  });
});


const gaussianButton = document.getElementById("gaussian-apply");

gaussianButton.addEventListener("click", () => {
  const matrixInput = document.getElementById("gaussian-matrix-input").value;
  const matrixArray = matrixInput.split(",").map((val) => parseFloat(val));
  const matrix = math.matrix(matrixArray).reshape([3, 3]);

  const identityMatrix = math.identity(3);

  console.log(matrix);
  console.log(identityMatrix);
  
  const augmentedMatrix = math.concat(matrix, identityMatrix, 1);

  console.log(augmentedMatrix);
  // Perform Gaussian elimination
  for (let i = 0; i < 3; i++) {
    // Find pivot row
    let pivotRow = i;
    let pivotValue = augmentedMatrix.get([i, i]);
    for (let j = i + 1; j < 3; j++) {
      if (Math.abs(augmentedMatrix.get([j, i])) > Math.abs(pivotValue)) {
        pivotRow = j;
        pivotValue = augmentedMatrix.get([j, i]);
      }
    }

    // Swap rows if necessary
    if (pivotRow !== i) {
      const tempRow = augmentedMatrix.subset(math.index(pivotRow, math.range(0, 6)));
      augmentedMatrix.subset(math.index(pivotRow, math.range(0, 6)), augmentedMatrix.subset(math.index(i, math.range(0, 6))));
      augmentedMatrix.subset(math.index(i, math.range(0, 6)) , tempRow);
    }

    // Eliminate values below pivot
    for (let j = i + 1; j < 3; j++) {
      const factor = augmentedMatrix.get([j, i]) / pivotValue;
      for (let k = i; k < 6; k++) {
        augmentedMatrix.subset(math.index(j, k), augmentedMatrix.get([j, k]) - factor * augmentedMatrix.get([i, k]));
      }
    }
  }

  // Back-substitution
  const solution = math.zeros(3, 1);
  for (let i = 2; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < 3; j++) {
      sum += augmentedMatrix.get([i, j]) * solution.get([j, 0]);
    }
    solution.set([i, 0], (augmentedMatrix.get([i, 3]) - sum) / augmentedMatrix.get([i, i]));
  }

  console.log(solution);

  // Display steps in Three.js
  for (let i = 0; i < 3; i++) {
    const row = [];
    for (let j = 0; j < 6; j++) {
      row.push(augmentedMatrix.get([i, j]));
    }
    console.log(row);
    const text = row.join(" ");
    const loader = new FontLoader();
    loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {

      const textGeometry = new TextGeometry( text, {
        font: font,
        size: 0.2,
        height: 0.01,
      } );

      const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      textMesh.position.set(-2, 2 - i * 0.3, 0);
      scene.add(textMesh);

    } );
  
  }
});

const plane2 = new THREE.GridHelper(gridSize, gridDivisions, gridColor);
plane2.rotation.x = Math.PI / 2; // rotate the plane to face in the z-axis
scene.add(plane2);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();