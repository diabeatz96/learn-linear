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

// Get the button
const plotButton = document.getElementById('plot');

plotButton.addEventListener('click', function() {
  // Get the checkboxes
  const plotPlane1 = document.getElementById('plotPlane1').checked;
  const plotPlane2 = document.getElementById('plotPlane2').checked;

  let plane1, plane2;

  // If the first checkbox is checked, plot the first plane
  if (plotPlane1) {
    // Get the input values for the first plane
    const a1 = document.getElementById('x1').value;
    const b1 = document.getElementById('y1').value;
    const c1 = document.getElementById('z1').value;
    const d1 = document.getElementById('solution1').value;

    // Create the first plane from the equation a1x + b1y + c1z + d1 = 0
    const planeNormal1 = new THREE.Vector3(a1, b1, c1);
    const planeConstant1 = -d1;
    plane1 = new THREE.Plane(planeNormal1, planeConstant1);

    // Visualize the first plane with a helper
    const planeHelper1 = new THREE.PlaneHelper(plane1, 8, 0xffff00);
    scene.add(planeHelper1);
  }

  // If the second checkbox is checked, plot the second plane
  if (plotPlane2) {
    // Get the input values for the second plane
    const a2 = document.getElementById('x2').value;
    const b2 = document.getElementById('y2').value;
    const c2 = document.getElementById('z2').value;
    const d2 = document.getElementById('solution2').value;

    // Create the second plane from the equation a2x + b2y + c2z + d2 = 0
    const planeNormal2 = new THREE.Vector3(a2, b2, c2);
    const planeConstant2 = -d2;
    plane2 = new THREE.Plane(planeNormal2, planeConstant2);

    // Visualize the second plane with a helper
    const planeHelper2 = new THREE.PlaneHelper(plane2, 8, 0xff0000);
    scene.add(planeHelper2);
  }

  // If both checkboxes are checked, plot the intersection line
  if (plotPlane1 && plotPlane2) {
    // Find the intersection line
    const point = vertIntersectPlanes(plane1, plane2);
    console.log(point);
    
    // Alternatively, visualize the intersection point with a small sphere
    const sphereGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00});
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(point.x, point.y, point.z);
    scene.add(sphere);


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



function vertIntersectPlanes(p1, p2) {
  let n1 = p1.normal, n2 = p2.normal;
  let x1 = p1.coplanarPoint(new THREE.Vector3());
  let x2 = p2.coplanarPoint(new THREE.Vector3());

  // Calculate the direction of the intersection line
  let direction = new THREE.Vector3().crossVectors(n1, n2);

  // If the direction is zero, the planes are parallel and don't intersect
  if (direction.lengthSq() === 0) {
    return null;
  }

  // Calculate a point on the intersection line
  let f1 = new THREE.Vector3().crossVectors(n2, direction).multiplyScalar(x1.dot(n1));
  let f2 = new THREE.Vector3().crossVectors(direction, n1).multiplyScalar(x2.dot(n2));
  let det = new THREE.Matrix3().set(n1.x, n1.y, n1.z, n2.x, n2.y, n2.z, direction.x, direction.y, direction.z).determinant();
  let vectorSum = new THREE.Vector3().add(f1).add(f2);
  let linePoint = new THREE.Vector3(vectorSum.x / det, vectorSum.y / det, vectorSum.z / det);
  return linePoint;
}
