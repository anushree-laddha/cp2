// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCiqhGjRfr_vvos0VWcV1xtkN5Tarw06rs",
  authDomain: "login-b3275.firebaseapp.com",
  projectId: "login-b3275",
  storageBucket: "login-b3275.appspot.com",
  messagingSenderId: "281856601541",
  appId: "1:281856601541:web:3bc6bb035ed64a53886fac",
  measurementId: "G-37QCBENNRZ"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence()
  .catch((err) => {
    console.error("Firestore persistence failed:", err);
  });

// Firestore settings
db.settings({
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});

console.log("Firebase initialized successfully");

// Initialize particles.js on auth pages
function initParticles() {
  if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
      "particles": {
        "number": {
          "value": 80,
          "density": {
            "enable": true,
            "value_area": 800
          }
        },
        "color": {
          "value": "#6e45e2"
        },
        "shape": {
          "type": "circle",
          "stroke": {
            "width": 0,
            "color": "#000000"
          },
          "polygon": {
            "nb_sides": 5
          }
        },
        "opacity": {
          "value": 0.3,
          "random": false,
          "anim": {
            "enable": false,
            "speed": 1,
            "opacity_min": 0.1,
            "sync": false
          }
        },
        "size": {
          "value": 3,
          "random": true,
          "anim": {
            "enable": false,
            "speed": 40,
            "size_min": 0.1,
            "sync": false
          }
        },
        "line_linked": {
          "enable": true,
          "distance": 150,
          "color": "#6e45e2",
          "opacity": 0.2,
          "width": 1
        },
        "move": {
          "enable": true,
          "speed": 2,
          "direction": "none",
          "random": false,
          "straight": false,
          "out_mode": "out",
          "bounce": false,
          "attract": {
            "enable": false,
            "rotateX": 600,
            "rotateY": 1200
          }
        }
      },
      "interactivity": {
        "detect_on": "canvas",
        "events": {
          "onhover": {
            "enable": true,
            "mode": "grab"
          },
          "onclick": {
            "enable": true,
            "mode": "push"
          },
          "resize": true
        },
        "modes": {
          "grab": {
            "distance": 140,
            "line_linked": {
              "opacity": 1
            }
          },
          "bubble": {
            "distance": 400,
            "size": 40,
            "duration": 2,
            "opacity": 8,
            "speed": 3
          },
          "repulse": {
            "distance": 200,
            "duration": 0.4
          },
          "push": {
            "particles_nb": 4
          },
          "remove": {
            "particles_nb": 2
          }
        }
      },
      "retina_detect": true
    });
  }
}

// Initialize 3D floating cubes
function init3DCubes() {
  if (typeof THREE !== 'undefined') {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.querySelector('.floating-cubes').appendChild(renderer.domElement);

    // Add cubes
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x6e45e2,
      transparent: true,
      opacity: 0.1,
      wireframe: true
    });
    
    const cubes = [];
    for (let i = 0; i < 5; i++) {
      const cube = new THREE.Mesh(geometry, material);
      cube.position.x = Math.random() * 10 - 5;
      cube.position.y = Math.random() * 10 - 5;
      cube.position.z = Math.random() * 10 - 5;
      cube.rotation.x = Math.random() * Math.PI;
      cube.rotation.y = Math.random() * Math.PI;
      cubes.push(cube);
      scene.add(cube);
    }

    camera.position.z = 5;

    // Animation
    function animate() {
      requestAnimationFrame(animate);
      
      cubes.forEach(cube => {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
      });
      
      renderer.render(scene, camera);
    }
    
    animate();

    // Handle resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
}

// Create user document in Firestore
async function createUserDocument(user, additionalData) {
  if (!user) return;

  const userRef = db.collection('users').doc(user.uid);
  const snapshot = await userRef.get();

  if (!snapshot.exists) {
    const { email, displayName } = user;
    let username = additionalData?.username || 
                 displayName || 
                 email.split('@')[0] || 
                 `Guest${Math.floor(Math.random() * 9000) + 1000}`;
    
    // Ensure username is not empty
    username = username.trim() || `Guest${Math.floor(Math.random() * 9000) + 1000}`;

    try {
      await userRef.set({
        username: username,
        email: email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastPlayed: firebase.firestore.FieldValue.serverTimestamp(),
        ...additionalData
      });
    } catch (error) {
      console.error("Error creating user document:", error);
    }
  } else if (!snapshot.data().username) {
    // If user exists but has no username, set one
    const { email } = user;
    const username = email.split('@')[0] || `Guest${Math.floor(Math.random() * 9000) + 1000}`;
    await userRef.update({
      username: username,
      lastPlayed: firebase.firestore.FieldValue.serverTimestamp()
    });
  }
  return userRef;
}

// Check and create indexes if needed
async function checkIndexes() {
  try {
      // This is just to trigger the index creation error if needed
      await db.collection('scores')
          .where('gameName', '==', 'Word Guess')
          .orderBy('score', 'asc')
          .limit(1)
          .get();
          
      await db.collection('scores')
          .where('gameName', '==', 'Number Guess')
          .orderBy('score', 'asc')
          .limit(1)
          .get();
  } catch (error) {
      console.log("Index creation might be needed:", error);
      // The error will contain a link to create the required index
  }
}

// Initialize 3D elements on page load
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('particles-js')) {
    initParticles();
  }
  
  if (document.querySelector('.floating-cubes')) {
    init3DCubes();
  }

  // Check indexes when leaderboard loads
    if (window.location.pathname.includes('leaderboard.html')) {
        checkIndexes();
    }
});