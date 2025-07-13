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
        // Replaced alert with a custom message box for better UI
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
        // Replaced alert with a custom message box for better UI
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
        // Remove required attribute from fuel fields
        document.getElementById('fuelLiters').removeAttribute('required');
        document.getElementById('fuelPricePerLiter').removeAttribute('required');
        
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
        
        // Only add fuel data if fields are not empty
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
        // Replaced alert with a custom message box for better UI
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
        
        if (snapshot.empty) {
            hiresList.innerHTML = '<tr><td colspan="12">No hire records found</td></tr>';
            updateTotals(0, 0);
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
        
        updateTotals(totalFuel, totalHire);
    }, error => {
        console.error("Error loading hires:", error);
        document.getElementById('hiresList').innerHTML = '<tr><td colspan="12">Error loading hire records</td></tr>';
        updateTotals(0, 0);
    });
}

function updateTotals(fuelCost, hireAmount) {
    document.getElementById('totalFuelCost').textContent = fuelCost.toFixed(2);
    document.getElementById('totalHireAmount').textContent = hireAmount.toFixed(2);
    document.getElementById('netProfit').textContent = (hireAmount - fuelCost).toFixed(2);
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
        
        // Replaced confirm with a custom message box for better UI
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
});

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

// Filter functionality
document.getElementById('applyFilter').addEventListener('click', async () => {
    try {
        const month = document.getElementById('filterMonth').value;
        const vehicle = document.getElementById('filterVehicle').value;
        
        let query = db.collection('hires');
        
        if (month !== 'All') {
            query = query.where('month', '==', month);
        }
        if (vehicle !== 'All') {
            query = query.where('vehicleId', '==', vehicle);
        }
        
        const snapshot = await query.orderBy('createdAt').get();
        const hiresList = document.getElementById('hiresList');
        hiresList.innerHTML = '';
        let totalFuel = 0;
        let totalHire = 0;
        
        if (snapshot.empty) {
            hiresList.innerHTML = '<tr><td colspan="12">No hire records found for selected filter</td></tr>';
            updateTotals(0, 0);
            return;
        }
        
        const driversSnapshot = await db.collection('drivers').get();
        const drivers = {};
        driversSnapshot.forEach(doc => {
            drivers[doc.id] = doc.data().name;
        });
        
        snapshot.forEach(doc => {
            const hire = doc.data();
            totalHire += hire.hireAmount || 0;
            
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
        
        updateTotals(totalFuel, totalHire);
    } catch (error) {
        console.error("Error filtering hires:", error);
        document.getElementById('hiresList').innerHTML = '<tr><td colspan="12">Error filtering hire records</td></tr>';
        updateTotals(0, 0);
    }
});

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
        messageBox.style.backgroundColor = '#3498db'; // Default blue
    }

    messageBox.style.opacity = '1';
    setTimeout(() => {
        messageBox.style.opacity = '0';
    }, 3000); // Message disappears after 3 seconds
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

        // Close when clicking outside the modal content
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
    if (e.target.classList.contains('modal') && e.target.id !== 'confirmationModal') { // Exclude confirmation modal
        e.target.style.display = 'none';
    }
});

// Initialize the app
function initApp() {
    // Remove required attribute from fuel fields
    document.getElementById('fuelLiters').removeAttribute('required');
    document.getElementById('fuelPricePerLiter').removeAttribute('required');
    
    // Load all data
    loadVehicles();
    loadDrivers();
    loadHires();
    
    // Set current date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('hireDate').value = today;
    document.getElementById('editHireDate').value = today;
    
    // Initialize totals display
    updateTotals(0, 0);
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
