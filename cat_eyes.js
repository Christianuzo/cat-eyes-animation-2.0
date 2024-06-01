// Basic Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const light = new THREE.AmbientLight(0xffffff); // soft white light
scene.add(light);

// Create a material for the eyes
const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

// Function to create an eye
function createEye() {
    const eyeGroup = new THREE.Group();
    const eyeGeometry = new THREE.SphereGeometry(1, 32, 32);
    eyeGeometry.scale(1.2, 1, 1); // make the eye oval
    const eyeball = new THREE.Mesh(eyeGeometry, eyeMaterial);

    // Pupil
    const pupilGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    pupil.position.z = 0.8;

    eyeGroup.add(eyeball);
    eyeGroup.add(pupil);
    
    eyeGroup.userData = {
        isBlinking: false,
        blinkDuration: 200, // in milliseconds
        blinkStartTime: 0,
        pupil
    };

    return eyeGroup;
}

// Create two eyes with good spacing
const leftEye = createEye();
const rightEye = createEye();

leftEye.position.x = -3;
rightEye.position.x = 3;

scene.add(leftEye);
scene.add(rightEye);

camera.position.z = 8;

// Function to update eye blink
function updateBlink(eye) {
    const now = Date.now();
    const { isBlinking, blinkDuration, blinkStartTime } = eye.userData;
    if (isBlinking) {
        const elapsedTime = now - blinkStartTime;
        if (elapsedTime < blinkDuration / 2) {
            // Closing the eye
            eye.scale.y = 1 - (elapsedTime / (blinkDuration / 2));
        } else {
            // Opening the eye
            eye.scale.y = (elapsedTime - (blinkDuration / 2)) / (blinkDuration / 2);
        }
        if (elapsedTime >= blinkDuration) {
            // Blink complete
            eye.userData.isBlinking = false;
        }
    }
}

// Blink interval
function blink(eye) {
    if (!eye.userData.isBlinking) {
        eye.userData.isBlinking = true;
        eye.userData.blinkStartTime = Date.now();
    }
}

// Set interval for blinking every second
setInterval(() => {
    blink(leftEye);
    blink(rightEye);
}, 1000);

// Automatic pupil movement
let lookDirections = [
    { x: 0, y: 0 }, // Straight
    { x: 0, y: -0.5 }, // Down
    { x: 0.5, y: 0 }, // Right
    { x: 0, y: 0.5 }, // Up
    { x: -0.5, y: 0 } // Left
];
let currentLookIndex = 0;
let lookStraightTime = 2000;
let lookAroundInterval = 2000;

function lookAround() {
    const lookPosition = lookDirections[currentLookIndex];
    [leftEye, rightEye].forEach(eye => {
        eye.userData.pupil.position.x = lookPosition.x;
        eye.userData.pupil.position.y = lookPosition.y;
    });
    currentLookIndex = (currentLookIndex + 1) % lookDirections.length;
}

function resetToStraight() {
    [leftEye, rightEye].forEach(eye => {
        eye.userData.pupil.position.x = 0;
        eye.userData.pupil.position.y = 0;
    });
}

// Initial state
let isCursorMoving = false;
let lookAroundTimeout = null;

function startLookAround() {
    lookAround();
    lookAroundTimeout = setTimeout(() => {
        resetToStraight();
        setTimeout(startLookAround, lookStraightTime);
    }, lookAroundInterval);
}

// Event listener for mouse movement
window.addEventListener('mousemove', (event) => {
    clearTimeout(lookAroundTimeout);
    isCursorMoving = true;
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    [leftEye, rightEye].forEach(eye => {
        eye.userData.pupil.position.x = mouseX * 0.5;
        eye.userData.pupil.position.y = mouseY * 0.5;
    });
    setTimeout(() => {
        isCursorMoving = false;
        startLookAround();
    }, 3000); // If no cursor movement for 3 seconds, start looking around
});

// Render loop
function animate() {
    requestAnimationFrame(animate);
    updateBlink(leftEye);
    updateBlink(rightEye);
    renderer.render(scene, camera);
}

// Start the initial look around sequence
setTimeout(startLookAround, lookStraightTime);

animate();
