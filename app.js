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
const lettersTab = document.getElementById('lettersTab');
const vehiclesSection = document.getElementById('vehiclesSection');
const driversSection = document.getElementById('driversSection');
const hiresSection = document.getElementById('hiresSection');
const advancePaymentsSection = document.getElementById('advancePaymentsSection');
const lettersSection = document.getElementById('lettersSection');
const addLetterBtn = document.getElementById('addLetterBtn');
const letterForm = document.getElementById('letterForm');
const saveLetterBtn = document.getElementById('saveLetterBtn');

// Tab Switching
vehiclesTab.addEventListener('click', () => setActiveTab(vehiclesTab, vehiclesSection));
driversTab.addEventListener('click', () => setActiveTab(driversTab, driversSection));
hiresTab.addEventListener('click', () => setActiveTab(hiresTab, hiresSection));
advancePaymentsTab.addEventListener('click', () => setActiveTab(advancePaymentsTab, advancePaymentsSection));
lettersTab.addEventListener('click', () => setActiveTab(lettersTab, lettersSection));

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

addLetterBtn.addEventListener('click', () => {
    document.getElementById('letterForm').reset();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('letterDate').value = today;
    document.getElementById('addLetterModal').style.display = 'block';
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
            hireAmount: hireAmount,
            pricingTiers: {
                tier1Distance: vehicle.tier1Distance,
                tier1Price: vehicle.tier1Price,
                tier2Distance: vehicle.tier2Distance,
                tier2Price: vehicle.tier2Price,
                tier3Price: vehicle.tier3Price,
                minimumHire: vehicle.minimumHire
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

// Letter Management
letterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    generateLetterPDF();
});

saveLetterBtn.addEventListener('click', async () => {
    try {
        const letter = {
            date: document.getElementById('letterDate').value,
            refNo: document.getElementById('letterRefNo').value,
            recipient: document.getElementById('letterRecipient').value,
            recipientAddress: document.getElementById('letterRecipientAddress').value,
            subject: document.getElementById('letterSubject').value,
            salutation: document.getElementById('letterSalutation').value,
            body: document.getElementById('letterBody').value,
            closing: document.getElementById('letterClosing').value,
            senderName: document.getElementById('letterSenderName').value,
            senderPosition: document.getElementById('letterSenderPosition').value,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('letters').add(letter);
        showMessage('Letter draft saved successfully!', 'success');
        loadLetters();
    } catch (error) {
        console.error("Error saving letter:", error);
        showMessage("Failed to save letter draft. Please check console for details.", 'error');
    }
});

function generateLetterPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Set margins
        const marginLeft = 20;
        const marginRight = 20;
        const marginTop = 30;
        let yPos = marginTop;
        
        // Add logo
        const logoUrl = 'https://i.postimg.cc/x19FXbdR/New-Transport-Logo.png';
        const img = new Image();
        img.src = logoUrl;
        
        img.onload = function() {
            doc.addImage(img, 'PNG', marginLeft, yPos, 30, 30);
            yPos += 40;
            
            // Company address
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text('Jayasooriya Transport', marginLeft, yPos);
            yPos += 5;
            doc.text('No. 123, Main Street', marginLeft, yPos);
            yPos += 5;
            doc.text('Colombo, Sri Lanka', marginLeft, yPos);
            yPos += 5;
            doc.text('Tel: +94 11 2345678', marginLeft, yPos);
            yPos += 5;
            doc.text('Email: info@jayasooriyatransport.com', marginLeft, yPos);
            yPos += 15;
            
            // Date and reference
            const letterDate = document.getElementById('letterDate').value;
            const formattedDate = new Date(letterDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.text(`Date: ${formattedDate}`, doc.internal.pageSize.getWidth() - marginRight - 30, yPos, { align: 'right' });
            yPos += 5;
            
            const refNo = document.getElementById('letterRefNo').value;
            if (refNo) {
                doc.text(`Ref: ${refNo}`, doc.internal.pageSize.getWidth() - marginRight - 30, yPos, { align: 'right' });
                yPos += 5;
            }
            
            yPos += 10;
            
            // Recipient details
            doc.setFontSize(10);
            doc.text(`To: ${document.getElementById('letterRecipient').value}`, marginLeft, yPos);
            yPos += 5;
            
            const recipientAddress = document.getElementById('letterRecipientAddress').value;
            if (recipientAddress) {
                const addressLines = doc.splitTextToSize(recipientAddress, doc.internal.pageSize.getWidth() - marginLeft - marginRight);
                doc.text(addressLines, marginLeft + 10, yPos);
                yPos += addressLines.length * 5 + 5;
            } else {
                yPos += 5;
            }
            
            // Subject
            doc.setFontSize(12);
            doc.setTextColor(231, 76, 60); // Red color
            doc.text(`Subject: ${document.getElementById('letterSubject').value}`, marginLeft, yPos);
            yPos += 10;
            
            // Salutation
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text(document.getElementById('letterSalutation').value, marginLeft, yPos);
            yPos += 10;
            
            // Body
            const bodyText = document.getElementById('letterBody').value;
            const bodyLines = doc.splitTextToSize(bodyText, doc.internal.pageSize.getWidth() - marginLeft - marginRight);
            doc.text(bodyLines, marginLeft, yPos);
            yPos += bodyLines.length * 6 + 10;
            
            // Closing
            doc.text(document.getElementById('letterClosing').value, marginLeft, yPos);
            yPos += 15;
            
            // Sender details
            doc.text(document.getElementById('letterSenderName').value, marginLeft, yPos);
            yPos += 5;
            doc.text(document.getElementById('letterSenderPosition').value, marginLeft, yPos);
            
            // Footer
            yPos = doc.internal.pageSize.getHeight() - 20;
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text('Jayasooriya Transport - Transport Management System', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
            
            // Save the PDF
            const subject = document.getElementById('letterSubject').value;
            const fileName = `Letter_${subject.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
            doc.save(fileName);
            showMessage('Letter PDF generated successfully!', 'success');
        };
        
        img.onerror = function() {
            // Fallback if logo fails to load
            doc.setFontSize(16);
            doc.setTextColor(231, 76, 60);
            doc.text('JAYASOORIYA TRANSPORT', doc.internal.pageSize.getWidth() / 2, marginTop, { align: 'center' });
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text('No. 123, Main Street, Colombo, Sri Lanka | Tel: +94 11 2345678', doc.internal.pageSize.getWidth() / 2, marginTop + 10, { align: 'center' });
            
            yPos = marginTop + 25;
            
            // Date and reference
            const letterDate = document.getElementById('letterDate').value;
            const formattedDate = new Date(letterDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.text(`Date: ${formattedDate}`, doc.internal.pageSize.getWidth() - marginRight - 30, yPos, { align: 'right' });
            yPos += 5;
            
            const refNo = document.getElementById('letterRefNo').value;
            if (refNo) {
                doc.text(`Ref: ${refNo}`, doc.internal.pageSize.getWidth() - marginRight - 30, yPos, { align: 'right' });
                yPos += 5;
            }
            
            yPos += 10;
            
            // Recipient details
            doc.setFontSize(10);
            doc.text(`To: ${document.getElementById('letterRecipient').value}`, marginLeft, yPos);
            yPos += 5;
            
            const recipientAddress = document.getElementById('letterRecipientAddress').value;
            if (recipientAddress) {
                const addressLines = doc.splitTextToSize(recipientAddress, doc.internal.pageSize.getWidth() - marginLeft - marginRight);
                doc.text(addressLines, marginLeft + 10, yPos);
                yPos += addressLines.length * 5 + 5;
            } else {
                yPos += 5;
            }
            
            // Subject
            doc.setFontSize(12);
            doc.setTextColor(231, 76, 60); // Red color
            doc.text(`Subject: ${document.getElementById('letterSubject').value}`, marginLeft, yPos);
            yPos += 10;
            
            // Salutation
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text(document.getElementById('letterSalutation').value, marginLeft, yPos);
            yPos += 10;
            
            // Body
            const bodyText = document.getElementById('letterBody').value;
            const bodyLines = doc.splitTextToSize(bodyText, doc.internal.pageSize.getWidth() - marginLeft - marginRight);
            doc.text(bodyLines, marginLeft, yPos);
            yPos += bodyLines.length * 6 + 10;
            
            // Closing
            doc.text(document.getElementById('letterClosing').value, marginLeft, yPos);
            yPos += 15;
            
            // Sender details
            doc.text(document.getElementById('letterSenderName').value, marginLeft, yPos);
            yPos += 5;
            doc.text(document.getElementById('letterSenderPosition').value, marginLeft, yPos);
            
            // Footer
            yPos = doc.internal.pageSize.getHeight() - 20;
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text('Jayasooriya Transport - Transport Management System', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
            
            // Save the PDF
            const subject = document.getElementById('letterSubject').value;
            const fileName = `Letter_${subject.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
            doc.save(fileName);
            showMessage('Letter PDF generated successfully!', 'success');
        };
    } catch (error) {
        console.error("Error generating letter PDF:", error);
        showMessage("Failed to generate letter PDF. Please check console for details.", 'error');
    }
}

// Load Vehicles with real-time updates
function loadVehicles() {
    db.collection('vehicles').orderBy('createdAt').onSnapshot((snapshot) => {
        const vehiclesList = document.getElementById('vehiclesList');
        vehiclesList.innerHTML = '';

        if (snapshot.empty) {
            vehiclesList.innerHTML = '<tr><td colspan="8">No vehicles found</td></tr>';
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
        document.getElementById('vehiclesList').innerHTML = '<tr><td colspan="8">Error loading vehicles</td></tr>';
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
        let totalAdvancePayments = 0;

        if (hiresSnapshot.empty) {
            hiresList.innerHTML = '<tr><td colspan="12">No hire records found</td></tr>';
            updateTotals(0, 0, 0, 0);
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
            totalHire += hire.hireAmount || 0;
            totalDistance += hire.distance || 0;

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
                <td>${hire.pricingTiers ? 'Tiered Pricing' : '-'}</td>
                <td>${hire.hireAmount.toFixed(2)}</td>
                <td>${hire.driverId ? (drivers[hire.driverId] || 'N/A') : 'N/A'}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${doc.id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${doc.id}">Delete</button>
                </td>
            `;
            hiresList.appendChild(tr);
        });

        advancePaymentsSnapshot.forEach(doc => {
            totalAdvancePayments += doc.data().amount;
        });

        updateTotals(totalFuel, totalHire, totalDistance, totalAdvancePayments);
    } catch (error) {
        console.error("Error loading hires:", error);
        document.getElementById('hiresList').innerHTML = '<tr><td colspan="12">Error loading hire records</td></tr>';
        updateTotals(0, 0, 0, 0);
    }
}

// Load Advance Payments with real-time updates
function loadAdvancePayments() {
    db.collection('advancePayments').orderBy('createdAt').onSnapshot(async (snapshot) => {
        const advancePaymentsList = document.getElementById('advancePaymentsList');
        advancePaymentsList.innerHTML = '';

        if (snapshot.empty) {
            advancePaymentsList.innerHTML = '<tr><td colspan="5">No advance payments found</td></tr>';
            return;
        }

        const vehiclesSnapshot = await db.collection('vehicles').get();
        const vehicles = {};
        vehiclesSnapshot.forEach(doc => {
            vehicles[doc.id] = doc.data().vehicleNumber;
        });

        snapshot.forEach(doc => {
            const ap = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${ap.date}</td>
                <td>${ap.month}</td>
                <td>${vehicles[ap.vehicleId] || 'N/A'}</td>
                <td>${ap.amount.toFixed(2)}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${doc.id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${doc.id}">Delete</button>
                </td>
            `;
            advancePaymentsList.appendChild(tr);
        });
    }, error => {
        console.error("Error loading advance payments:", error);
        document.getElementById('advancePaymentsList').innerHTML = '<tr><td colspan="5">Error loading advance payments</td></tr>';
    });
}

// Load Letters with real-time updates
function loadLetters() {
    db.collection('letters').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
        const lettersList = document.getElementById('lettersList');
        lettersList.innerHTML = '';

        if (snapshot.empty) {
            lettersList.innerHTML = '<tr><td colspan="4">No letters found</td></tr>';
            return;
        }

        snapshot.forEach(doc => {
            const letter = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${letter.date}</td>
                <td>${letter.subject}</td>
                <td>${letter.recipient}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${doc.id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${doc.id}">Delete</button>
                    <button class="action-btn pdf-btn" data-id="${doc.id}">PDF</button>
                </td>
            `;
            lettersList.appendChild(tr);
        });
    }, error => {
        console.error("Error loading letters:", error);
        document.getElementById('lettersList').innerHTML = '<tr><td colspan="4">Error loading letters</td></tr>';
    });
}

// Update totals display
function updateTotals(fuelCost, hireAmount, totalDistance, totalAdvancePayments) {
    document.getElementById('totalFuelCost').textContent = fuelCost.toFixed(2);
    document.getElementById('totalHireAmount').textContent = hireAmount.toFixed(2);
    document.getElementById('netProfit').textContent = (hireAmount - fuelCost - totalAdvancePayments).toFixed(2);
    document.getElementById('totalDistance').textContent = totalDistance.toFixed(1);
}

// Populate vehicle dropdowns
function populateVehicleDropdowns(vehiclesSnapshot) {
    const dropdowns = [
        document.getElementById('hireVehicle'),
        document.getElementById('editHireVehicle'),
        document.getElementById('filterVehicle'),
        document.getElementById('advancePaymentVehicle'),
        document.getElementById('editAdvancePaymentVehicle')
    ];

    dropdowns.forEach(dropdown => {
        while (dropdown.options.length > (dropdown.id === 'filterVehicle' ? 1 : 1)) dropdown.remove(1);

        if (!vehiclesSnapshot.empty) {
            vehiclesSnapshot.forEach(doc => {
                const vehicle = doc.data();
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = `${vehicle.vehicleNumber} (${vehicle.vehicleSize}ft)`;
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
                else if (table === 'advancePaymentsTable') collectionName = 'advancePayments';
                else if (table === 'lettersTable') collectionName = 'letters';

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
                    document.getElementById('editMinimumHire').value = vehicle.minimumHire;
                    document.getElementById('editTier1Distance').value = vehicle.tier1Distance;
                    document.getElementById('editTier1Price').value = vehicle.tier1Price;
                    document.getElementById('editTier2Distance').value = vehicle.tier2Distance;
                    document.getElementById('editTier2Price').value = vehicle.tier2Price;
                    document.getElementById('editTier3Price').value = vehicle.tier3Price;
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
            else if (table === 'advancePaymentsTable') {
                const doc = await db.collection('advancePayments').doc(id).get();
                if (doc.exists) {
                    const ap = doc.data();
                    document.getElementById('editAdvancePaymentId').value = id;
                    document.getElementById('editAdvancePaymentDate').value = ap.date;
                    document.getElementById('editAdvancePaymentMonth').value = ap.month;
                    document.getElementById('editAdvancePaymentAmount').value = ap.amount;

                    setTimeout(() => {
                        document.getElementById('editAdvancePaymentVehicle').value = ap.vehicleId;
                    }, 100);

                    document.getElementById('editAdvancePaymentModal').style.display = 'block';
                }
            }
        } catch (error) {
            console.error("Error loading document for editing:", error);
            showMessage("Failed to load record for editing. Please check console for details.", 'error');
        }
    }

    if (e.target.classList.contains('pdf-btn')) {
        const id = e.target.getAttribute('data-id');
        const docRef = await db.collection('letters').doc(id).get();
        if (docRef.exists) {
            const letter = docRef.data();
            
            // Populate the form with the letter data
            document.getElementById('letterDate').value = letter.date;
            document.getElementById('letterRefNo').value = letter.refNo || '';
            document.getElementById('letterRecipient').value = letter.recipient;
            document.getElementById('letterRecipientAddress').value = letter.recipientAddress || '';
            document.getElementById('letterSubject').value = letter.subject;
            document.getElementById('letterSalutation').value = letter.salutation;
            document.getElementById('letterBody').value = letter.body;
            document.getElementById('letterClosing').value = letter.closing;
            document.getElementById('letterSenderName').value = letter.senderName;
            document.getElementById('letterSenderPosition').value = letter.senderPosition;
            
            // Generate the PDF
            generateLetterPDF();
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
            vehicleSize: parseFloat(document.getElementById('editVehicleSize').value),
            minimumHire: parseFloat(document.getElementById('editMinimumHire').value),
            tier1Distance: parseFloat(document.getElementById('editTier1Distance').value),
            tier1Price: parseFloat(document.getElementById('editTier1Price').value),
            tier2Distance: parseFloat(document.getElementById('editTier2Distance').value),
            tier2Price: parseFloat(document.getElementById('editTier2Price').value),
            tier3Price: parseFloat(document.getElementById('editTier3Price').value),
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

        const updates = {
            vehicleId: vehicleId,
            vehicleNumber: vehicle.vehicleNumber,
            month: document.getElementById('editHireMonth').value,
            fromLocation: document.getElementById('editFromLocation').value,
            toLocation: document.getElementById('editToLocation').value,
            distance: distance,
            hireDate: document.getElementById('editHireDate').value,
            driverId: document.getElementById('editHireDriver').value || null,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            hireAmount: hireAmount,
            pricingTiers: {
                tier1Distance: vehicle.tier1Distance,
                tier1Price: vehicle.tier1Price,
                tier2Distance: vehicle.tier2Distance,
                tier2Price: vehicle.tier2Price,
                tier3Price: vehicle.tier3Price,
                minimumHire: vehicle.minimumHire
            }
        };

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

document.getElementById('editAdvancePaymentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const id = document.getElementById('editAdvancePaymentId').value;
        const vehicleId = document.getElementById('editAdvancePaymentVehicle').value;
        const vehicleDoc = await db.collection('vehicles').doc(vehicleId).get();

        if (!vehicleDoc.exists) {
            throw new Error("Selected vehicle not found");
        }

        const updates = {
            date: document.getElementById('editAdvancePaymentDate').value,
            month: document.getElementById('editAdvancePaymentMonth').value,
            vehicleId: vehicleId,
            vehicleNumber: vehicleDoc.data().vehicleNumber,
            amount: parseFloat(document.getElementById('editAdvancePaymentAmount').value),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        await db.collection('advancePayments').doc(id).update(updates);
        document.getElementById('editAdvancePaymentModal').style.display = 'none';
        showMessage('Advance payment updated successfully!', 'success');
    } catch (error) {
        console.error("Error updating advance payment:", error);
        showMessage("Failed to update advance payment. Please check console for details.", 'error');
    }
});

// Filter functionality
document.getElementById('applyFilter').addEventListener('click', async () => {
    try {
        const month = document.getElementById('filterMonth').value;
        const vehicle = document.getElementById('filterVehicle').value;

        let query = db.collection('hires');
        let advancePaymentsQuery = db.collection('advancePayments');

        if (month !== 'All') {
            query = query.where('month', '==', month);
            advancePaymentsQuery = advancePaymentsQuery.where('month', '==', month);
        }
        if (vehicle !== 'All') {
            query = query.where('vehicleId', '==', vehicle);
            advancePaymentsQuery = advancePaymentsQuery.where('vehicleId', '==', vehicle);
        }

        query = query.orderBy('createdAt');
        
        const [hiresSnapshot, advancePaymentsSnapshot] = await Promise.all([
            query.get(),
            advancePaymentsQuery.get()
        ]);

        const hiresList = document.getElementById('hiresList');
        hiresList.innerHTML = '';
        let totalFuel = 0;
        let totalHire = 0;
        let totalDistance = 0;
        let totalAdvancePayments = 0;

        if (hiresSnapshot.empty) {
            hiresList.innerHTML = '<tr><td colspan="12">No hire records found for selected filter</td></tr>';
            updateTotals(0, 0, 0, 0);
            return;
        }

        const driversSnapshot = await db.collection('drivers').get();
        const drivers = {};
        driversSnapshot.forEach(doc => {
            drivers[doc.id] = doc.data().name;
        });

        advancePaymentsSnapshot.forEach(doc => {
            totalAdvancePayments += doc.data().amount;
        });

        hiresSnapshot.forEach(doc => {
            const hire = doc.data();
            totalHire += hire.hireAmount || 0;
            totalDistance += hire.distance || 0;

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
                <td>${hire.pricingTiers ? 'Tiered Pricing' : '-'}</td>
                <td>${hire.hireAmount.toFixed(2)}</td>
                <td>${hire.driverId ? (drivers[hire.driverId] || 'N/A') : 'N/A'}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${doc.id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${doc.id}">Delete</button>
                </td>
            `;
            hiresList.appendChild(tr);
        });

        updateTotals(totalFuel, totalHire, totalDistance, totalAdvancePayments);
    } catch (error) {
        console.error("Error filtering hires:", error);
        document.getElementById('hiresList').innerHTML = '<tr><td colspan="12">Error filtering hire records</td></tr>';
        updateTotals(0, 0, 0, 0);
        showMessage("Error filtering records. Please check console for details.", 'error');
    }
});

// PDF Export Functionality
function exportHiresToPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const month = document.getElementById('filterMonth').value;
        const vehicleId = document.getElementById('filterVehicle').value;

        let vehicleName = "All Vehicles";
        if (vehicleId !== "All") {
            const vehicleSelect = document.getElementById('filterVehicle');
            const selectedOption = vehicleSelect.options[vehicleSelect.selectedIndex];
            vehicleName = selectedOption.text;
        }

        const logoUrl = 'https://i.postimg.cc/x19FXbdR/New-Transport-Logo.png';

        const img = new Image();
        img.src = logoUrl;
        img.onload = async function() {
            const imgWidth = 30;
            const imgHeight = 30;
            const pageWidth = doc.internal.pageSize.getWidth();
            const x = (pageWidth - imgWidth) / 2;
            doc.addImage(img, 'PNG', x, 10, imgWidth, imgHeight);

            doc.setFontSize(20);
            doc.setTextColor(231, 76, 60);
            doc.text('JAYASOORIYA TRANSPORT', pageWidth / 2, 50, { align: 'center' });
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('Vehicle Hire Report', pageWidth / 2, 60, { align: 'center' });

            doc.setFontSize(12);
            doc.text(`Month: ${month === 'All' ? 'All Months' : month}`, 15, 70);
            doc.text(`Vehicle: ${vehicleName}`, 15, 77);

            const today = new Date();
            doc.text(`Report Date: ${today.toLocaleDateString()}`, 15, 84);

            const hiresTable = document.getElementById('hiresTable');
            const rows = hiresTable.querySelectorAll('tbody tr');

            if (rows.length === 0) {
                doc.setFontSize(12);
                doc.text('No hire records found for selected filter', 15, 100);
            } else {
                const tableData = [];
                tableData.push([
                    'Date', 'Vehicle', 'From', 'To', 'Distance',
                    'Fuel (L)', 'Fuel Price/L', 'Fuel Cost', 'Pricing',
                    'Hire Amount', 'Driver'
                ]);

                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    const rowData = [];
                    for (let i = 0; i < cells.length - 1; i++) {
                        rowData.push(cells[i].textContent.trim());
                    }
                    tableData.push(rowData);
                });

                doc.autoTable({
                    startY: 95,
                    head: [tableData[0]],
                    body: tableData.slice(1),
                    theme: 'grid',
                    headStyles: {
                        fillColor: [231, 76, 60],
                        textColor: [255, 255, 255]
                    },
                    alternateRowStyles: {
                        fillColor: [245, 245, 245]
                    },
                    styles: {
                        fontSize: 8,
                        cellPadding: 3
                    },
                    columnStyles: {
                        0: { cellWidth: 15 }, 1: { cellWidth: 20 }, 2: { cellWidth: 20 },
                        3: { cellWidth: 20 }, 4: { cellWidth: 15 }, 5: { cellWidth: 12 },
                        6: { cellWidth: 15 }, 7: { cellWidth: 15 }, 8: { cellWidth: 15 },
                        9: { cellWidth: 20 }, 10: { cellWidth: 25 }
                    }
                });

                const totalFuel = document.getElementById('totalFuelCost').textContent;
                const totalHire = document.getElementById('totalHireAmount').textContent;
                const netProfit = document.getElementById('netProfit').textContent;
                const totalDistance = document.getElementById('totalDistance').textContent;

                let advancePaymentsQuery = db.collection('advancePayments');
                if (month !== 'All') {
                    advancePaymentsQuery = advancePaymentsQuery.where('month', '==', month);
                }
                if (vehicleId !== 'All') {
                    advancePaymentsQuery = advancePaymentsQuery.where('vehicleId', '==', vehicleId);
                }
                const advancePaymentsSnapshot = await advancePaymentsQuery.get();
                let filteredAdvancePaymentsTotal = 0;
                advancePaymentsSnapshot.forEach(doc => {
                    filteredAdvancePaymentsTotal += doc.data().amount;
                });

                let finalY = doc.lastAutoTable.finalY + 10;

                const textHeight = 7 * 5;
                if (finalY + textHeight > doc.internal.pageSize.getHeight() - 20) {
                    doc.addPage();
                    finalY = 20;
                }

                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);
                doc.text(`Total Distance: ${totalDistance} KM`, 15, finalY);
                doc.text(`Total Fuel Cost: LKR ${totalFuel}`, 15, finalY + 7);
                doc.text(`Total Hire Amount: LKR ${totalHire}`, 15, finalY + 14);
                doc.text(`Total Advance Payments: LKR ${filteredAdvancePaymentsTotal.toFixed(2)}`, 15, finalY + 21);
                doc.setFontSize(12);
                doc.setTextColor(231, 76, 60);
                doc.text(`Net Profit (After Advances): LKR ${netProfit}`, 15, finalY + 31);

                finalY = finalY + 44;
                if (finalY > doc.internal.pageSize.getHeight() - 20) {
                    doc.addPage();
                    finalY = 20;
                }
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.text('This is a system-generated report, no signature is required.', pageWidth / 2, finalY, { align: 'center' });
            }

            doc.save(`Hire_Report_${month === 'All' ? 'All_Months' : month}_${vehicleName.replace(/ /g, '_')}.pdf`);
            showMessage('PDF exported successfully!', 'success');
        };

        img.onerror = async function() {
            console.warn("Logo failed to load, generating PDF without it");

            const pageWidth = doc.internal.pageSize.getWidth();
            doc.setFontSize(20);
            doc.setTextColor(231, 76, 60);
            doc.text('JAYASOORIYA ENTERPRISES', pageWidth / 2, 20, { align: 'center' });
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('Vehicle Hire Report', pageWidth / 2, 30, { align: 'center' });

            doc.setFontSize(12);
            doc.text(`Month: ${month === 'All' ? 'All Months' : month}`, 15, 40);
            doc.text(`Vehicle: ${vehicleName}`, 15, 47);

            const today = new Date();
            doc.text(`Report Date: ${today.toLocaleDateString()}`, 15, 54);

            const hiresTable = document.getElementById('hiresTable');
            const rows = hiresTable.querySelectorAll('tbody tr');

            if (rows.length === 0) {
                doc.setFontSize(12);
                doc.text('No hire records found for selected filter', 15, 70);
            } else {
                const tableData = [];
                tableData.push([
                    'Date', 'Vehicle', 'From', 'To', 'Distance',
                    'Fuel (L)', 'Fuel Price/L', 'Fuel Cost', 'Pricing',
                    'Hire Amount', 'Driver'
                ]);

                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    const rowData = [];
                    for (let i = 0; i < cells.length - 1; i++) {
                        rowData.push(cells[i].textContent.trim());
                    }
                    tableData.push(rowData);
                });

                doc.autoTable({
                    startY: 70,
                    head: [tableData[0]],
                    body: tableData.slice(1),
                    theme: 'grid',
                    headStyles: {
                        fillColor: [231, 76, 60],
                        textColor: [255, 255, 255]
                    },
                    alternateRowStyles: {
                        fillColor: [245, 245, 245]
                    },
                    styles: {
                        fontSize: 8,
                        cellPadding: 3
                    },
                    columnStyles: {
                        0: { cellWidth: 15 }, 1: { cellWidth: 20 }, 2: { cellWidth: 20 },
                        3: { cellWidth: 20 }, 4: { cellWidth: 15 }, 5: { cellWidth: 12 },
                        6: { cellWidth: 15 }, 7: { cellWidth: 15 }, 8: { cellWidth: 15 },
                        9: { cellWidth: 20 }, 10: { cellWidth: 25 }
                    }
                });

                const totalFuel = document.getElementById('totalFuelCost').textContent;
                const totalHire = document.getElementById('totalHireAmount').textContent;
                const netProfit = document.getElementById('netProfit').textContent;
                const totalDistance = document.getElementById('totalDistance').textContent;

                let advancePaymentsQuery = db.collection('advancePayments');
                if (month !== 'All') {
                    advancePaymentsQuery = advancePaymentsQuery.where('month', '==', month);
                }
                if (vehicleId !== 'All') {
                    advancePaymentsQuery = advancePaymentsQuery.where('vehicleId', '==', vehicleId);
                }
                const advancePaymentsSnapshot = await advancePaymentsQuery.get();
                let filteredAdvancePaymentsTotal = 0;
                advancePaymentsSnapshot.forEach(doc => {
                    filteredAdvancePaymentsTotal += doc.data().amount;
                });

                let finalY = doc.lastAutoTable.finalY + 10;

                const textHeight = 7 * 5;
                if (finalY + textHeight > doc.internal.pageSize.getHeight() - 20) {
                    doc.addPage();
                    finalY = 20;
                }

                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);
                doc.text(`Total Distance: ${totalDistance} KM`, 15, finalY);
                doc.text(`Total Fuel Cost: LKR ${totalFuel}`, 15, finalY + 7);
                doc.text(`Total Hire Amount: LKR ${totalHire}`, 15, finalY + 14);
                doc.text(`Total Advance Payments: LKR ${filteredAdvancePaymentsTotal.toFixed(2)}`, 15, finalY + 21);
                doc.setFontSize(12);
                doc.setTextColor(231, 76, 60);
                doc.text(`Net Profit (After Advances): LKR ${netProfit}`, 15, finalY + 31);

                finalY = finalY + 44;
                if (finalY > doc.internal.pageSize.getHeight() - 20) {
                    doc.addPage();
                    finalY = 20;
                }
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.text('This is a system-generated report, no signature is required.', pageWidth / 2, finalY, { align: 'center' });
            }

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
    loadAdvancePayments();
    loadLetters();

    // Initialize totals display
    updateTotals(0, 0, 0, 0);

    // Add PDF export button event listener
    document.getElementById('exportPdfBtn').addEventListener('click', exportHiresToPDF);
}