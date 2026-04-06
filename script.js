// --- INITIAL STATE & STATS ---
let pointsRemaining = 5;
const stats = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8, luk: 0 };
const minStats = { ...stats };

// --- SUPABASE CONNECTION (Initialized in HTML, but helper here) ---
// Note: _supabase is already defined in your sing_up.html

// --- NAVIGATION & VALIDATION ---
function showStep(from, to) {
    const currentStepDiv = document.getElementById(`step-${from}`);
    const inputs = currentStepDiv.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach(i => {
        if (i.value.trim() === "") {
            isValid = false;
            i.style.borderColor = "#ef476f"; // Cyber-red error
        } else {
            i.style.borderColor = "rgba(255, 255, 255, 0.1)";
        }
    });

    if (isValid) {
        currentStepDiv.style.display = 'none';
        const nextDiv = document.getElementById(`step-${to}`);
        if (nextDiv) {
            nextDiv.style.display = 'block';
            updateHeaders(to);
        }
    }
}

function updateHeaders(step) {
    const t = document.getElementById('form-title');
    const s = document.getElementById('form-subtitle');
    if (step === 2) { t.innerText = "Class Selection"; s.innerText = "Assign your role."; }
    else if (step === 3) { t.innerText = "System Request"; s.innerText = "Finalize entry."; }
    else if (step === 4) { t.innerText = "Attributes"; s.innerText = "Distribute 5 points."; }
}

// --- STAT LOGIC ---
window.changeStat = function(name, amt) {
    if (amt > 0 && pointsRemaining <= 0) return;
    if (amt < 0 && stats[name] <= minStats[name]) return;
    
    stats[name] += amt;
    pointsRemaining -= amt;
    
    const valDisplay = document.getElementById(`${name}-val`);
    const pointsDisplay = document.getElementById('points-left');
    
    if (valDisplay) valDisplay.innerText = stats[name];
    if (pointsDisplay) pointsDisplay.innerText = pointsRemaining;
};

// --- BUTTON LISTENERS WITH CLOUD CHECKS ---

// Step 1 -> Step 2 (Identity Check)
const btn1 = document.getElementById('btn-step-1');
if (btn1) {
    btn1.addEventListener('click', async () => {
        const nameInput = document.getElementById('display_name');
        const nameValue = nameInput.value.trim();

        if (nameValue === "") {
            nameInput.style.borderColor = "#ef476f";
            alert("IDENTIFY YOURSELF, ENTITY.");
            return;
        }

        // CLOUD CHECK: Does this name exist in Supabase?
        const { data, error } = await _supabase
            .from('players')
            .select('name')
            .ilike('name', nameValue); // Case-insensitive check

        if (data && data.length > 0) {
            alert("Identity already exists in the Cloud Buffer. Choose another.");
            return;
        }

        showStep(1, 2);
    });
}

// Step 2 -> Step 3
const btn2 = document.getElementById('btn-step-2');
if (btn2) { btn2.addEventListener('click', () => showStep(2, 3)); }

// Step 3 -> Step 4
const btn3 = document.getElementById('btn-step-3');
if (btn3) { btn3.addEventListener('click', (e) => { e.preventDefault(); showStep(3, 4); }); }

// --- FINAL SAVE LOGIC (TO SUPABASE) ---

document.getElementById('signup-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (pointsRemaining > 0) { alert("Distribute all points!"); return; }

    // Create the Player Object
    const newPlayer = {
        id: Date.now(), // Unique ID based on timestamp
        name: document.getElementById('display_name').value.trim(),
        requestClass: document.getElementById('question_1').value,
        finalClass: "---",
        wish: document.getElementById('question_2').value,
        stats: { ...stats },
        level: 1,
        skills: [], // Empty array for Supabase JSONB
        inventory: "Basic Rags",
        missions: [], // Empty array for Supabase JSONB
        status: "Pending"
    };

    // UPLOAD TO SUPABASE
    const { error } = await _supabase
        .from('players')
        .insert([newPlayer]);

    if (error) {
        console.error("Cloud Error:", error.message);
        alert("UPLOAD FAILED: " + error.message);
    } else {
        // UI SUCCESS SWAP
        document.getElementById('signup-form').style.display = 'none';
        document.getElementById('form-title').style.display = 'none';
        document.getElementById('form-subtitle').style.display = 'none';
        
        const successBox = document.getElementById('success-box');
        successBox.style.display = 'block';
    }
});