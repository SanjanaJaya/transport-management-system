// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getDatabase, 
    ref, 
    push, 
    set, 
    onValue, 
    remove,
    update
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Your web app's Firebase configuration
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
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// DOM Elements
const vehiclesTab = document.getElementById('vehiclesTab');
const driversTab = document.getElementById('driversTab');
const hiresTab = document.getElementById('hiresTab');
const vehiclesSection = document.getElementById('vehiclesSection');
const driversSection = document.getElementById('driversSection');
const hiresSection = document.getElementById('hiresSection');

// Tab Switching
vehiclesTab.addEventListener('click', () => {
    setActiveTab(vehiclesTab, vehiclesSection);
});

driversTab.addEventListener('click', () => {
    setActiveTab(driversTab, driversSection);
});

hiresTab.addEventListener('click', () => {
    setActiveTab(hiresTab, hiresSection);
});

function setActiveTab(tab, section) {
    // Remove active class from all tabs and sections
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('main section').forEach(sec => sec.classList.remove('active'));
    
    // Add active class to selected tab and section
    tab.classList.add('active');
    section.classList.add('active');
}

// Vehicle Management
const vehicleForm = document.getElementById('vehicleForm');
const vehiclesList = document.getElementById('vehiclesList');

vehicleForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const vehicleNumber = document.getElementById('vehicleNumber').value;
    const vehicleSize = document.getElementById('vehicleSize').value;
    const perKmPrice = parseFloat(document.getElementById('perKmPrice').value);
    const ownership = document.getElementById('ownership').value;
    
    // Push data to Firebase
    const newVehicleRef = push(ref(database, 'vehicles'));
    set(newVehicleRef, {
        vehicleNumber,
        vehicleSize,
        perKmPrice,
        ownership
    });
    
    // Clear form
    vehicleForm.reset();
});

// Listen for changes in vehicles data
onValue(ref(database, 'vehicles'), (snapshot) => {
    vehiclesList.innerHTML = '';
    
    if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
            const vehicle = childSnapshot.val();
            const vehicleId = childSnapshot.key;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${vehicle.vehicleNumber}</td>
                <td>${vehicle.vehicleSize}</td>
                <td>${vehicle.perKmPrice.toFixed(2)}</td>
                <td>${vehicle.ownership}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${vehicleId}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${vehicleId}">Delete</button>
                </td>
            `;
            
            vehiclesList.appendChild(row);
        });
        
        // Populate vehicle dropdowns
        populateVehicleDropdowns();
    } else {
        vehiclesList.innerHTML = '<tr><td colspan="5">No vehicles found</td></tr>';
    }
});

// Driver Management
const driverForm = document.getElementById('driverForm');
const driversList = document.getElementById('driversList');

driverForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const driverName = document.getElementById('driverName').value;
    const licenseNumber = document.getElementById('licenseNumber').value;
    const driverAge = parseInt(document.getElementById('driverAge').value);
    const driverAddress = document.getElementById('driverAddress').value;
    
    // Push data to Firebase
    const newDriverRef = push(ref(database, 'drivers'));
    set(newDriverRef, {
        name: driverName,
        licenseNumber,
        age: driverAge,
        address: driverAddress
    });
    
    // Clear form
    driverForm.reset();
});

// Listen for changes in drivers data
onValue(ref(database, 'drivers'), (snapshot) => {
    driversList.innerHTML = '';
    
    if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
            const driver = childSnapshot.val();
            const driverId = childSnapshot.key;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${driver.name}</td>
                <td>${driver.licenseNumber}</td>
                <td>${driver.age}</td>
                <td>${driver.address}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${driverId}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${driverId}">Delete</button>
                </td>
            `;
            
            driversList.appendChild(row);
        });
        
        // Populate driver dropdowns
        populateDriverDropdowns();
    } else {
        driversList.innerHTML = '<tr><td colspan="5">No drivers found</td></tr>';
    }
});

// Hire Management
const hireForm = document.getElementById('hireForm');
const hiresList = document.getElementById('hiresList');
const totalFuelCost = document.getElementById('totalFuelCost');
const totalHireAmount = document.getElementById('totalHireAmount');
const netProfit = document.getElementById('netProfit');

hireForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const vehicleId = document.getElementById('hireVehicle').value;
    const month = document.getElementById('hireMonth').value;
    const fromLocation = document.getElementById('fromLocation').value;
    const toLocation = document.getElementById('toLocation').value;
    const distance = parseFloat(document.getElementById('distance').value);
    const fuelLiters = parseFloat(document.getElementById('fuelLiters').value);
    const fuelPricePerLiter = parseFloat(document.getElementById('fuelPricePerLiter').value);
    const hireDate = document.getElementById('hireDate').value;
    const driverId = document.getElementById('hireDriver').value || null;
    
    // Get vehicle details to calculate hire amount
    const vehicleRef = ref(database, `vehicles/${vehicleId}`);
    onValue(vehicleRef, (snapshot) => {
        if (snapshot.exists()) {
            const vehicle = snapshot.val();
            const hireAmount = distance * vehicle.perKmPrice;
            const fuelCost = fuelLiters * fuelPricePerLiter;
            
            // Push data to Firebase
            const newHireRef = push(ref(database, 'hires'));
            set(newHireRef, {
                vehicleId,
                vehicleNumber: vehicle.vehicleNumber,
                month,
                fromLocation,
                toLocation,
                distance,
                fuelLiters,
                fuelPricePerLiter,
                fuelCost,
                perKmPrice: vehicle.perKmPrice,
                hireAmount,
                hireDate,
                driverId
            });
            
            // Clear form
            hireForm.reset();
        }
    }, { onlyOnce: true });
});

// Listen for changes in hires data
onValue(ref(database, 'hires'), (snapshot) => {
    hiresList.innerHTML = '';
    let totalFuel = 0;
    let totalHire = 0;
    
    if (snapshot.exists()) {
        // Get drivers data for display
        const driversPromise = new Promise((resolve) => {
            onValue(ref(database, 'drivers'), (driversSnapshot) => {
                const drivers = {};
                if (driversSnapshot.exists()) {
                    driversSnapshot.forEach((driverChild) => {
                        drivers[driverChild.key] = driverChild.val().name;
                    });
                }
                resolve(drivers);
            }, { onlyOnce: true });
        });
        
        driversPromise.then((drivers) => {
            snapshot.forEach((childSnapshot) => {
                const hire = childSnapshot.val();
                const hireId = childSnapshot.key;
                
                totalFuel += hire.fuelCost;
                totalHire += hire.hireAmount;
                
                const row = document.createElement('tr');
                row.innerHTML = `
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
                    <td>${hire.driverId ? drivers[hire.driverId] || 'N/A' : 'N/A'}</td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${hireId}">Edit</button>
                        <button class="action-btn delete-btn" data-id="${hireId}">Delete</button>
                    </td>
                `;
                
                hiresList.appendChild(row);
            });
            
            // Update totals
            totalFuelCost.textContent = totalFuel.toFixed(2);
            totalHireAmount.textContent = totalHire.toFixed(2);
            netProfit.textContent = (totalHire - totalFuel).toFixed(2);
        });
    } else {
        hiresList.innerHTML = '<tr><td colspan="12">No hire records found</td></tr>';
        totalFuelCost.textContent = '0.00';
        totalHireAmount.textContent = '0.00';
        netProfit.textContent = '0.00';
    }
});

// Filter functionality
const applyFilter = document.getElementById('applyFilter');
const filterMonth = document.getElementById('filterMonth');
const filterVehicle = document.getElementById('filterVehicle');

applyFilter.addEventListener('click', () => {
    const month = filterMonth.value;
    const vehicle = filterVehicle.value;
    
    onValue(ref(database, 'hires'), (snapshot) => {
        hiresList.innerHTML = '';
        let totalFuel = 0;
        let totalHire = 0;
        
        if (snapshot.exists()) {
            // Get drivers data for display
            const driversPromise = new Promise((resolve) => {
                onValue(ref(database, 'drivers'), (driversSnapshot) => {
                    const drivers = {};
                    if (driversSnapshot.exists()) {
                        driversSnapshot.forEach((driverChild) => {
                            drivers[driverChild.key] = driverChild.val().name;
                        });
                    }
                    resolve(drivers);
                }, { onlyOnce: true });
            });
            
            driversPromise.then((drivers) => {
                snapshot.forEach((childSnapshot) => {
                    const hire = childSnapshot.val();
                    const hireId = childSnapshot.key;
                    
                    // Apply filters
                    if ((month === 'All' || hire.month === month) && 
                        (vehicle === 'All' || hire.vehicleId === vehicle)) {
                        
                        totalFuel += hire.fuelCost;
                        totalHire += hire.hireAmount;
                        
                        const row = document.createElement('tr');
                        row.innerHTML = `
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
                            <td>${hire.driverId ? drivers[hire.driverId] || 'N/A' : 'N/A'}</td>
                            <td>
                                <button class="action-btn edit-btn" data-id="${hireId}">Edit</button>
                                <button class="action-btn delete-btn" data-id="${hireId}">Delete</button>
                            </td>
                        `;
                        
                        hiresList.appendChild(row);
                    }
                });
                
                // Update totals
                totalFuelCost.textContent = totalFuel.toFixed(2);
                totalHireAmount.textContent = totalHire.toFixed(2);
                netProfit.textContent = (totalHire - totalFuel).toFixed(2);
            });
        } else {
            hiresList.innerHTML = '<tr><td colspan="12">No hire records found</td></tr>';
            totalFuelCost.textContent = '0.00';
            totalHireAmount.textContent = '0.00';
            netProfit.textContent = '0.00';
        }
    });
});

// Populate vehicle dropdowns
function populateVehicleDropdowns() {
    const hireVehicle = document.getElementById('hireVehicle');
    const editHireVehicle = document.getElementById('editHireVehicle');
    const filterVehicle = document.getElementById('filterVehicle');
    
    // Clear existing options except the first one
    while (hireVehicle.options.length > 1) hireVehicle.remove(1);
    while (editHireVehicle.options.length > 1) editHireVehicle.remove(1);
    while (filterVehicle.options.length > 1) filterVehicle.remove(1);
    
    // Get vehicles data
    onValue(ref(database, 'vehicles'), (snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const vehicle = childSnapshot.val();
                const vehicleId = childSnapshot.key;
                
                // Add to hire vehicle dropdown
                const option1 = document.createElement('option');
                option1.value = vehicleId;
                option1.textContent = `${vehicle.vehicleNumber} (${vehicle.vehicleSize})`;
                hireVehicle.appendChild(option1);
                
                // Add to edit hire vehicle dropdown
                const option2 = document.createElement('option');
                option2.value = vehicleId;
                option2.textContent = `${vehicle.vehicleNumber} (${vehicle.vehicleSize})`;
                editHireVehicle.appendChild(option2);
                
                // Add to filter vehicle dropdown
                const option3 = document.createElement('option');
                option3.value = vehicleId;
                option3.textContent = `${vehicle.vehicleNumber} (${vehicle.vehicleSize})`;
                filterVehicle.appendChild(option3);
            });
        }
    });
}

// Populate driver dropdowns
function populateDriverDropdowns() {
    const hireDriver = document.getElementById('hireDriver');
    const editHireDriver = document.getElementById('editHireDriver');
    
    // Clear existing options except the first one
    while (hireDriver.options.length > 1) hireDriver.remove(1);
    while (editHireDriver.options.length > 1) editHireDriver.remove(1);
    
    // Get drivers data
    onValue(ref(database, 'drivers'), (snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const driver = childSnapshot.val();
                const driverId = childSnapshot.key;
                
                // Add to hire driver dropdown
                const option1 = document.createElement('option');
                option1.value = driverId;
                option1.textContent = `${driver.name} (${driver.licenseNumber})`;
                hireDriver.appendChild(option1);
                
                // Add to edit hire driver dropdown
                const option2 = document.createElement('option');
                option2.value = driverId;
                option2.textContent = `${driver.name} (${driver.licenseNumber})`;
                editHireDriver.appendChild(option2);
            });
        }
    });
}

// Edit and Delete functionality
document.addEventListener('click', (e) => {
    // Delete buttons
    if (e.target.classList.contains('delete-btn')) {
        const id = e.target.getAttribute('data-id');
        const table = e.target.closest('table').id;
        
        if (confirm('Are you sure you want to delete this record?')) {
            let dbRef;
            
            if (table === 'vehiclesTable') {
                dbRef = ref(database, `vehicles/${id}`);
            } else if (table === 'driversTable') {
                dbRef = ref(database, `drivers/${id}`);
            } else if (table === 'hiresTable') {
                dbRef = ref(database, `hires/${id}`);
            }
            
            remove(dbRef);
        }
    }
    
    // Edit buttons
    if (e.target.classList.contains('edit-btn')) {
        const id = e.target.getAttribute('data-id');
        const table = e.target.closest('table').id;
        
        if (table === 'vehiclesTable') {
            // Get vehicle data
            onValue(ref(database, `vehicles/${id}`), (snapshot) => {
                if (snapshot.exists()) {
                    const vehicle = snapshot.val();
                    
                    // Fill edit form
                    document.getElementById('editVehicleId').value = id;
                    document.getElementById('editVehicleNumber').value = vehicle.vehicleNumber;
                    document.getElementById('editVehicleSize').value = vehicle.vehicleSize;
                    document.getElementById('editPerKmPrice').value = vehicle.perKmPrice;
                    document.getElementById('editOwnership').value = vehicle.ownership;
                    
                    // Show modal
                    document.getElementById('editVehicleModal').style.display = 'block';
                }
            });
        } else if (table === 'driversTable') {
            // Get driver data
            onValue(ref(database, `drivers/${id}`), (snapshot) => {
                if (snapshot.exists()) {
                    const driver = snapshot.val();
                    
                    // Fill edit form
                    document.getElementById('editDriverId').value = id;
                    document.getElementById('editDriverName').value = driver.name;
                    document.getElementById('editLicenseNumber').value = driver.licenseNumber;
                    document.getElementById('editDriverAge').value = driver.age;
                    document.getElementById('editDriverAddress').value = driver.address;
                    
                    // Show modal
                    document.getElementById('editDriverModal').style.display = 'block';
                }
            });
        } else if (table === 'hiresTable') {
            // Get hire data
            onValue(ref(database, `hires/${id}`), (snapshot) => {
                if (snapshot.exists()) {
                    const hire = snapshot.val();
                    
                    // Fill edit form
                    document.getElementById('editHireId').value = id;
                    
                    // Set vehicle dropdown (need to wait for options to populate)
                    setTimeout(() => {
                        document.getElementById('editHireVehicle').value = hire.vehicleId;
                    }, 100);
                    
                    document.getElementById('editHireMonth').value = hire.month;
                    document.getElementById('editFromLocation').value = hire.fromLocation;
                    document.getElementById('editToLocation').value = hire.toLocation;
                    document.getElementById('editDistance').value = hire.distance;
                    document.getElementById('editFuelLiters').value = hire.fuelLiters;
                    document.getElementById('editFuelPricePerLiter').value = hire.fuelPricePerLiter;
                    document.getElementById('editHireDate').value = hire.hireDate;
                    
                    // Set driver dropdown if exists
                    if (hire.driverId) {
                        setTimeout(() => {
                            document.getElementById('editHireDriver').value = hire.driverId;
                        }, 100);
                    }
                    
                    // Show modal
                    document.getElementById('editHireModal').style.display = 'block';
                }
            });
        }
    }
});

// Edit form submissions
document.getElementById('editVehicleForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = document.getElementById('editVehicleId').value;
    const vehicleNumber = document.getElementById('editVehicleNumber').value;
    const vehicleSize = document.getElementById('editVehicleSize').value;
    const perKmPrice = parseFloat(document.getElementById('editPerKmPrice').value);
    const ownership = document.getElementById('editOwnership').value;
    
    update(ref(database, `vehicles/${id}`), {
        vehicleNumber,
        vehicleSize,
        perKmPrice,
        ownership
    });
    
    document.getElementById('editVehicleModal').style.display = 'none';
});

document.getElementById('editDriverForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = document.getElementById('editDriverId').value;
    const name = document.getElementById('editDriverName').value;
    const licenseNumber = document.getElementById('editLicenseNumber').value;
    const age = parseInt(document.getElementById('editDriverAge').value);
    const address = document.getElementById('editDriverAddress').value;
    
    update(ref(database, `drivers/${id}`), {
        name,
        licenseNumber,
        age,
        address
    });
    
    document.getElementById('editDriverModal').style.display = 'none';
});

document.getElementById('editHireForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = document.getElementById('editHireId').value;
    const vehicleId = document.getElementById('editHireVehicle').value;
    const month = document.getElementById('editHireMonth').value;
    const fromLocation = document.getElementById('editFromLocation').value;
    const toLocation = document.getElementById('editToLocation').value;
    const distance = parseFloat(document.getElementById('editDistance').value);
    const fuelLiters = parseFloat(document.getElementById('editFuelLiters').value);
    const fuelPricePerLiter = parseFloat(document.getElementById('editFuelPricePerLiter').value);
    const hireDate = document.getElementById('editHireDate').value;
    const driverId = document.getElementById('editHireDriver').value || null;
    
    // Get vehicle details to calculate hire amount
    const vehicleRef = ref(database, `vehicles/${vehicleId}`);
    onValue(vehicleRef, (snapshot) => {
        if (snapshot.exists()) {
            const vehicle = snapshot.val();
            const hireAmount = distance * vehicle.perKmPrice;
            const fuelCost = fuelLiters * fuelPricePerLiter;
            
            update(ref(database, `hires/${id}`), {
                vehicleId,
                vehicleNumber: vehicle.vehicleNumber,
                month,
                fromLocation,
                toLocation,
                distance,
                fuelLiters,
                fuelPricePerLiter,
                fuelCost,
                perKmPrice: vehicle.perKmPrice,
                hireAmount,
                hireDate,
                driverId
            });
            
            document.getElementById('editHireModal').style.display = 'none';
        }
    }, { onlyOnce: true });
});

// Close modals when clicking X
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        closeBtn.closest('.modal').style.display = 'none';
    });
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Initialize the app
function initApp() {
    // Populate dropdowns
    populateVehicleDropdowns();
    populateDriverDropdowns();
    
    // Set current date as default for hire date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('hireDate').value = today;
    document.getElementById('editHireDate').value = today;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);