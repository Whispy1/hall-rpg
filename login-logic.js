// 1. Initialize Supabase Connection
const supabaseUrl = 'https://ijksxcqbecobagkbvghm.supabase.co';
const supabaseKey = 'sb_publishable_Z2SYmoDOGNRe8zqAdjGymg_xHzXh1QA';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('login-name').value.trim();
    const pass = document.getElementById('login-pass').value;
    const errorMsg = document.getElementById('login-error');

    // --- MASTER ACCOUNT CREDENTIALS ---
    const MASTER_USER = "Master";
    const MASTER_PASS = "123456";

    // 1. CHECK FOR MASTER ACCOUNT (ADMIN)
    if (name === MASTER_USER && pass === MASTER_PASS) {
        alert("Master Account Verified. Welcome, Administrator.");
        window.location.href = "admin.html";
        return; 
    } 

    // 2. CHECK FOR REGULAR PLAYER IN CLOUD DATABASE
    // We search the 'players' table for a name that matches (case-insensitive)
    const { data: user, error } = await _supabase
        .from('players')
        .select('*')
        .ilike('name', name) 
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error("Database Error:", error.message);
        return;
    }

    if (user) {
        // --- THE GATEKEEPER CHECK ---
        if (user.status === "Pending") {
            alert("ACCESS DENIED: Your biometric data is still being processed. Contact the Overseer for authorization.");
            if(errorMsg) {
                errorMsg.innerText = "AUTHORIZATION PENDING";
                errorMsg.style.display = "block";
            }
        } else if (user.status === "DECEASED") {
            // Check for deceased status during login
            alert("CRITICAL ERROR: This biometric signature has been TERMINATED.");
            if(errorMsg) {
                errorMsg.innerText = "IDENTITY ELIMINATED";
                errorMsg.style.display = "block";
            }
        } else {
            // STATUS IS "Verified" -> LOG IN
            alert(`Welcome back, ${user.name}. Loading Player Profile...`);
            // Redirecting to player.html with their unique Cloud ID
            window.location.href = `player.html?id=${user.id}`;
        }
    } 
    // 3. NO ACCOUNT FOUND
    else {
        if (errorMsg) {
            errorMsg.innerText = "IDENTITY NOT RECOGNIZED. PLEASE REGISTER.";
            errorMsg.style.display = "block";
        } else {
            alert("Identity not recognized. Please sign up.");
        }
    }
});