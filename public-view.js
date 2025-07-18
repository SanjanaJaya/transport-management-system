// Firebase configuration (re-use from app.js)
const firebaseConfig = {
    apiKey: "AIzaSyCUjMB_SYfE1g4wTXX8bjqrjVx61dfoL5E",
    authDomain: "jayasooriya-enterprises-c566f.firebaseapp.com",
    projectId: "jayasooriya-enterprises-c566f",
    storageBucket: "jayasooriya-enterprises-c566f.appspot.com",
    messagingSenderId: "1032442592255",
    appId: "1:1032442592255:web:6249c6a6a4c033da0385ca",
    measurementId: "G-RFEXG02DJV"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth(); // Initialize Firebase Auth

document.addEventListener('DOMContentLoaded', async () => {
    // Get vehicleId from URL
    const urlParams = new URLSearchParams(window.location.search);
    const vehicleId = urlParams.get('vehicleId');

    const publicViewTitle = document.getElementById('publicViewTitle');
    const vehicleInfoDisplay = document.getElementById('vehicleInfoDisplay');
    const publicHiresList = document.getElementById('publicHiresList');
    const publicTotalDistance = document.getElementById('publicTotalDistance');
    const noDataMessage = document.getElementById('noDataMessage');

    if (!vehicleId) {
        publicViewTitle.textContent = 'Error: Vehicle Not Specified';
        vehicleInfoDisplay.textContent = 'Please provide a valid vehicle ID in the URL.';
        noDataMessage.style.display = 'block';
        return;
    }

    // Sign in anonymously to allow read access based on security rules
    try {
        await auth.signInAnonymously();
        console.log("Signed in anonymously for public view.");
    } catch (error) {
        console.error("Error signing in anonymously:", error);
        publicViewTitle.textContent = 'Error Loading Data';
        vehicleInfoDisplay.textContent = 'Could not connect to the database. Please try again later.';
        noDataMessage.style.display = 'block';
        return;
    }

    // Fetch vehicle details
    let vehicleNumber = 'Unknown Vehicle';
    try {
        const vehicleDoc = await db.collection('vehicles').doc(vehicleId).get();
        if (vehicleDoc.exists) {
            const vehicleData = vehicleDoc.data();
            vehicleNumber = vehicleData.vehicleNumber;
            publicViewTitle.textContent = `Live Hires for ${vehicleNumber}`;
            vehicleInfoDisplay.textContent = `Vehicle Number: ${vehicleData.vehicleNumber}, Size: ${vehicleData.vehicleSize}ft`;
        } else {
            publicViewTitle.textContent = 'Vehicle Not Found';
            vehicleInfoDisplay.textContent = 'The specified vehicle ID does not exist.';
            noDataMessage.style.display = 'block';
            return;
        }
    } catch (error) {
        console.error("Error fetching vehicle details:", error);
        publicViewTitle.textContent = 'Error Loading Vehicle Details';
        vehicleInfoDisplay.textContent = 'Could not retrieve vehicle information.';
        noDataMessage.style.display = 'block';
        return;
    }

    // Listen for real-time updates on hires for this specific vehicle
    db.collection('hires')
      .where('vehicleId', '==', vehicleId)
      .orderBy('hireDate', 'desc') // Order by date, most recent first
      .onSnapshot(snapshot => {
        publicHiresList.innerHTML = '';
        let totalDistance = 0;

        if (snapshot.empty) {
            noDataMessage.style.display = 'block';
            publicTotalDistance.textContent = '0.0';
            return;
        } else {
            noDataMessage.style.display = 'none';
        }

        snapshot.forEach(doc => {
            const hire = doc.data();
            totalDistance += hire.distance || 0;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${hire.hireDate}</td>
                <td>${hire.fromLocation}</td>
                <td>${hire.toLocation}</td>
                <td>${hire.distance.toFixed(1)}</td>
            `;
            publicHiresList.appendChild(tr);
        });

        publicTotalDistance.textContent = totalDistance.toFixed(1);
    }, error => {
        console.error("Error loading public hires:", error);
        publicHiresList.innerHTML = '<tr><td colspan="4">Error loading hire records.</td></tr>';
        publicTotalDistance.textContent = '0.0';
        noDataMessage.style.display = 'block'; // Show message on error
    });
});
