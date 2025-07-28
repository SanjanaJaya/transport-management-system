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
const auth = firebase.auth(); // Initialize Firebase Auth

// DOM Elements
const vehiclesTab = document.getElementById('vehiclesTab');
const driversTab = document.getElementById('driversTab');
const hiresTab = document.getElementById('hiresTab');
const vehiclesSection = document.getElementById('vehiclesSection');
const driversSection = document.getElementById('driversSection');
const hiresSection = document.getElementById('hiresSection');

// Tab Switching
vehiclesTab.addEventListener('click', () => setActiveTab(vehiclesTab, vehiclesSection));
driversTab.addEventListener('click', () => setActiveTab(driversTab, driversSection));
hiresTab.addEventListener('click', () => setActiveTab(hiresTab, hiresSection));

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
    // Set current date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('hireDate').value = today;
    document.getElementById('addHireModal').style.display = 'block';
});

// Vehicle Management
const vehicleForm = document.getElementById('vehicleForm');
vehicleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const vehicle = {
            vehicleNumber: document.getElementById('vehicleNumber').value,
            vehicleSize: document.getElementById('vehicleSize').value,
            perKmPrice: parseFloat(document.getElementById('perKmPrice').value),
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

// Hire Management - Fuel fields completely optional
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
        const hire = {
            vehicleId: vehicleId,
            vehicleNumber: vehicle.vehicleNumber,
            month: document.getElementById('hireMonth').value,
            fromLocation: document.getElementById('fromLocation').value,
            toLocation: document.getElementById('toLocation').value,
            distance: parseFloat(document.getElementById('distance').value),
            perKmPrice: vehicle.perKmPrice,
            hireDate: document.getElementById('hireDate').value,
            driverId: document.getElementById('hireDriver').value || null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            hireAmount: parseFloat(document.getElementById('distance').value) * vehicle.perKmPrice
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

// Load Vehicles with real-time updates
function loadVehicles() {
    db.collection('vehicles').orderBy('createdAt').onSnapshot((snapshot) => {
        const vehiclesList = document.getElementById('vehiclesList');
        vehiclesList.innerHTML = '';

        if (snapshot.empty) {
            vehiclesList.innerHTML = '<tr><td colspan="5">No vehicles found</td></tr>';
            return;
        }

        snapshot.forEach(doc => {
            const vehicle = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${vehicle.vehicleNumber}</td>
                <td>${vehicle.vehicleSize}</td>
                <td>${vehicle.perKmPrice.toFixed(2)}</td>
                <td>${vehicle.ownership}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${doc.id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${doc.id}">Delete</button>
                    <button class="action-btn view-link-btn" data-id="${doc.id}" data-vehicle-number="${vehicle.vehicleNumber}">View Link</button>
                </td>
            `;
            vehiclesList.appendChild(tr);
        });

        populateVehicleDropdowns(snapshot);
    }, error => {
        console.error("Error loading vehicles:", error);
        document.getElementById('vehiclesList').innerHTML = '<tr><td colspan="5">Error loading vehicles</td></tr>';
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
    }, error => {
        console.error("Error loading drivers:", error);
        document.getElementById('driversList').innerHTML = '<tr><td colspan="5">Error loading drivers</td></tr>';
    });
}

// Load Hires with real-time updates (Fuel fields optional)
function loadHires() {
    db.collection('hires').orderBy('createdAt').onSnapshot(async (snapshot) => {
        const hiresList = document.getElementById('hiresList');
        hiresList.innerHTML = '';
        let totalFuel = 0;
        let totalHire = 0;
        let totalDistance = 0; // New variable for total distance

        if (snapshot.empty) {
            hiresList.innerHTML = '<tr><td colspan="12">No hire records found</td></tr>';
            updateTotals(0, 0, 0); // Update with total distance
            return;
        }

        // Get all drivers for display
        const driversSnapshot = await db.collection('drivers').get();
        const drivers = {};
        driversSnapshot.forEach(doc => {
            drivers[doc.id] = doc.data().name;
        });

        snapshot.forEach(doc => {
            const hire = doc.data();
            totalHire += hire.hireAmount || 0;
            totalDistance += hire.distance || 0; // Accumulate total distance

            if (hire.fuelCost) {
                totalFuel += hire.fuelCost;
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${hire.hireDate}</td>
                <td>${hire.vehicleNumber}</td>
                <td>${hire.fromLocation}</td>
                <td>${hire.toLocation}</td>
                <td>${hire.distance.toFixed(1)}</td>
                <td>${hire.fuelLiters ? hire.fuelLiters.toFixed(1) : '-'}</td>
                <td>${hire.fuelPricePerLiter ? hire.fuelPricePerLiter.toFixed(2) : '-'}</td>
                <td>${hire.fuelCost ? hire.fuelCost.toFixed(2) : '-'}</td>
                <td>${hire.perKmPrice.toFixed(2)}</td>
                <td>${hire.hireAmount.toFixed(2)}</td>
                <td>${hire.driverId ? (drivers[hire.driverId] || 'N/A') : 'N/A'}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${doc.id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${doc.id}">Delete</button>
                </td>
            `;
            hiresList.appendChild(tr);
        });

        updateTotals(totalFuel, totalHire, totalDistance); // Pass total distance
    }, error => {
        console.error("Error loading hires:", error);
        document.getElementById('hiresList').innerHTML = '<tr><td colspan="12">Error loading hire records</td></tr>';
        updateTotals(0, 0, 0); // Pass total distance
    });
}

// Modified updateTotals function to include totalDistance
function updateTotals(fuelCost, hireAmount, totalDistance) {
    document.getElementById('totalFuelCost').textContent = fuelCost.toFixed(2);
    document.getElementById('totalHireAmount').textContent = hireAmount.toFixed(2);
    document.getElementById('netProfit').textContent = (hireAmount - fuelCost).toFixed(2);
    document.getElementById('totalDistance').textContent = totalDistance.toFixed(1); // Update total distance
}

// Populate vehicle dropdowns
function populateVehicleDropdowns(vehiclesSnapshot) {
    const dropdowns = [
        document.getElementById('hireVehicle'),
        document.getElementById('editHireVehicle'),
        document.getElementById('filterVehicle')
    ];

    dropdowns.forEach(dropdown => {
        while (dropdown.options.length > 1) dropdown.remove(1);

        if (!vehiclesSnapshot.empty) {
            vehiclesSnapshot.forEach(doc => {
                const vehicle = doc.data();
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = `${vehicle.vehicleNumber} (${vehicle.vehicleSize})`;
                dropdown.appendChild(option);
            });
        }
    });
}

// Populate driver dropdowns
function populateDriverDropdowns(driversSnapshot) {
    const dropdowns = [
        document.getElementById('hireDriver'),
        document.getElementById('editHireDriver')
    ];

    dropdowns.forEach(dropdown => {
        while (dropdown.options.length > 1) dropdown.remove(1);

        if (!driversSnapshot.empty) {
            driversSnapshot.forEach(doc => {
                const driver = doc.data();
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = `${driver.name} (${driver.licenseNumber})`;
                dropdown.appendChild(option);
            });
        }
    });
}

// Edit and Delete functionality
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const id = e.target.getAttribute('data-id');
        const table = e.target.closest('table').id;

        showConfirmation('Are you sure you want to delete this record?', async () => {
            try {
                let collectionName;
                if (table === 'vehiclesTable') collectionName = 'vehicles';
                else if (table === 'driversTable') collectionName = 'drivers';
                else if (table === 'hiresTable') collectionName = 'hires';

                if (collectionName) {
                    await db.collection(collectionName).doc(id).delete();
                    showMessage('Record deleted successfully!', 'success');
                }
            } catch (error) {
                console.error("Error deleting document:", error);
                showMessage("Failed to delete record. Please check console for details.", 'error');
            }
        });
    }

    if (e.target.classList.contains('edit-btn')) {
        const id = e.target.getAttribute('data-id');
        const table = e.target.closest('table').id;

        try {
            if (table === 'vehiclesTable') {
                const doc = await db.collection('vehicles').doc(id).get();
                if (doc.exists) {
                    const vehicle = doc.data();
                    document.getElementById('editVehicleId').value = id;
                    document.getElementById('editVehicleNumber').value = vehicle.vehicleNumber;
                    document.getElementById('editVehicleSize').value = vehicle.vehicleSize;
                    document.getElementById('editPerKmPrice').value = vehicle.perKmPrice;
                    document.getElementById('editOwnership').value = vehicle.ownership;
                    document.getElementById('editVehicleModal').style.display = 'block';
                }
            }
            else if (table === 'driversTable') {
                const doc = await db.collection('drivers').doc(id).get();
                if (doc.exists) {
                    const driver = doc.data();
                    document.getElementById('editDriverId').value = id;
                    document.getElementById('editDriverName').value = driver.name;
                    document.getElementById('editLicenseNumber').value = driver.licenseNumber;
                    document.getElementById('editDriverAge').value = driver.age;
                    document.getElementById('editDriverAddress').value = driver.address;
                    document.getElementById('editDriverModal').style.display = 'block';
                }
            }
            else if (table === 'hiresTable') {
                const doc = await db.collection('hires').doc(id).get();
                if (doc.exists) {
                    const hire = doc.data();
                    document.getElementById('editHireId').value = id;
                    document.getElementById('editHireMonth').value = hire.month;
                    document.getElementById('editFromLocation').value = hire.fromLocation;
                    document.getElementById('editToLocation').value = hire.toLocation;
                    document.getElementById('editDistance').value = hire.distance;
                    document.getElementById('editHireDate').value = hire.hireDate;
                    document.getElementById('editFuelLiters').value = hire.fuelLiters || '';
                    document.getElementById('editFuelPricePerLiter').value = hire.fuelPricePerLiter || '';

                    setTimeout(() => {
                        document.getElementById('editHireVehicle').value = hire.vehicleId;
                        if (hire.driverId) {
                            document.getElementById('editHireDriver').value = hire.driverId;
                        }
                    }, 100);

                    document.getElementById('editHireModal').style.display = 'block';
                }
            }
        } catch (error) {
            console.error("Error loading document for editing:", error);
            showMessage("Failed to load record for editing. Please check console for details.", 'error');
        }
    }

    // New: Handle "View Link" button click
    if (e.target.classList.contains('view-link-btn')) {
        const vehicleId = e.target.getAttribute('data-id');
        const vehicleNumber = e.target.getAttribute('data-vehicle-number');
        generateAndCopyPublicLink(vehicleId, vehicleNumber);
    }
});


// Function to generate and copy the public view link
function generateAndCopyPublicLink(vehicleId, vehicleNumber) {
    // Assuming public-view.html is in the same directory
    const publicViewUrl = `${window.location.origin}/public-view.html?vehicleId=${vehicleId}`;

    // Create a temporary input element to copy the text
    const tempInput = document.createElement('input');
    tempInput.value = publicViewUrl;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    showMessage(`Public view link for ${vehicleNumber} copied to clipboard!`, 'success');
}


// Edit form submissions
document.getElementById('editVehicleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const id = document.getElementById('editVehicleId').value;
        const updates = {
            vehicleNumber: document.getElementById('editVehicleNumber').value,
            vehicleSize: document.getElementById('editVehicleSize').value,
            perKmPrice: parseFloat(document.getElementById('editPerKmPrice').value),
            ownership: document.getElementById('editOwnership').value,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        await db.collection('vehicles').doc(id).update(updates);
        document.getElementById('editVehicleModal').style.display = 'none';
        showMessage('Vehicle updated successfully!', 'success');
    } catch (error) {
        console.error("Error updating vehicle:", error);
        showMessage("Failed to update vehicle. Please check console for details.", 'error');
    }
});

document.getElementById('editDriverForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const id = document.getElementById('editDriverId').value;
        const updates = {
            name: document.getElementById('editDriverName').value,
            licenseNumber: document.getElementById('editLicenseNumber').value,
            age: parseInt(document.getElementById('editDriverAge').value),
            address: document.getElementById('editDriverAddress').value,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        await db.collection('drivers').doc(id).update(updates);
        document.getElementById('editDriverModal').style.display = 'none';
        showMessage('Driver updated successfully!', 'success');
    } catch (error) {
        console.error("Error updating driver:", error);
        showMessage("Failed to update driver. Please check console for details.", 'error');
    }
});

document.getElementById('editHireForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const id = document.getElementById('editHireId').value;
        const vehicleId = document.getElementById('editHireVehicle').value;

        const vehicleDoc = await db.collection('vehicles').doc(vehicleId).get();
        if (!vehicleDoc.exists) {
            throw new Error("Selected vehicle not found");
        }

        const vehicle = vehicleDoc.data();
        const updates = {
            vehicleId: vehicleId,
            vehicleNumber: vehicle.vehicleNumber,
            month: document.getElementById('editHireMonth').value,
            fromLocation: document.getElementById('editFromLocation').value,
            toLocation: document.getElementById('editToLocation').value,
            distance: parseFloat(document.getElementById('editDistance').value),
            perKmPrice: vehicle.perKmPrice,
            hireDate: document.getElementById('editHireDate').value,
            driverId: document.getElementById('editHireDriver').value || null,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            hireAmount: parseFloat(document.getElementById('editDistance').value) * vehicle.perKmPrice
        };

        // Handle optional fuel fields
        const fuelLiters = document.getElementById('editFuelLiters').value;
        const fuelPricePerLiter = document.getElementById('editFuelPricePerLiter').value;

        if (fuelLiters) {
            updates.fuelLiters = parseFloat(fuelLiters);
        } else {
            updates.fuelLiters = firebase.firestore.FieldValue.delete();
        }

        if (fuelPricePerLiter) {
            updates.fuelPricePerLiter = parseFloat(fuelPricePerLiter);
        } else {
            updates.fuelPricePerLiter = firebase.firestore.FieldValue.delete();
        }

        if (fuelLiters && fuelPricePerLiter) {
            updates.fuelCost = updates.fuelLiters * updates.fuelPricePerLiter;
        } else {
            updates.fuelCost = firebase.firestore.FieldValue.delete();
        }

        await db.collection('hires').doc(id).update(updates);
        document.getElementById('editHireModal').style.display = 'none';
        showMessage('Hire record updated successfully!', 'success');
    } catch (error) {
        console.error("Error updating hire:", error);
        showMessage("Failed to update hire record. Please check console for details.", 'error');
    }
});

// Filter functionality - Fixed version
document.getElementById('applyFilter').addEventListener('click', async () => {
    try {
        const month = document.getElementById('filterMonth').value;
        const vehicle = document.getElementById('filterVehicle').value;

        let query = db.collection('hires');

        // Apply month filter if not 'All'
        if (month !== 'All') {
            query = query.where('month', '==', month);
        }

        // Apply vehicle filter if not 'All'
        if (vehicle !== 'All') {
            query = query.where('vehicleId', '==', vehicle);
        }

        // Add ordering
        query = query.orderBy('createdAt');

        const snapshot = await query.get();
        const hiresList = document.getElementById('hiresList');
        hiresList.innerHTML = '';
        let totalFuel = 0;
        let totalHire = 0;
        let totalDistance = 0; // New variable for total distance

        if (snapshot.empty) {
            hiresList.innerHTML = '<tr><td colspan="12">No hire records found for selected filter</td></tr>';
            updateTotals(0, 0, 0); // Update with total distance
            return;
        }

        // Get all drivers for display
        const driversSnapshot = await db.collection('drivers').get();
        const drivers = {};
        driversSnapshot.forEach(doc => {
            drivers[doc.id] = doc.data().name;
        });

        // Process each hire record
        snapshot.forEach(doc => {
            const hire = doc.data();
            totalHire += hire.hireAmount || 0;
            totalDistance += hire.distance || 0; // Accumulate total distance

            if (hire.fuelCost) {
                totalFuel += hire.fuelCost;
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${hire.hireDate}</td>
                <td>${hire.vehicleNumber}</td>
                <td>${hire.fromLocation}</td>
                <td>${hire.toLocation}</td>
                <td>${hire.distance.toFixed(1)}</td>
                <td>${hire.fuelLiters ? hire.fuelLiters.toFixed(1) : '-'}</td>
                <td>${hire.fuelPricePerLiter ? hire.fuelPricePerLiter.toFixed(2) : '-'}</td>
                <td>${hire.fuelCost ? hire.fuelCost.toFixed(2) : '-'}</td>
                <td>${hire.perKmPrice.toFixed(2)}</td>
                <td>${hire.hireAmount.toFixed(2)}</td>
                <td>${hire.driverId ? (drivers[hire.driverId] || 'N/A') : 'N/A'}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${doc.id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${doc.id}">Delete</button>
                </td>
            `;
            hiresList.appendChild(tr);
        });

        updateTotals(totalFuel, totalHire, totalDistance); // Pass total distance
    } catch (error) {
        console.error("Error filtering hires:", error);
        document.getElementById('hiresList').innerHTML = '<tr><td colspan="12">Error filtering hire records</td></tr>';
        updateTotals(0, 0, 0); // Pass total distance
        showMessage("Error filtering records. Please check console for details.", 'error');
    }
});

// PDF Export Functionality
function exportHiresToPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Get filter values
        const month = document.getElementById('filterMonth').value;
        const vehicleId = document.getElementById('filterVehicle').value;

        // Get vehicle name if filtered
        let vehicleName = "All Vehicles";
        if (vehicleId !== "All") {
            const vehicleSelect = document.getElementById('filterVehicle');
            const selectedOption = vehicleSelect.options[vehicleSelect.selectedIndex];
            vehicleName = selectedOption.text;
        }

        // Add logo
        const logoUrl = 'https://i.postimg.cc/ncLHmYyk/PDF-logo.png';

        // Add logo to PDF (this will be loaded asynchronously)
        const img = new Image();
        img.src = logoUrl;
        img.onload = function() {
            // Calculate center position for the logo
            const imgWidth = 30; // Original width of the logo
            const imgHeight = 30; // Original height of the logo
            const pageWidth = doc.internal.pageSize.getWidth();
            const x = (pageWidth - imgWidth) / 2;
            doc.addImage(img, 'PNG', x, 10, imgWidth, imgHeight);

            // Add header text
            doc.setFontSize(20);
            doc.setTextColor(231, 76, 60); // Red color
            doc.text('JAYASOORIYA ENTERPRISES', pageWidth / 2, 50, { align: 'center' }); // Adjusted Y position
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0); // Black color
            doc.text('Vehicle Hire Report', pageWidth / 2, 60, { align: 'center' }); // Adjusted Y position

            // Add filter info
            doc.setFontSize(12);
            doc.text(`Month: ${month === 'All' ? 'All Months' : month}`, 15, 70);
            doc.text(`Vehicle: ${vehicleName}`, 15, 77);

            // Add current date
            const today = new Date();
            doc.text(`Report Date: ${today.toLocaleDateString()}`, 15, 84);

            // Get table data
            const hiresTable = document.getElementById('hiresTable');
            const rows = hiresTable.querySelectorAll('tbody tr');

            if (rows.length === 0) {
                doc.setFontSize(12);
                doc.text('No hire records found for selected filter', 15, 100);
            } else {
                // Prepare data for the table
                const tableData = [];
                tableData.push([
                    'Date',
                    'Vehicle',
                    'From',
                    'To',
                    'Distance',
                    'Fuel (L)',
                    'Fuel Price/L',
                    'Fuel Cost',
                    'Price/KM',
                    'Hire Amount',
                    'Driver'
                ]);

                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    const rowData = [];
                    for (let i = 0; i < cells.length - 1; i++) { // Skip last cell (actions)
                        rowData.push(cells[i].textContent.trim());
                    }
                    tableData.push(rowData);
                });

                // Add the table
                doc.autoTable({
                    startY: 95, // Adjusted startY to accommodate new header
                    head: [tableData[0]],
                    body: tableData.slice(1),
                    theme: 'grid',
                    headStyles: {
                        fillColor: [231, 76, 60], // Red header
                        textColor: [255, 255, 255] // White text
                    },
                    alternateRowStyles: {
                        fillColor: [245, 245, 245] // Light gray for alternate rows
                    },
                    styles: {
                        fontSize: 8,
                        cellPadding: 3
                    },
                    columnStyles: {
                        0: { cellWidth: 15 },
                        1: { cellWidth: 20 },
                        2: { cellWidth: 20 },
                        3: { cellWidth: 20 },
                        4: { cellWidth: 15 },
                        5: { cellWidth: 12 },
                        6: { cellWidth: 15 },
                        7: { cellWidth: 15 },
                        8: { cellWidth: 15 },
                        9: { cellWidth: 20 },
                        10: { cellWidth: 25 }
                    }
                });

                // Add totals
                const totalFuel = document.getElementById('totalFuelCost').textContent;
                const totalHire = document.getElementById('totalHireAmount').textContent;
                const netProfit = document.getElementById('netProfit').textContent;
                const totalDistance = document.getElementById('totalDistance').textContent; // Get total distance

                let finalY = doc.lastAutoTable.finalY + 10;

                // Check if totals would overflow to a new page, and add new page if needed
                const textHeight = 7 * 4; // Approx height for 4 lines of text
                if (finalY + textHeight > doc.internal.pageSize.getHeight() - 20) { // 20 for bottom margin
                    doc.addPage();
                    finalY = 20; // Start at top of new page
                }

                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);
                doc.text(`Total Distance: ${totalDistance} KM`, 15, finalY); // Add total distance
                doc.text(`Total Fuel Cost: LKR ${totalFuel}`, 15, finalY + 7);
                doc.text(`Total Hire Amount: LKR ${totalHire}`, 15, finalY + 14); // Adjusted Y
                doc.setFontSize(12);
                doc.setTextColor(231, 76, 60);
                doc.text(`Net Profit: LKR ${netProfit}`, 15, finalY + 24); // Adjusted Y

                // Add system generated text at the bottom
                finalY = finalY + 37; // Further adjust Y to place it below totals
                if (finalY > doc.internal.pageSize.getHeight() - 20) { // 20 for bottom margin
                    doc.addPage();
                    finalY = 20; // Start at top of new page
                }
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100); // Grey color for this text
                doc.text('This is a system-generated report, no signature is required.', pageWidth / 2, finalY, { align: 'center' });
            }

            // Save the PDF
            doc.save(`Hire_Report_${month === 'All' ? 'All_Months' : month}_${vehicleName.replace(/ /g, '_')}.pdf`);

            showMessage('PDF exported successfully!', 'success');
        };

        img.onerror = function() {
            // If logo fails to load, proceed without it
            console.warn("Logo failed to load, generating PDF without it");

            // Add header text
            const pageWidth = doc.internal.pageSize.getWidth();
            doc.setFontSize(20);
            doc.setTextColor(231, 76, 60); // Red color
            doc.text('JAYASOORIYA ENTERPRISES', pageWidth / 2, 20, { align: 'center' });
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0); // Black color
            doc.text('Vehicle Hire Report', pageWidth / 2, 30, { align: 'center' });

            // Add filter info
            doc.setFontSize(12);
            doc.text(`Month: ${month === 'All' ? 'All Months' : month}`, 15, 40);
            doc.text(`Vehicle: ${vehicleName}`, 15, 47);

            // Add current date
            const today = new Date();
            doc.text(`Report Date: ${today.toLocaleDateString()}`, 15, 54);

            // Get table data
            const hiresTable = document.getElementById('hiresTable');
            const rows = hiresTable.querySelectorAll('tbody tr');

            if (rows.length === 0) {
                doc.setFontSize(12);
                doc.text('No hire records found for selected filter', 15, 70);
            } else {
                // Prepare data for the table
                const tableData = [];
                tableData.push([
                    'Date',
                    'Vehicle',
                    'From',
                    'To',
                    'Distance',
                    'Fuel (L)',
                    'Fuel Price/L',
                    'Fuel Cost',
                    'Price/KM',
                    'Hire Amount',
                    'Driver'
                ]);

                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    const rowData = [];
                    for (let i = 0; i < cells.length - 1; i++) { // Skip last cell (actions)
                        rowData.push(cells[i].textContent.trim());
                    }
                    tableData.push(rowData);
                });

                // Add the table
                doc.autoTable({
                    startY: 70,
                    head: [tableData[0]],
                    body: tableData.slice(1),
                    theme: 'grid',
                    headStyles: {
                        fillColor: [231, 76, 60], // Red header
                        textColor: [255, 255, 255] // White text
                    },
                    alternateRowStyles: {
                        fillColor: [245, 245, 245] // Light gray for alternate rows
                    },
                    styles: {
                        fontSize: 8,
                        cellPadding: 3
                    },
                    columnStyles: {
                        0: { cellWidth: 15 },
                        1: { cellWidth: 20 },
                        2: { cellWidth: 20 },
                        3: { cellWidth: 20 },
                        4: { cellWidth: 15 },
                        5: { cellWidth: 12 },
                        6: { cellWidth: 15 },
                        7: { cellWidth: 15 },
                        8: { cellWidth: 15 },
                        9: { cellWidth: 20 },
                        10: { cellWidth: 25 }
                    }
                });

                // Add totals
                const totalFuel = document.getElementById('totalFuelCost').textContent;
                const totalHire = document.getElementById('totalHireAmount').textContent;
                const netProfit = document.getElementById('netProfit').textContent;
                const totalDistance = document.getElementById('totalDistance').textContent; // Get total distance

                let finalY = doc.lastAutoTable.finalY + 10;

                // Check if totals would overflow to a new page, and add new page if needed
                const textHeight = 7 * 4; // Approx height for 4 lines of text
                if (finalY + textHeight > doc.internal.pageSize.getHeight() - 20) { // 20 for bottom margin
                    doc.addPage();
                    finalY = 20; // Start at top of new page
                }

                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);
                doc.text(`Total Distance: ${totalDistance} KM`, 15, finalY); // Add total distance
                doc.text(`Total Fuel Cost: LKR ${totalFuel}`, 15, finalY + 7);
                doc.text(`Total Hire Amount: LKR ${totalHire}`, 15, finalY + 14); // Adjusted Y
                doc.setFontSize(12);
                doc.setTextColor(231, 76, 60);
                doc.text(`Net Profit: LKR ${netProfit}`, 15, finalY + 24); // Adjusted Y

                // Add system generated text at the bottom
                finalY = finalY + 37; // Further adjust Y to place it below totals
                if (finalY > doc.internal.pageSize.getHeight() - 20) { // 20 for bottom margin
                    doc.addPage();
                    finalY = 20; // Start at top of new page
                }
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100); // Grey color for this text
                doc.text('This is a system-generated report, no signature is required.', pageWidth / 2, finalY, { align: 'center' });
            }

            // Save the PDF
            doc.save(`Hire_Report_${month === 'All' ? 'All_Months' : month}_${vehicleName.replace(/ /g, '_')}.pdf`);

            showMessage('PDF exported successfully!', 'success');
        };
    } catch (error) {
        console.error("Error generating PDF:", error);
        showMessage("Failed to generate PDF. Please check console for details.", 'error');
    }
}

// Custom message box and confirmation dialog
function showMessage(message, type) {
    let messageBox = document.getElementById('messageBox');
    if (!messageBox) {
        messageBox = document.createElement('div');
        messageBox.id = 'messageBox';
        messageBox.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 1.1rem;
            color: white;
            z-index: 1001;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            opacity: 0;
            transition: opacity 0.5s ease-in-out;
        `;
        document.body.appendChild(messageBox);
    }

    messageBox.textContent = message;
    if (type === 'success') {
        messageBox.style.backgroundColor = '#27ae60';
    } else if (type === 'error') {
        messageBox.style.backgroundColor = '#e74c3c';
    } else {
        messageBox.style.backgroundColor = '#3498db';
    }

    messageBox.style.opacity = '1';
    setTimeout(() => {
        messageBox.style.opacity = '0';
    }, 3000);
}

function showConfirmation(message, onConfirm) {
    let confirmationModal = document.getElementById('confirmationModal');
    if (!confirmationModal) {
        confirmationModal = document.createElement('div');
        confirmationModal.id = 'confirmationModal';
        confirmationModal.classList.add('modal');
        confirmationModal.innerHTML = `
            <div class="modal-content">
                <p id="confirmationMessage"></p>
                <div style="display: flex; justify-content: center; gap: 15px; margin-top: 20px;">
                    <button id="confirmYes" class="action-btn edit-btn" style="background-color: #27ae60; color: white;">Yes</button>
                    <button id="confirmNo" class="action-btn delete-btn" style="background-color: #e74c3c; color: white;">No</button>
                </div>
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

// Initialize the app
function initApp() {
    // Load all data
    loadVehicles();
    loadDrivers();
    loadHires();

    // Initialize totals display
    updateTotals(0, 0, 0); // Initialize with total distance

    // Add PDF export button event listener
    document.getElementById('exportPdfBtn').addEventListener('click', exportHiresToPDF);
}