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
    } catch (error) {
        console.error("Error adding vehicle:", error);
        alert("Failed to add vehicle. Please check console for details.");
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
    } catch (error) {
        console.error("Error adding driver:", error);
        alert("Failed to add driver. Please check console for details.");
    }
});

// Hire Management
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
            fuelLiters: parseFloat(document.getElementById('fuelLiters').value),
            fuelPricePerLiter: parseFloat(document.getElementById('fuelPricePerLiter').value),
            perKmPrice: vehicle.perKmPrice,
            hireDate: document.getElementById('hireDate').value,
            driverId: document.getElementById('hireDriver').value || null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        hire.fuelCost = hire.fuelLiters * hire.fuelPricePerLiter;
        hire.hireAmount = hire.distance * hire.perKmPrice;
        
        await db.collection('hires').add(hire);
        hireForm.reset();
    } catch (error) {
        console.error("Error adding hire:", error);
        alert("Failed to add hire record. Please check console for details.");
    }
});

// Load Vehicles with real-time updates
function loadVehicles() {
    db.collection('vehicles').orderBy('createdAt').onSnapshot((snapshot) => {
        const vehiclesList = document.getElementById('vehiclesList');
        vehiclesList.innerHTML = '';
        
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
        
        // Update vehicle dropdowns
        populateVehicleDropdowns(snapshot);
    }, error => {
        console.error("Error loading vehicles:", error);
    });
}

// Load Drivers with real-time updates
function loadDrivers() {
    db.collection('drivers').orderBy('createdAt').onSnapshot((snapshot) => {
        const driversList = document.getElementById('driversList');
        driversList.innerHTML = '';
        
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
        
        // Update driver dropdowns
        populateDriverDropdowns(snapshot);
    }, error => {
        console.error("Error loading drivers:", error);
    });
}

// Load Hires with real-time updates
function loadHires() {
    db.collection('hires').orderBy('createdAt').onSnapshot(async (snapshot) => {
        const hiresList = document.getElementById('hiresList');
        hiresList.innerHTML = '';
        let totalFuel = 0;
        let totalHire = 0;
        
        if (!snapshot.empty) {
            // Get all drivers for display
            const driversSnapshot = await db.collection('drivers').get();
            const drivers = {};
            driversSnapshot.forEach(doc => {
                drivers[doc.id] = doc.data().name;
            });
            
            snapshot.forEach(doc => {
                const hire = doc.data();
                totalFuel += hire.fuelCost || 0;
                totalHire += hire.hireAmount || 0;
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${hire.hireDate}</td>
                    <td>${hire.vehicleNumber}</td>
                    <td>${hire.fromLocation}</td>
                    <td>${hire.toLocation}</td>
                    <td>${hire.distance.toFixed(1)}</td>
                    <td>${hire.fuelLiters.toFixed(1)}</td>
                    <td>${hire.fuelPricePerLiter.toFixed(2)}</td>
                    <td>${hire.fuelCost.toFixed(2)}</td>
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
        } else {
            hiresList.innerHTML = '<tr><td colspan="12">No hire records found</td></tr>';
        }
        
        // Update totals
        document.getElementById('totalFuelCost').textContent = totalFuel.toFixed(2);
        document.getElementById('totalHireAmount').textContent = totalHire.toFixed(2);
        document.getElementById('netProfit').textContent = (totalHire - totalFuel).toFixed(2);
    }, error => {
        console.error("Error loading hires:", error);
    });
}

// Populate vehicle dropdowns
function populateVehicleDropdowns(vehiclesSnapshot) {
    const dropdowns = [
        document.getElementById('hireVehicle'),
        document.getElementById('editHireVehicle'),
        document.getElementById('filterVehicle')
    ];
    
    dropdowns.forEach(dropdown => {
        // Keep the first option
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
        // Keep the first option
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
    // Delete buttons
    if (e.target.classList.contains('delete-btn')) {
        const id = e.target.getAttribute('data-id');
        const table = e.target.closest('table').id;
        
        if (confirm('Are you sure you want to delete this record?')) {
            try {
                let collectionName;
                if (table === 'vehiclesTable') collectionName = 'vehicles';
                else if (table === 'driversTable') collectionName = 'drivers';
                else if (table === 'hiresTable') collectionName = 'hires';
                
                if (collectionName) {
                    await db.collection(collectionName).doc(id).delete();
                }
            } catch (error) {
                console.error("Error deleting document:", error);
                alert("Failed to delete record. Please check console for details.");
            }
        }
    }
    
    // Edit buttons
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
                    document.getElementById('editFuelLiters').value = hire.fuelLiters;
                    document.getElementById('editFuelPricePerLiter').value = hire.fuelPricePerLiter;
                    document.getElementById('editHireDate').value = hire.hireDate;
                    
                    // Set dropdowns after a small delay to ensure options are loaded
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
            alert("Failed to load record for editing. Please check console for details.");
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
    } catch (error) {
        console.error("Error updating vehicle:", error);
        alert("Failed to update vehicle. Please check console for details.");
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
    } catch (error) {
        console.error("Error updating driver:", error);
        alert("Failed to update driver. Please check console for details.");
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
            fuelLiters: parseFloat(document.getElementById('editFuelLiters').value),
            fuelPricePerLiter: parseFloat(document.getElementById('editFuelPricePerLiter').value),
            perKmPrice: vehicle.perKmPrice,
            hireDate: document.getElementById('editHireDate').value,
            driverId: document.getElementById('editHireDriver').value || null,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        updates.fuelCost = updates.fuelLiters * updates.fuelPricePerLiter;
        updates.hireAmount = updates.distance * updates.perKmPrice;
        
        await db.collection('hires').doc(id).update(updates);
        document.getElementById('editHireModal').style.display = 'none';
    } catch (error) {
        console.error("Error updating hire:", error);
        alert("Failed to update hire record. Please check console for details.");
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
        
        if (!snapshot.empty) {
            // Get all drivers for display
            const driversSnapshot = await db.collection('drivers').get();
            const drivers = {};
            driversSnapshot.forEach(doc => {
                drivers[doc.id] = doc.data().name;
            });
            
            snapshot.forEach(doc => {
                const hire = doc.data();
                totalFuel += hire.fuelCost || 0;
                totalHire += hire.hireAmount || 0;
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${hire.hireDate}</td>
                    <td>${hire.vehicleNumber}</td>
                    <td>${hire.fromLocation}</td>
                    <td>${hire.toLocation}</td>
                    <td>${hire.distance.toFixed(1)}</td>
                    <td>${hire.fuelLiters.toFixed(1)}</td>
                    <td>${hire.fuelPricePerLiter.toFixed(2)}</td>
                    <td>${hire.fuelCost.toFixed(2)}</td>
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
        } else {
            hiresList.innerHTML = '<tr><td colspan="12">No hire records found</td></tr>';
        }
        
        document.getElementById('totalFuelCost').textContent = totalFuel.toFixed(2);
        document.getElementById('totalHireAmount').textContent = totalHire.toFixed(2);
        document.getElementById('netProfit').textContent = (totalHire - totalFuel).toFixed(2);
    } catch (error) {
        console.error("Error filtering hires:", error);
        alert("Failed to filter hire records. Please check console for details.");
    }
});

// Close modals
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        closeBtn.closest('.modal').style.display = 'none';
    });
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Initialize the app
function initApp() {
    // Load all data
    loadVehicles();
    loadDrivers();
    loadHires();
    
    // Set current date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('hireDate').value = today;
    document.getElementById('editHireDate').value = today;
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);