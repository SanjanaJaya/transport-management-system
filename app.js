// Updated app.js with all requested changes

// Login Functionality with Auto-Logout
document.addEventListener('DOMContentLoaded', function() {
    const loginSection = document.getElementById('loginSection');
    const appSection = document.getElementById('appSection');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');

    // Auto-logout variables
    let inactivityTimer;
    const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

    // Function to reset the inactivity timer
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(logoutDueToInactivity, INACTIVITY_TIMEOUT);
    }

    // Function to handle logout due to inactivity
    function logoutDueToInactivity() {
        localStorage.removeItem('isLoggedIn');
        loginSection.style.display = 'flex';
        appSection.style.display = 'none';
        showMessage('You have been automatically logged out due to inactivity', 'error');

        // Clear form fields
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        loginError.style.display = 'none';
    }

    // Set up event listeners for user activity
    function setupActivityListeners() {
        ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetInactivityTimer);
        });
    }

    // Check if user is already logged in
    if(localStorage.getItem('isLoggedIn')) {
        loginSection.style.display = 'none';
        appSection.style.display = 'block';
        initApp();
        setupActivityListeners();
        resetInactivityTimer(); // Start the inactivity timer
    } else {
        loginSection.style.display = 'flex';
        appSection.style.display = 'none';
    }

    // Login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Hardcoded credentials
        if(username === 'admin' && password === '5157') {
            localStorage.setItem('isLoggedIn', 'true');
            loginSection.style.display = 'none';
            appSection.style.display = 'block';
            initApp();
            setupActivityListeners();
            resetInactivityTimer(); // Start the inactivity timer after login
            loginError.style.display = 'none';
        } else {
            loginError.textContent = 'Invalid username or password';
            loginError.style.display = 'block';
        }
    });

    // Logout functionality
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('isLoggedIn');
        loginSection.style.display = 'flex';
        appSection.style.display = 'none';
        // Clear form fields
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        loginError.style.display = 'none';
        clearTimeout(inactivityTimer); // Clear the inactivity timer
        showMessage('You have been logged out successfully', 'success');
    });
});

// Firebase configuration
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
const auth = firebase.auth();

// DOM Elements
const vehiclesTab = document.getElementById('vehiclesTab');
const driversTab = document.getElementById('driversTab');
const hiresTab = document.getElementById('hiresTab');
const advancePaymentsTab = document.getElementById('advancePaymentsTab');
const vehiclesSection = document.getElementById('vehiclesSection');
const driversSection = document.getElementById('driversSection');
const hiresSection = document.getElementById('hiresSection');
const advancePaymentsSection = document.getElementById('advancePaymentsSection');

// Tab Switching
vehiclesTab.addEventListener('click', () => setActiveTab(vehiclesTab, vehiclesSection));
driversTab.addEventListener('click', () => setActiveTab(driversTab, driversSection));
hiresTab.addEventListener('click', () => setActiveTab(hiresTab, hiresSection));
advancePaymentsTab.addEventListener('click', () => setActiveTab(advancePaymentsTab, advancePaymentsSection));

function setActiveTab(tab, section) {
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('main section').forEach(sec => sec.classList.remove('active'));
    tab.classList.add('active');
    section.classList.add('active');
}

// Add button event listeners
document.getElementById('addVehicleBtn').addEventListener('click', () => {
    document.getElementById('vehicleForm').reset();
    document.getElementById('addVehicleModal').style.display = 'block';
});

document.getElementById('addDriverBtn').addEventListener('click', () => {
    document.getElementById('driverForm').reset();
    document.getElementById('addDriverModal').style.display = 'block';
});

document.getElementById('addHireBtn').addEventListener('click', () => {
    document.getElementById('hireForm').reset();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('hireDate').value = today;
    document.getElementById('addHireModal').style.display = 'block';
});

document.getElementById('addAdvancePaymentBtn').addEventListener('click', () => {
    document.getElementById('advancePaymentForm').reset();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('advancePaymentDate').value = today;
    document.getElementById('addAdvancePaymentModal').style.display = 'block';
});

// Vehicle Management
const vehicleForm = document.getElementById('vehicleForm');
vehicleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const vehicle = {
            vehicleNumber: document.getElementById('vehicleNumber').value,
            vehicleSize: parseFloat(document.getElementById('vehicleSize').value),
            minimumHire: parseFloat(document.getElementById('minimumHire').value),
            tier1Distance: parseFloat(document.getElementById('tier1Distance').value),
            tier1Price: parseFloat(document.getElementById('tier1Price').value),
            tier2Distance: parseFloat(document.getElementById('tier2Distance').value),
            tier2Price: parseFloat(document.getElementById('tier2Price').value),
            tier3Price: parseFloat(document.getElementById('tier3Price').value),
            waitingPrice1: parseFloat(document.getElementById('waitingPrice1').value),
            waitingPrice2: parseFloat(document.getElementById('waitingPrice2').value),
            loadingCharge: parseFloat(document.getElementById('loadingCharge').value),
            ownership: document.getElementById('ownership').value,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        await db.collection('vehicles').add(vehicle);
        vehicleForm.reset();
        document.getElementById('addVehicleModal').style.display = 'none';
        showMessage('Vehicle added successfully!', 'success');
    } catch (error) {
        console.error("Error adding vehicle:", error);
        showMessage("Failed to add vehicle. Please check console for details.", 'error');
    }
});

// Driver Management
const driverForm = document.getElementById('driverForm');
driverForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const driver = {
            name: document.getElementById('driverName').value,
            licenseNumber: document.getElementById('licenseNumber').value,
            age: parseInt(document.getElementById('driverAge').value),
            address: document.getElementById('driverAddress').value,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        await db.collection('drivers').add(driver);
        driverForm.reset();
        document.getElementById('addDriverModal').style.display = 'none';
        showMessage('Driver added successfully!', 'success');
    } catch (error) {
        console.error("Error adding driver:", error);
        showMessage("Failed to add driver. Please check console for details.", 'error');
    }
});

// Hire Management with Tiered Pricing
const hireForm = document.getElementById('hireForm');
hireForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const vehicleId = document.getElementById('hireVehicle').value;
        const vehicleDoc = await db.collection('vehicles').doc(vehicleId).get();

        if (!vehicleDoc.exists) {
            throw new Error("Selected vehicle not found");
        }

        const vehicle = vehicleDoc.data();
        const distance = parseFloat(document.getElementById('distance').value);
        
        // Calculate hire amount based on distance tiers
        let hireAmount = 0;
        if (distance <= vehicle.tier1Distance) {
            hireAmount = distance * vehicle.tier1Price;
        } else if (distance <= vehicle.tier2Distance) {
            hireAmount = (vehicle.tier1Distance * vehicle.tier1Price) + 
                        ((distance - vehicle.tier1Distance) * vehicle.tier2Price);
        } else {
            hireAmount = (vehicle.tier1Distance * vehicle.tier1Price) + 
                        ((vehicle.tier2Distance - vehicle.tier1Distance) * vehicle.tier2Price) +
                        ((distance - vehicle.tier2Distance) * vehicle.tier3Price);
        }
        
        // Apply minimum hire amount
        hireAmount = Math.max(hireAmount, vehicle.minimumHire);

        // Waiting time calculation
        const waitingHours = parseFloat(document.getElementById('waitingHours').value) || 0;
        let waitingCost = 0;
        if (waitingHours > 0) {
            if (waitingHours <= 24) {
                waitingCost = waitingHours * vehicle.waitingPrice1;
            } else {
                waitingCost = (24 * vehicle.waitingPrice1) + ((waitingHours - 24) * vehicle.waitingPrice2);
            }
        }

        // Loading charge
        const loadingCharge = document.getElementById('loading').checked ? vehicle.loadingCharge : 0;

        const hire = {
            vehicleId: vehicleId,
            vehicleNumber: vehicle.vehicleNumber,
            month: document.getElementById('hireMonth').value,
            fromLocation: document.getElementById('fromLocation').value,
            toLocation: document.getElementById('toLocation').value,
            distance: distance,
            hireDate: document.getElementById('hireDate').value,
            driverId: document.getElementById('hireDriver').value || null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            hireAmount: hireAmount + waitingCost + loadingCharge,
            waitingHours: waitingHours,
            waitingCost: waitingCost,
            loading: document.getElementById('loading').checked,
            loadingCharge: loadingCharge,
            pricingTiers: {
                tier1Distance: vehicle.tier1Distance,
                tier1Price: vehicle.tier1Price,
                tier2Distance: vehicle.tier2Distance,
                tier2Price: vehicle.tier2Price,
                tier3Price: vehicle.tier3Price,
                minimumHire: vehicle.minimumHire,
                waitingPrice1: vehicle.waitingPrice1,
                waitingPrice2: vehicle.waitingPrice2,
                loadingCharge: vehicle.loadingCharge
            }
        };

        const fuelLiters = document.getElementById('fuelLiters').value;
        const fuelPricePerLiter = document.getElementById('fuelPricePerLiter').value;

        if (fuelLiters) {
            hire.fuelLiters = parseFloat(fuelLiters);
        }
        if (fuelPricePerLiter) {
            hire.fuelPricePerLiter = parseFloat(fuelPricePerLiter);
        }
        if (fuelLiters && fuelPricePerLiter) {
            hire.fuelCost = hire.fuelLiters * hire.fuelPricePerLiter;
        }

        await db.collection('hires').add(hire);
        hireForm.reset();
        document.getElementById('addHireModal').style.display = 'none';
        showMessage('Hire record added successfully!', 'success');
    } catch (error) {
        console.error("Error adding hire:", error);
        showMessage("Failed to add hire record. Please check console for details.", 'error');
    }
});

// Advance Payment Management
const advancePaymentForm = document.getElementById('advancePaymentForm');
advancePaymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const vehicleId = document.getElementById('advancePaymentVehicle').value;
        const vehicleDoc = await db.collection('vehicles').doc(vehicleId).get();

        if (!vehicleDoc.exists) {
            throw new Error("Selected vehicle not found");
        }

        const advancePayment = {
            date: document.getElementById('advancePaymentDate').value,
            month: document.getElementById('advancePaymentMonth').value,
            vehicleId: vehicleId,
            vehicleNumber: vehicleDoc.data().vehicleNumber,
            amount: parseFloat(document.getElementById('advancePaymentAmount').value),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        await db.collection('advancePayments').add(advancePayment);
        advancePaymentForm.reset();
        document.getElementById('addAdvancePaymentModal').style.display = 'none';
        showMessage('Advance payment added successfully!', 'success');
    } catch (error) {
        console.error("Error adding advance payment:", error);
        showMessage("Failed to add advance payment. Please check console for details.", 'error');
    }
});

// Load Vehicles with real-time updates
function loadVehicles() {
    db.collection('vehicles').orderBy('createdAt').onSnapshot((snapshot) => {
        const vehiclesList = document.getElementById('vehiclesList');
        vehiclesList.innerHTML = '';
        if (snapshot.empty) {
            vehiclesList.innerHTML = '<tr><td colspan="11">No vehicles found</td></tr>';
            return;
        }
        snapshot.forEach(doc => {
            const vehicle = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${vehicle.vehicleNumber}</td>
                <td>${vehicle.vehicleSize}</td>
                <td>${vehicle.minimumHire.toFixed(2)}</td>
                <td>${vehicle.tier1Price.toFixed(2)}</td>
                <td>${vehicle.tier2Price.toFixed(2)}</td>
                <td>${vehicle.tier3Price.toFixed(2)}</td>
                <td>${vehicle.waitingPrice1.toFixed(2)}</td>
                <td>${vehicle.waitingPrice2.toFixed(2)}</td>
                <td>${vehicle.loadingCharge.toFixed(2)}</td>
                <td>${vehicle.ownership}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${doc.id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${doc.id}">Delete</button>
                </td>
            `;
            vehiclesList.appendChild(tr);
        });
        populateVehicleDropdowns(snapshot);
        setupActionListeners('vehicles'); // Add this line
    }, error => {
        console.error("Error loading vehicles:", error);
        document.getElementById('vehiclesList').innerHTML = '<tr><td colspan="11">Error loading vehicles</td></tr>';
    });
}

// Load Drivers with real-time updates
function loadDrivers() {
    db.collection('drivers').orderBy('createdAt').onSnapshot((snapshot) => {
        const driversList = document.getElementById('driversList');
        driversList.innerHTML = '';
        if (snapshot.empty) {
            driversList.innerHTML = '<tr><td colspan="5">No drivers found</td></tr>';
            return;
        }
        snapshot.forEach(doc => {
            const driver = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${driver.name}</td>
                <td>${driver.licenseNumber}</td>
                <td>${driver.age}</td>
                <td>${driver.address}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${doc.id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${doc.id}">Delete</button>
                </td>
            `;
            driversList.appendChild(tr);
        });
        populateDriverDropdowns(snapshot);
        setupActionListeners('drivers'); // Add this line
    }, error => {
        console.error("Error loading drivers:", error);
        document.getElementById('driversList').innerHTML = '<tr><td colspan="5">Error loading drivers</td></tr>';
    });
}

// Load Hires with real-time updates
async function loadHires() {
    try {
        const hiresSnapshot = await db.collection('hires').orderBy('createdAt').get();
        const driversSnapshot = await db.collection('drivers').get();
        const advancePaymentsSnapshot = await db.collection('advancePayments').get();

        const hiresList = document.getElementById('hiresList');
        hiresList.innerHTML = '';

        let totalFuel = 0;
        let totalHire = 0;
        let totalDistance = 0;
        let totalWaiting = 0;
        let totalLoading = 0;
        let totalAdvancePayments = 0;

        if (hiresSnapshot.empty) {
            hiresList.innerHTML = '<tr><td colspan="15">No hire records found</td></tr>';
            updateTotals(0, 0, 0, 0, 0, 0);
            return;
        }

        const drivers = {};
        driversSnapshot.forEach(doc => {
            drivers[doc.id] = doc.data().name;
        });

        const advancePaymentsByMonthAndVehicle = {};
        advancePaymentsSnapshot.forEach(doc => {
            const ap = doc.data();
            const key = `${ap.month}-${ap.vehicleId}`;
            advancePaymentsByMonthAndVehicle[key] = (advancePaymentsByMonthAndVehicle[key] || 0) + ap.amount;
        });

        hiresSnapshot.forEach(doc => {
            const hire = doc.data();
            const driverName = hire.driverId ? drivers[hire.driverId] || 'N/A' : 'N/A';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="text-center">${hire.hireDate}</td>
                <td class="text-center">${hire.vehicleNumber}</td>
                <td class="text-center">${hire.fromLocation}</td>
                <td class="text-center">${hire.toLocation}</td>
                <td class="text-center">${hire.distance.toFixed(2)}</td>
                <td class="text-center">${hire.fuelLiters ? hire.fuelLiters.toFixed(2) : '0.00'}</td>
                <td class="text-center">${hire.fuelPricePerLiter ? hire.fuelPricePerLiter.toFixed(2) : '0.00'}</td>
                <td class="text-center">${hire.fuelCost ? hire.fuelCost.toFixed(2) : '0.00'}</td>
                <td class="text-center">${hire.waitingHours ? hire.waitingHours.toFixed(2) : '0.00'}</td>
                <td class="text-center">${hire.waitingCost ? hire.waitingCost.toFixed(2) : '0.00'}</td>
                <td class="text-center">${hire.loading ? 'Yes' : 'No'}</td>
                <td class="text-center">${hire.loadingCharge ? hire.loadingCharge.toFixed(2) : '0.00'}</td>
                <td class="text-center">${hire.hireAmount.toFixed(2)}</td>
                <td class="text-center">${driverName}</td>
                <td class="text-center">
                    <button class="action-btn edit-btn" data-id="${doc.id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${doc.id}">Delete</button>
                </td>
            `;
            hiresList.appendChild(tr);
            
            totalDistance += hire.distance;
            totalFuel += hire.fuelCost || 0;
            totalHire += hire.hireAmount;
            totalWaiting += hire.waitingCost || 0;
            totalLoading += hire.loadingCharge || 0;
        });
        
        const currentMonth = document.getElementById('filterMonth').value;
        const currentVehicleId = document.getElementById('filterVehicle').value;

        // Calculate filtered advance payments
        if (currentMonth !== 'All' && currentVehicleId !== 'All') {
            const key = `${currentMonth}-${currentVehicleId}`;
            totalAdvancePayments = advancePaymentsByMonthAndVehicle[key] || 0;
        } else if (currentMonth !== 'All' && currentVehicleId === 'All') {
            totalAdvancePayments = Object.keys(advancePaymentsByMonthAndVehicle)
                .filter(key => key.startsWith(currentMonth))
                .reduce((sum, key) => sum + advancePaymentsByMonthAndVehicle[key], 0);
        } else if (currentMonth === 'All' && currentVehicleId !== 'All') {
            totalAdvancePayments = Object.keys(advancePaymentsByMonthAndVehicle)
                .filter(key => key.endsWith(currentVehicleId))
                .reduce((sum, key) => sum + advancePaymentsByMonthAndVehicle[key], 0);
        } else {
            totalAdvancePayments = Object.values(advancePaymentsByMonthAndVehicle)
                .reduce((sum, amount) => sum + amount, 0);
        }
        
        updateTotals(totalDistance, totalFuel, totalHire, totalWaiting, totalLoading, totalAdvancePayments);
        setupActionListeners('hires');

    } catch (error) {
        console.error("Error loading hires:", error);
        document.getElementById('hiresList').innerHTML = '<tr><td colspan="15">Error loading hire records</td></tr>';
    }
}

// Load Advance Payments with real-time updates
function loadAdvancePayments() {
    db.collection('advancePayments').orderBy('createdAt').onSnapshot((snapshot) => {
        const advancePaymentsList = document.getElementById('advancePaymentsList');
        advancePaymentsList.innerHTML = '';
        if (snapshot.empty) {
            advancePaymentsList.innerHTML = '<tr><td colspan="5">No advance payments found</td></tr>';
            return;
        }
        snapshot.forEach(doc => {
            const payment = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${payment.date}</td>
                <td>${payment.vehicleNumber}</td>
                <td>${payment.month}</td>
                <td>${payment.amount.toFixed(2)}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${doc.id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${doc.id}">Delete</button>
                </td>
            `;
            advancePaymentsList.appendChild(tr);
        });
        setupActionListeners('advancePayments');
    }, error => {
        console.error("Error loading advance payments:", error);
        document.getElementById('advancePaymentsList').innerHTML = '<tr><td colspan="5">Error loading advance payments</td></tr>';
    });
}

// Edit/Delete Functionality
function setupActionListeners(collectionName) {
    document.querySelectorAll(`#${collectionName}Section .edit-btn`).forEach(button => {
        button.addEventListener('click', (e) => handleEdit(e, collectionName));
    });

    document.querySelectorAll(`#${collectionName}Section .delete-btn`).forEach(button => {
        button.addEventListener('click', (e) => handleDelete(e, collectionName));
    });
}

// Edit Handlers
async function handleEdit(e, collectionName) {
    const id = e.target.dataset.id;
    const docRef = db.collection(collectionName).doc(id);

    try {
        const doc = await docRef.get();
        if (!doc.exists) {
            showMessage("Document not found.", 'error');
            return;
        }

        const data = doc.data();

        if (collectionName === 'vehicles') {
            document.getElementById('editVehicleId').value = id;
            document.getElementById('editVehicleNumber').value = data.vehicleNumber;
            document.getElementById('editVehicleSize').value = data.vehicleSize;
            document.getElementById('editMinimumHire').value = data.minimumHire;
            document.getElementById('editTier1Price').value = data.tier1Price;
            document.getElementById('editTier2Price').value = data.tier2Price;
            document.getElementById('editTier3Price').value = data.tier3Price;
            document.getElementById('editWaitingPrice1').value = data.waitingPrice1;
            document.getElementById('editWaitingPrice2').value = data.waitingPrice2;
            document.getElementById('editLoadingCharge').value = data.loadingCharge;
            document.getElementById('editOwnership').value = data.ownership;
            document.getElementById('editVehicleModal').style.display = 'block';
        } else if (collectionName === 'drivers') {
            document.getElementById('editDriverId').value = id;
            document.getElementById('editDriverName').value = data.name;
            document.getElementById('editLicenseNumber').value = data.licenseNumber;
            document.getElementById('editDriverAge').value = data.age;
            document.getElementById('editDriverAddress').value = data.address;
            document.getElementById('editDriverModal').style.display = 'block';
        } else if (collectionName === 'hires') {
            document.getElementById('editHireId').value = id;
            document.getElementById('editHireDate').value = data.hireDate;
            document.getElementById('editHireMonth').value = data.month;
            await populateEditHireVehicleDropdown(data.vehicleId);
            document.getElementById('editFromLocation').value = data.fromLocation;
            document.getElementById('editToLocation').value = data.toLocation;
            document.getElementById('editDistance').value = data.distance;
            document.getElementById('editFuelLiters').value = data.fuelLiters || '';
            document.getElementById('editFuelPricePerLiter').value = data.fuelPricePerLiter || '';
            document.getElementById('editWaitingHours').value = data.waitingHours || '';
            document.getElementById('editLoading').checked = data.loading || false;
            await populateEditHireDriverDropdown(data.driverId);
            document.getElementById('editHireModal').style.display = 'block';
        } else if (collectionName === 'advancePayments') {
            document.getElementById('editAdvancePaymentId').value = id;
            document.getElementById('editAdvancePaymentDate').value = data.date;
            document.getElementById('editAdvancePaymentMonth').value = data.month;
            await populateEditAdvancePaymentVehicleDropdown(data.vehicleId);
            document.getElementById('editAdvancePaymentAmount').value = data.amount;
            document.getElementById('editAdvancePaymentModal').style.display = 'block';
        }

    } catch (error) {
        console.error("Error fetching document for edit:", error);
        showMessage("Failed to load data for editing.", 'error');
    }
}

// Delete Handler
function handleDelete(e, collectionName) {
    const id = e.target.dataset.id;
    showConfirmation(`Are you sure you want to delete this ${collectionName.slice(0, -1)} record?`, async () => {
        try {
            await db.collection(collectionName).doc(id).delete();
            showMessage('Record deleted successfully!', 'success');
        } catch (error) {
            console.error("Error deleting document:", error);
            showMessage("Failed to delete record.", 'error');
        }
    });
}

// Update forms
document.getElementById('editVehicleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editVehicleId').value;
    try {
        const vehicle = {
            vehicleNumber: document.getElementById('editVehicleNumber').value,
            vehicleSize: parseFloat(document.getElementById('editVehicleSize').value),
            minimumHire: parseFloat(document.getElementById('editMinimumHire').value),
            tier1Price: parseFloat(document.getElementById('editTier1Price').value),
            tier2Price: parseFloat(document.getElementById('editTier2Price').value),
            tier3Price: parseFloat(document.getElementById('editTier3Price').value),
            waitingPrice1: parseFloat(document.getElementById('editWaitingPrice1').value),
            waitingPrice2: parseFloat(document.getElementById('editWaitingPrice2').value),
            loadingCharge: parseFloat(document.getElementById('editLoadingCharge').value),
            ownership: document.getElementById('editOwnership').value
        };
        await db.collection('vehicles').doc(id).update(vehicle);
        document.getElementById('editVehicleModal').style.display = 'none';
        showMessage('Vehicle updated successfully!', 'success');
    } catch (error) {
        console.error("Error updating vehicle:", error);
        showMessage("Failed to update vehicle.", 'error');
    }
});

document.getElementById('editDriverForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editDriverId').value;
    try {
        const driver = {
            name: document.getElementById('editDriverName').value,
            licenseNumber: document.getElementById('editLicenseNumber').value,
            age: parseInt(document.getElementById('editDriverAge').value),
            address: document.getElementById('editDriverAddress').value
        };
        await db.collection('drivers').doc(id).update(driver);
        document.getElementById('editDriverModal').style.display = 'none';
        showMessage('Driver updated successfully!', 'success');
    } catch (error) {
        console.error("Error updating driver:", error);
        showMessage("Failed to update driver.", 'error');
    }
});

document.getElementById('editHireForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editHireId').value;
    try {
        const vehicleId = document.getElementById('editHireVehicle').value;
        const vehicleDoc = await db.collection('vehicles').doc(vehicleId).get();
        if (!vehicleDoc.exists) {
            throw new Error("Selected vehicle not found");
        }
        const vehicle = vehicleDoc.data();
        const distance = parseFloat(document.getElementById('editDistance').value);

        // Calculate hire amount based on distance tiers
        let hireAmount = 0;
        if (distance <= vehicle.tier1Distance) {
            hireAmount = distance * vehicle.tier1Price;
        } else if (distance <= vehicle.tier2Distance) {
            hireAmount = (vehicle.tier1Distance * vehicle.tier1Price) + 
                        ((distance - vehicle.tier1Distance) * vehicle.tier2Price);
        } else {
            hireAmount = (vehicle.tier1Distance * vehicle.tier1Price) + 
                        ((vehicle.tier2Distance - vehicle.tier1Distance) * vehicle.tier2Price) +
                        ((distance - vehicle.tier2Distance) * vehicle.tier3Price);
        }

        // Apply minimum hire amount
        hireAmount = Math.max(hireAmount, vehicle.minimumHire);

        // Waiting time calculation
        const waitingHours = parseFloat(document.getElementById('editWaitingHours').value) || 0;
        let waitingCost = 0;
        if (waitingHours > 0) {
            if (waitingHours <= 24) {
                waitingCost = waitingHours * vehicle.waitingPrice1;
            } else {
                waitingCost = (24 * vehicle.waitingPrice1) + ((waitingHours - 24) * vehicle.waitingPrice2);
            }
        }

        // Loading charge
        const loadingCharge = document.getElementById('editLoading').checked ? vehicle.loadingCharge : 0;
        
        const hire = {
            hireDate: document.getElementById('editHireDate').value,
            month: document.getElementById('editHireMonth').value,
            vehicleId: vehicleId,
            vehicleNumber: vehicle.vehicleNumber,
            fromLocation: document.getElementById('editFromLocation').value,
            toLocation: document.getElementById('editToLocation').value,
            distance: distance,
            driverId: document.getElementById('editHireDriver').value || null,
            hireAmount: hireAmount + waitingCost + loadingCharge,
            waitingHours: waitingHours,
            waitingCost: waitingCost,
            loading: document.getElementById('editLoading').checked,
            loadingCharge: loadingCharge
        };

        const fuelLiters = document.getElementById('editFuelLiters').value;
        const fuelPricePerLiter = document.getElementById('editFuelPricePerLiter').value;

        if (fuelLiters) {
            hire.fuelLiters = parseFloat(fuelLiters);
        }
        if (fuelPricePerLiter) {
            hire.fuelPricePerLiter = parseFloat(fuelPricePerLiter);
        }
        if (fuelLiters && fuelPricePerLiter) {
            hire.fuelCost = hire.fuelLiters * hire.fuelPricePerLiter;
        }

        await db.collection('hires').doc(id).update(hire);
        document.getElementById('editHireModal').style.display = 'none';
        showMessage('Hire record updated successfully!', 'success');
    } catch (error) {
        console.error("Error updating hire record:", error);
        showMessage("Failed to update hire record.", 'error');
    }
});

document.getElementById('editAdvancePaymentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editAdvancePaymentId').value;
    try {
        const vehicleId = document.getElementById('editAdvancePaymentVehicle').value;
        const vehicleDoc = await db.collection('vehicles').doc(vehicleId).get();
        if (!vehicleDoc.exists) {
            throw new Error("Selected vehicle not found");
        }
        const advancePayment = {
            date: document.getElementById('editAdvancePaymentDate').value,
            month: document.getElementById('editAdvancePaymentMonth').value,
            vehicleId: vehicleId,
            vehicleNumber: vehicleDoc.data().vehicleNumber,
            amount: parseFloat(document.getElementById('editAdvancePaymentAmount').value)
        };
        await db.collection('advancePayments').doc(id).update(advancePayment);
        document.getElementById('editAdvancePaymentModal').style.display = 'none';
        showMessage('Advance payment updated successfully!', 'success');
    } catch (error) {
        console.error("Error updating advance payment:", error);
        showMessage("Failed to update advance payment.", 'error');
    }
});

// Helper Functions
function showMessage(message, type = 'success') {
    const msgBox = document.getElementById('messageBox');
    const msgText = document.getElementById('messageText');
    msgText.textContent = message;
    msgBox.className = `message-box ${type}`;
    msgBox.style.display = 'block';
    setTimeout(() => {
        msgBox.style.display = 'none';
    }, 5000);
}

// Confirmation modal
function showConfirmation(message, onConfirm) {
    const confirmationModal = document.getElementById('confirmationModal');
    if (!confirmationModal) {
        const confirmationModal = document.createElement('div');
        confirmationModal.id = 'confirmationModal';
        confirmationModal.className = 'modal';
        confirmationModal.innerHTML = `
            <div class="modal-content">
                <p id="confirmationMessage"></p>
                <button id="confirmYes">Yes</button>
                <button id="confirmNo">No</button>
            </div>
        `;
        document.body.appendChild(confirmationModal);

        document.getElementById('confirmYes').addEventListener('click', () => {
            onConfirm();
            confirmationModal.style.display = 'none';
        });

        document.getElementById('confirmNo').addEventListener('click', () => {
            confirmationModal.style.display = 'none';
        });

        confirmationModal.addEventListener('click', (e) => {
            if (e.target === confirmationModal) {
                confirmationModal.style.display = 'none';
            }
        });
    }

    document.getElementById('confirmationMessage').textContent = message;
    confirmationModal.style.display = 'block';
}

// Close modals
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        closeBtn.closest('.modal').style.display = 'none';
    });
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal') && e.target.id !== 'confirmationModal') {
        e.target.style.display = 'none';
    }
});

// Update total sections
function updateTotals(totalDistance, totalFuel, totalHire, totalWaiting, totalLoading, totalAdvancePayments) {
    document.getElementById('totalDistance').textContent = totalDistance.toFixed(2);
    document.getElementById('totalFuelCost').textContent = totalFuel.toFixed(2);
    document.getElementById('totalWaitingCost').textContent = totalWaiting.toFixed(2);
    
    const totalIncome = totalHire;
    const netIncome = totalIncome - totalFuel - totalAdvancePayments;
    document.getElementById('netIncome').textContent = netIncome.toFixed(2);
}

// Filter functionality
document.getElementById('applyFilter').addEventListener('click', filterHires);
async function filterHires() {
    try {
        const month = document.getElementById('filterMonth').value;
        const vehicleId = document.getElementById('filterVehicle').value;

        let query = db.collection('hires').orderBy('createdAt');
        if (month !== 'All') {
            query = query.where('month', '==', month);
        }
        if (vehicleId !== 'All') {
            query = query.where('vehicleId', '==', vehicleId);
        }

        const hiresSnapshot = await query.get();
        const hiresList = document.getElementById('hiresList');
        hiresList.innerHTML = '';

        let totalFuel = 0;
        let totalHire = 0;
        let totalDistance = 0;
        let totalWaiting = 0;
        let totalLoading = 0;
        let totalAdvancePayments = 0;

        if (hiresSnapshot.empty) {
            hiresList.innerHTML = '<tr><td colspan="15">No hire records found for selected filters</td></tr>';
            updateTotals(0, 0, 0, 0, 0, 0);
            return;
        }

        const driversSnapshot = await db.collection('drivers').get();
        const drivers = {};
        driversSnapshot.forEach(doc => {
            drivers[doc.id] = doc.data().name;
        });

        const advancePaymentsSnapshot = await db.collection('advancePayments').get();
        const advancePaymentsByMonthAndVehicle = {};
        advancePaymentsSnapshot.forEach(doc => {
            const ap = doc.data();
            const key = `${ap.month}-${ap.vehicleId}`;
            advancePaymentsByMonthAndVehicle[key] = (advancePaymentsByMonthAndVehicle[key] || 0) + ap.amount;
        });

        hiresSnapshot.forEach(doc => {
            const hire = doc.data();
            const driverName = hire.driverId ? drivers[hire.driverId] || 'N/A' : 'N/A';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="text-center">${hire.hireDate}</td>
                <td class="text-center">${hire.vehicleNumber}</td>
                <td class="text-center">${hire.fromLocation}</td>
                <td class="text-center">${hire.toLocation}</td>
                <td class="text-center">${hire.distance.toFixed(2)}</td>
                <td class="text-center">${hire.fuelLiters ? hire.fuelLiters.toFixed(2) : '0.00'}</td>
                <td class="text-center">${hire.fuelPricePerLiter ? hire.fuelPricePerLiter.toFixed(2) : '0.00'}</td>
                <td class="text-center">${hire.fuelCost ? hire.fuelCost.toFixed(2) : '0.00'}</td>
                <td class="text-center">${hire.waitingHours ? hire.waitingHours.toFixed(2) : '0.00'}</td>
                <td class="text-center">${hire.waitingCost ? hire.waitingCost.toFixed(2) : '0.00'}</td>
                <td class="text-center">${hire.loading ? 'Yes' : 'No'}</td>
                <td class="text-center">${hire.loadingCharge ? hire.loadingCharge.toFixed(2) : '0.00'}</td>
                <td class="text-center">${hire.hireAmount.toFixed(2)}</td>
                <td class="text-center">${driverName}</td>
                <td class="text-center">
                    <button class="action-btn edit-btn" data-id="${doc.id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${doc.id}">Delete</button>
                </td>
            `;
            hiresList.appendChild(tr);

            totalDistance += hire.distance;
            totalFuel += hire.fuelCost || 0;
            totalHire += hire.hireAmount;
            totalWaiting += hire.waitingCost || 0;
            totalLoading += hire.loadingCharge || 0;
        });

        // Calculate filtered advance payments
        const currentMonth = document.getElementById('filterMonth').value;
        const currentVehicleId = document.getElementById('filterVehicle').value;
        
        if (currentMonth !== 'All' && currentVehicleId !== 'All') {
            const key = `${currentMonth}-${currentVehicleId}`;
            totalAdvancePayments = advancePaymentsByMonthAndVehicle[key] || 0;
        } else if (currentMonth !== 'All' && currentVehicleId === 'All') {
            totalAdvancePayments = Object.keys(advancePaymentsByMonthAndVehicle)
                .filter(key => key.startsWith(currentMonth))
                .reduce((sum, key) => sum + advancePaymentsByMonthAndVehicle[key], 0);
        } else if (currentMonth === 'All' && currentVehicleId !== 'All') {
            totalAdvancePayments = Object.keys(advancePaymentsByMonthAndVehicle)
                .filter(key => key.endsWith(vehicleId))
                .reduce((sum, key) => sum + advancePaymentsByMonthAndVehicle[key], 0);
        } else {
            totalAdvancePayments = Object.values(advancePaymentsByMonthAndVehicle)
                .reduce((sum, amount) => sum + amount, 0);
        }

        updateTotals(totalDistance, totalFuel, totalHire, totalWaiting, totalLoading, totalAdvancePayments);
        setupActionListeners('hires');

    } catch (error) {
        console.error("Error filtering hires:", error);
        showMessage("Failed to filter records. Please check console for details.", 'error');
    }
}

// PDF Export
document.getElementById('exportPdfBtn').addEventListener('click', exportPdf);

async function exportPdf() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape');

        const month = document.getElementById('filterMonth').value;
        const vehicleId = document.getElementById('filterVehicle').value;

        let vehicleName = "All Vehicles";
        if (vehicleId !== "All") {
            const vehicleSelect = document.getElementById('filterVehicle');
            const selectedOption = vehicleSelect.options[vehicleSelect.selectedIndex];
            vehicleName = selectedOption.text;
        }

        const logoUrl = 'https://i.postimg.cc/jSbPKGXw/PDF-logo.png';
        
        // Asynchronously load the logo
        const img = new Image();
        img.src = logoUrl;

        img.onload = async function() {
            await generatePdfContent(doc, img, month, vehicleId, vehicleName);
        };

        img.onerror = async function() {
            await generatePdfContent(doc, null, month, vehicleId, vehicleName);
        };
        
    } catch (error) {
        console.error("Error generating PDF:", error);
        showMessage("Failed to generate PDF. Please check console for details.", 'error');
    }
}

async function generatePdfContent(doc, logoImg, month, vehicleId, vehicleName) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10; // Reduced margin for more space
    let yOffset = 10;

    // Add logo if available
    if (logoImg) {
        const imgWidth = 30;
        const imgHeight = 30;
        const x = (pageWidth - imgWidth) / 2;
        doc.addImage(logoImg, 'PNG', x, yOffset, imgWidth, imgHeight);
        yOffset += imgHeight + 5;
    }

    // Header text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(231, 76, 60); // Red color
    doc.text('JAYASOORIYA TRANSPORT', pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 8;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Black color
    doc.text('Vehicle Hire Report', pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 8;

    // Filter information
    doc.setFontSize(10);
    doc.text(`Month: ${month === 'All' ? 'All Months' : month}`, margin, yOffset);
    doc.text(`Vehicle: ${vehicleName}`, pageWidth - margin, yOffset, { align: 'right' });
    yOffset += 7;
    
    const today = new Date();
    doc.text(`Report Date: ${today.toLocaleDateString()}`, margin, yOffset);
    yOffset += 10;

    // Fetch data from Firestore
    let query = db.collection('hires').orderBy('createdAt');
    if (month !== 'All') {
        query = query.where('month', '==', month);
    }
    if (vehicleId !== 'All') {
        query = query.where('vehicleId', '==', vehicleId);
    }

    const hiresSnapshot = await query.get();
    const driversSnapshot = await db.collection('drivers').get();
    const drivers = {};
    driversSnapshot.forEach(doc => {
        drivers[doc.id] = doc.data().name;
    });

    // Prepare data for the table
    const rows = [];
    let totalDistance = 0;
    let totalFuel = 0;
    let totalHire = 0;
    let totalWaiting = 0;
    let totalLoading = 0;

    hiresSnapshot.forEach(doc => {
        const hire = doc.data();
        const driverName = hire.driverId ? drivers[hire.driverId] || 'N/A' : 'N/A';
        rows.push([
            hire.hireDate,
            hire.vehicleNumber,
            hire.fromLocation,
            hire.toLocation,
            hire.distance.toFixed(2),
            hire.fuelLiters ? hire.fuelLiters.toFixed(2) : '0.00',
            hire.fuelPricePerLiter ? hire.fuelPricePerLiter.toFixed(2) : '0.00',
            hire.fuelCost ? hire.fuelCost.toFixed(2) : '0.00',
            hire.waitingHours ? hire.waitingHours.toFixed(2) : '0.00',
            hire.waitingCost ? hire.waitingCost.toFixed(2) : '0.00',
            hire.loading ? 'Yes' : 'No',
            hire.loadingCharge ? hire.loadingCharge.toFixed(2) : '0.00',
            hire.hireAmount.toFixed(2),
            driverName
        ]);
        
        // Update totals
        totalDistance += hire.distance;
        totalFuel += hire.fuelCost || 0;
        totalHire += hire.hireAmount;
        totalWaiting += hire.waitingCost || 0;
        totalLoading += hire.loadingCharge || 0;
    });

    if (hiresSnapshot.empty) {
        doc.setFontSize(10);
        doc.text('No hire records found for selected filter', margin, yOffset);
    } else {
        // Define column headers
        const headers = [
            ['Date', 'Vehicle', 'From', 'To', 'Distance', 'Fuel (L)', 'Fuel Price', 'Fuel Cost', 
             'Waiting (Hrs)', 'Waiting Cost', 'Loading', 'Loading Charge', 'Hire Amount', 'Driver']
        ];
        
        // Calculate column widths to maximize space
        const availableWidth = pageWidth - (margin * 2);
        const columnStyles = {
            0: { cellWidth: 20 },  // Date
            1: { cellWidth: 20 },  // Vehicle
            2: { cellWidth: 25 },  // From
            3: { cellWidth: 25 },  // To
            4: { cellWidth: 18 },  // Distance
            5: { cellWidth: 12 },  // Fuel (L)
            6: { cellWidth: 15 },  // Fuel Price
            7: { cellWidth: 18 },  // Fuel Cost
            8: { cellWidth: 18 },  // Waiting (Hrs)
            9: { cellWidth: 20 },  // Waiting Cost
            10: { cellWidth: 18 }, // Loading
            11: { cellWidth: 20 }, // Loading Charge
            12: { cellWidth: 20 }, // Hire Amount
            13: { cellWidth: 28 }  // Driver
        };

        // Create the table with full width
        doc.autoTable({
            startY: yOffset + 5,
            head: headers,
            body: rows,
            theme: 'grid',
            margin: { left: margin, right: margin },
            tableWidth: 'wrap',
            styles: {
                overflow: 'linebreak',
                cellPadding: 2,
                fontSize: 7,
                valign: 'middle'
            },
            headStyles: {
                fillColor: [231, 76, 60], // Red header
                textColor: [255, 255, 255], // White text
                fontSize: 8,
                halign: 'center',
                cellPadding: 3
            },
            bodyStyles: {
                fontSize: 7,
                cellPadding: 2,
                overflow: 'linebreak',
                halign: 'center'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245] // Light gray for alternate rows
            },
            columnStyles: columnStyles,
            didDrawPage: function(data) {
                // Add page numbers
                const pageCount = doc.internal.getNumberOfPages();
                doc.setFontSize(8);
                doc.text(`Page ${data.pageNumber} of ${pageCount}`, 
                        pageWidth / 2, 
                        pageHeight - 10, 
                        { align: 'center' });
            }
        });
        
        // Get the final Y position after the table
        yOffset = doc.autoTable.previous.finalY + 10;

        // Check if we need a new page for the totals
        if (yOffset + 50 > pageHeight - 20) {
            doc.addPage('landscape');
            yOffset = 20;
        }

        // Calculate total advance payments
        const advancePaymentsSnapshot = await db.collection('advancePayments').get();
        const advancePaymentsByMonthAndVehicle = {};
        advancePaymentsSnapshot.forEach(doc => {
            const ap = doc.data();
            const key = `${ap.month}-${ap.vehicleId}`;
            advancePaymentsByMonthAndVehicle[key] = (advancePaymentsByMonthAndVehicle[key] || 0) + ap.amount;
        });

        let totalAdvancePayments = 0;
        if (month !== 'All' && vehicleId !== 'All') {
            const key = `${month}-${vehicleId}`;
            totalAdvancePayments = advancePaymentsByMonthAndVehicle[key] || 0;
        } else if (month !== 'All' && vehicleId === 'All') {
            totalAdvancePayments = Object.keys(advancePaymentsByMonthAndVehicle)
                .filter(key => key.startsWith(month))
                .reduce((sum, key) => sum + advancePaymentsByMonthAndVehicle[key], 0);
        } else if (month === 'All' && vehicleId !== 'All') {
            totalAdvancePayments = Object.keys(advancePaymentsByMonthAndVehicle)
                .filter(key => key.endsWith(vehicleId))
                .reduce((sum, key) => sum + advancePaymentsByMonthAndVehicle[key], 0);
        } else {
            totalAdvancePayments = Object.values(advancePaymentsByMonthAndVehicle)
                .reduce((sum, amount) => sum + amount, 0);
        }

        const netProfit = totalHire - totalFuel - totalAdvancePayments;

        // Add totals section with better layout
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        // First row of totals
        doc.text(`Total Distance: ${totalDistance.toFixed(2)} KM`, margin, yOffset);
        doc.text(`Total Fuel Cost: LKR ${totalFuel.toFixed(2)}`, margin + 70, yOffset);
        doc.text(`Total Waiting Cost: LKR ${totalWaiting.toFixed(2)}`, margin + 140, yOffset);
        yOffset += 7;
        
        // Second row of totals
        doc.text(`Total Loading Charges: LKR ${totalLoading.toFixed(2)}`, margin, yOffset);
        doc.text(`Total Hire Amount: LKR ${totalHire.toFixed(2)}`, margin + 70, yOffset);
        doc.text(`Total Advance Payments: LKR ${totalAdvancePayments.toFixed(2)}`, margin + 140, yOffset);
        yOffset += 10;
        
        // Add net profit with emphasis
        doc.setFontSize(12);
        doc.setTextColor(231, 76, 60); // Red color
        doc.text(`Net Profit (After Advances): LKR ${netProfit.toFixed(2)}`, margin, yOffset);
        yOffset += 15;

        // Add footer note
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('This is a system-generated report, no signature is required.', 
                pageWidth / 2, 
                yOffset, 
                { align: 'center' });
    }

    // Save the PDF
    doc.save(`Hire_Report_${month === 'All' ? 'All_Months' : month}_${vehicleName.replace(/ /g, '_')}.pdf`);
    showMessage('PDF exported successfully!', 'success');
}

// Dropdown population
async function populateVehicleDropdowns(snapshot) {
    const hireVehicle = document.getElementById('hireVehicle');
    const editHireVehicle = document.getElementById('editHireVehicle');
    const filterVehicle = document.getElementById('filterVehicle');
    const advancePaymentVehicle = document.getElementById('advancePaymentVehicle');
    const editAdvancePaymentVehicle = document.getElementById('editAdvancePaymentVehicle');
    
    // Clear existing options, keep the default one
    const dropdowns = [hireVehicle, editHireVehicle, filterVehicle, advancePaymentVehicle, editAdvancePaymentVehicle];
    dropdowns.forEach(dropdown => {
        let options = Array.from(dropdown.options);
        options.filter(opt => opt.value !== '').forEach(opt => opt.remove());
    });

    if (snapshot.empty) return;

    snapshot.forEach(doc => {
        const vehicle = doc.data();
        const option = new Option(vehicle.vehicleNumber, doc.id);
        
        hireVehicle.add(option.cloneNode(true));
        editHireVehicle.add(option.cloneNode(true));
        filterVehicle.add(option.cloneNode(true));
        advancePaymentVehicle.add(option.cloneNode(true));
        editAdvancePaymentVehicle.add(option.cloneNode(true));
    });
}

async function populateDriverDropdowns(snapshot) {
    const hireDriver = document.getElementById('hireDriver');
    const editHireDriver = document.getElementById('editHireDriver');

    // Clear existing options, keep the default one
    const dropdowns = [hireDriver, editHireDriver];
    dropdowns.forEach(dropdown => {
        let options = Array.from(dropdown.options);
        options.filter(opt => opt.value !== '').forEach(opt => opt.remove());
    });
    
    if (snapshot.empty) return;

    snapshot.forEach(doc => {
        const driver = doc.data();
        const option = new Option(driver.name, doc.id);
        
        hireDriver.add(option.cloneNode(true));
        editHireDriver.add(option.cloneNode(true));
    });
}

async function populateEditHireVehicleDropdown(selectedId) {
    const dropdown = document.getElementById('editHireVehicle');
    const vehiclesSnapshot = await db.collection('vehicles').get();
    dropdown.innerHTML = '<option value="">Select Vehicle</option>';
    vehiclesSnapshot.forEach(doc => {
        const vehicle = doc.data();
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = vehicle.vehicleNumber;
        if (doc.id === selectedId) {
            option.selected = true;
        }
        dropdown.appendChild(option);
    });
}

async function populateEditHireDriverDropdown(selectedId) {
    const dropdown = document.getElementById('editHireDriver');
    const driversSnapshot = await db.collection('drivers').get();
    dropdown.innerHTML = '<option value="">Select Driver</option>';
    driversSnapshot.forEach(doc => {
        const driver = doc.data();
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = driver.name;
        if (doc.id === selectedId) {
            option.selected = true;
        }
        dropdown.appendChild(option);
    });
}

async function populateEditAdvancePaymentVehicleDropdown(selectedId) {
    const dropdown = document.getElementById('editAdvancePaymentVehicle');
    const vehiclesSnapshot = await db.collection('vehicles').get();
    dropdown.innerHTML = '<option value="">Select Vehicle</option>';
    vehiclesSnapshot.forEach(doc => {
        const vehicle = doc.data();
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = vehicle.vehicleNumber;
        if (doc.id === selectedId) {
            option.selected = true;
        }
        dropdown.appendChild(option);
    });
}

// Initialize the app
function initApp() {
    // Load all data
    loadVehicles();
    loadDrivers();
    loadHires();
    loadAdvancePayments();

    // Initialize totals display
    updateTotals(0, 0, 0, 0, 0, 0);
}