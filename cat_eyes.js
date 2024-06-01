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

// Function to create an oval eye
function createEye() {
    const eyeGroup = new THREE.Group();
    const eyeGeometry = new THREE.SphereGeometry(1, 32, 32);
    eyeGeometry.scale(1.3, 1, 1); // make the eye oval
    const eyeball = new THREE.Mesh(eyeGeometry, eyeMaterial);
    
    // Blinking
    eyeGroup.userData = {
        isBlinking: false,
        blinkDuration: 300, // in milliseconds
        blinkStartTime: 0
    };

    eyeGroup.add(eyeball);
    return eyeGroup;
}

// Create two eyes
const leftEye = createEye();
const rightEye = createEye();

leftEye.position.x = -2;
rightEye.position.x = 2;

scene.add(leftEye);
scene.add(rightEye);

camera.position.z = 5;

// Function to update eye blink
function updateBlink(eye) {
    const now = Date.now();
    const { isBlinking, blinkDuration, blinkStartTime } = eye.userData;
    if (isBlinking) {
        const elapsedTime = now - blinkStartTime;
        if (elapsedTime < blinkDuration / 2) {
            // Closing the eye
            eye.scale.y = Math.min(1, 1 - (elapsedTime / (blinkDuration / 2)));
        } else {
            // Opening the eye
            eye.scale.y = Math.min(1, (elapsedTime - (blinkDuration / 2)) / (blinkDuration / 2));
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

setInterval(() => {
    blink(leftEye);
    blink(rightEye);
}, 5000); // Blinks every 5 seconds

// Automatic side-to-side look
let lookDirections = [
    { x: 0, y: 0 },     // Straight
    { x: 0.5, y: -0.5 }, // Right corner
    { x: 0, y: 0.5 },   // Top corner
    { x: -0.5, y: -0.5 }, // Left corner
    { x: 0, y: -0.5 },  // Bottom
    { x: 0, y: 0 }      // Back to straight
];
let currentLookIndex = 0;
function lookAround() {
    const lookPosition = lookDirections[currentLookIndex];
    [leftEye, rightEye].forEach(eye => {
        eye.rotation.x = lookPosition.y * Math.PI / 4;
        eye.rotation.y = lookPosition.x * Math.PI / 4;
    });
    currentLookIndex = (currentLookIndex + 1) % lookDirections.length;
}
setInterval(lookAround, 5000); // Looks around every 5 seconds

// Event listener for mouse movement
let isCursorMoving = false;
window.addEventListener('mousemove', () => {
    isCursorMoving = true;
});

// Render loop
function animate() {
    requestAnimationFrame(animate);
    updateBlink(leftEye);
    updateBlink(rightEye);

    if (!isCursorMoving) {
        // Reset eyes to straight if there's no interaction with the cursor
        [leftEye, rightEye].forEach(eye => {
            eye.rotation.x = 0;
            eye.rotation.y = 0;
        });
    } else {
        isCursorMoving = false;
    }

    renderer.render(scene, camera);
}

animate();
