// ============ LANGUAGE STATE ============
let currentLang = localStorage.getItem('sarkarisaathi_lang') || 'en';
let currentCategory = null; // remembers which category is open so we can re-render on toggle

// Static UI text (anything NOT inside the scheme cards)
const uiText = {
    heroTitle: { en: "SarkariSaathi", hi: "सरकारीसाथी" },
    heroTagline: { en: "Complete information on government schemes, all in one place", hi: "सरकारी योजनाओं की पूरी जानकारी, एक जगह" },
    chooseCategory: { en: "Choose your category", hi: "अपनी category चुनें" },
    catDefence: { en: "Defence Families", hi: "रक्षा परिवार" },
    catStudents: { en: "Students", hi: "छात्र" },
    catWomen: { en: "Women", hi: "महिलाएं" },
    catFarmer: { en: "Farmer", hi: "किसान" },
    catSenior: { en: "Senior Citizens", hi: "वरिष्ठ नागरिक" },
    catDisability: { en: "Differently Abled", hi: "दिव्यांगजन" },
    catBackward: { en: "Backward Classes", hi: "पिछड़ा वर्ग" },
    current: { en: "Current", hi: "वर्तमान" },
    upcoming: { en: "Upcoming", hi: "आने वाली" },
    ongoing: { en: "Ongoing", hi: "चालू" },
    noSchemes: { en: "No schemes available", hi: "कोई योजना उपलब्ध नहीं है" },
    eligibility: { en: "Eligibility", hi: "पात्रता" },
    benefit: { en: "Benefit", hi: "लाभ" },
    viewDetails: { en: "View Details", hi: "विवरण देखें" },
    toggleBtn: { en: "हिंदी में देखें", hi: "View in English" },

    // ---- Auth ----
    loginBtnText: { en: "Login", hi: "लॉगिन" },
    logoutBtnText: { en: "Logout", hi: "लॉगआउट" },
    welcomePrefix: { en: "Welcome, ", hi: "नमस्ते, " },
    authModalTitleLogin: { en: "Login", hi: "लॉगिन करें" },
    authModalTitleSignup: { en: "Sign Up", hi: "साइन अप करें" },
    emailOrUsernameLabel: { en: "Email or Username", hi: "ईमेल या यूज़रनेम" },
    passwordLabel: { en: "Password", hi: "पासवर्ड" },
    usernameLabel: { en: "Username", hi: "यूज़रनेम" },
    emailLabel: { en: "Email", hi: "ईमेल" },
    loginSubmitBtn: { en: "Login", hi: "लॉगिन करें" },
    signupSubmitBtn: { en: "Sign Up", hi: "साइन अप करें" },
    noAccountText: { en: "Don't have an account?", hi: "खाता नहीं है?" },
    signupLinkText: { en: "Sign up", hi: "साइन अप करें" },
    haveAccountText: { en: "Already have an account?", hi: "पहले से खाता है?" },
    loginLinkText: { en: "Login", hi: "लॉगिन करें" }
};

// ============ AUTH STATE ============
const API_BASE_URL = "http://localhost:8000/api/v1/users"; // change this if your backend runs elsewhere
let currentUser = null;
let authView = 'login'; // tracks which form is showing inside the modal: 'login' or 'signup'

function t(key) {
    return uiText[key] ? uiText[key][currentLang] : key;
}

function applyStaticTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
        var key = el.getAttribute('data-i18n');
        if (uiText[key]) el.textContent = uiText[key][currentLang];
    });
    var btn = document.getElementById('langToggle');
    if (btn) btn.textContent = currentLang === 'hi' ? uiText.toggleBtn.hi : uiText.toggleBtn.en;

    // keep the auth modal title in sync with whichever form is currently shown
    var modalTitle = document.getElementById('authModalLabel');
    if (modalTitle) modalTitle.textContent = authView === 'login' ? t('authModalTitleLogin') : t('authModalTitleSignup');

    // keep the "Welcome, X" text in sync if logged in
    if (currentUser) {
        var welcomeEl = document.getElementById('welcomeText');
        if (welcomeEl) welcomeEl.textContent = t('welcomePrefix') + currentUser.username;
    }

    document.documentElement.setAttribute('lang', currentLang);
}

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'hi' : 'en';
    localStorage.setItem('sarkarisaathi_lang', currentLang);
    applyStaticTranslations();
    if (currentCategory) {
        loadSchemes(currentCategory); // re-render the open scheme cards in the new language
    }
}

// ---- Modal view switching (login <-> signup) ----
function showLoginForm() {
    authView = 'login';
    $('#signupForm').hide();
    $('#loginForm').show();
    $('#showSignupPara').show();
    $('#showLoginPara').hide();
    $('#authModalLabel').text(t('authModalTitleLogin'));
    hideAuthError();
}

function showSignupForm() {
    authView = 'signup';
    $('#loginForm').hide();
    $('#signupForm').show();
    $('#showSignupPara').hide();
    $('#showLoginPara').show();
    $('#authModalLabel').text(t('authModalTitleSignup'));
    hideAuthError();
}

function showAuthError(message) {
    $('#authError').text(message).show();
}

function hideAuthError() {
    $('#authError').hide();
}

// ---- UI state for logged in / logged out ----
function updateAuthUI() {
    if (currentUser) {
        $('#loginBtnWrapper').hide();
        $('#userStatusWrapper').show();
        $('#welcomeText').text(t('welcomePrefix') + currentUser.username);
    } else {
        $('#userStatusWrapper').hide();
        if (currentCategory) $('#loginBtnWrapper').show(); // only show Login once a category has been picked
    }
}

// ---- API calls ----

// Checks whether the user already has a valid session (via the accessToken cookie)
// and restores `currentUser` on page load/refresh, since `currentUser` itself
// is just an in-memory variable and does not survive a reload.
async function fetchCurrentUser() {
    try {
        var res = await fetch(API_BASE_URL + '/current-user', {
            credentials: 'include'
        });
        if (!res.ok) return; // not logged in — that's fine, just stay logged out
        var data = await res.json();
        currentUser = data.data;
        updateAuthUI();
    } catch (err) {
        // server unreachable or no session — ignore silently
    }
}

async function handleLogin(e) {
    e.preventDefault();
    hideAuthError();
    var identifier = $('#loginIdentifier').val().trim();
    var password = $('#loginPassword').val();
    var body = identifier.includes('@') ? { email: identifier, password: password } : { username: identifier, password: password };

    try {
        var res = await fetch(API_BASE_URL + '/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body)
        });
        var data = await res.json();
        if (!res.ok) {
            showAuthError(data.message || 'Login failed');
            return;
        }
        currentUser = data.data.user;
        $('#authModal').modal('hide');
        $('#loginForm')[0].reset();
        updateAuthUI();
    } catch (err) {
        showAuthError('Could not connect to server. Is the backend running?');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    hideAuthError();
    var username = $('#signupUsername').val().trim();
    var email = $('#signupEmail').val().trim();
    var password = $('#signupPassword').val();

    try {
        var res = await fetch(API_BASE_URL + '/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username: username, email: email, password: password })
        });
        var data = await res.json();
        if (!res.ok) {
            showAuthError(data.message || 'Sign up failed');
            return;
        }
        // account created — switch them to the login form to sign in
        $('#signupForm')[0].reset();
        showLoginForm();
        $('#loginIdentifier').val(username);
    } catch (err) {
        showAuthError('Could not connect to server. Is the backend running?');
    }
}

async function handleLogout() {
    try {
        await fetch(API_BASE_URL + '/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
        // ignore network errors on logout — log out locally regardless
    }
    currentUser = null;
    updateAuthUI();
}

document.addEventListener('DOMContentLoaded', function () {
    fetchCurrentUser(); // restore session (if any) before anything else renders
    applyStaticTranslations();
    var btn = document.getElementById('langToggle');
    if (btn) btn.addEventListener('click', toggleLanguage);

    // auth wiring
    $('#loginForm').on('submit', handleLogin);
    $('#signupForm').on('submit', handleSignup);
    $('#showSignupLink').on('click', function (e) { e.preventDefault(); showSignupForm(); });
    $('#showLoginLink').on('click', function (e) { e.preventDefault(); showLoginForm(); });
    $('#logoutBtn').on('click', handleLogout);
    $('#authModal').on('show.bs.modal', function () {
        showLoginForm();
        $('#loginForm')[0].reset();
        $('#signupForm')[0].reset();
    });
});

// ============ CATEGORY / SCHEME LOGIC ============

// NOTE: this function now takes `el` (the clicked element) as a second argument
// instead of relying on the implicit global `event` object.
// You must update your HTML so each category card passes `this`, e.g.:
//   <div class="category-card" onclick="showSchemes('students', this)">
function showSchemes(category, el) {
    currentCategory = category;
    $('.category-card').removeClass('active');
    if (el) el.classList.add('active');
    $('#schemesSection').fadeIn(500);
    $('html, body').animate({
        scrollTop: $('#schemesSection').offset().top - 20
    }, 600);
    loadSchemes(category);
    updateAuthUI(); // reveal the Login button now that a category has been picked
}

function loadSchemes(category) {
    var schemes = getSchemes(category);
    var html = `
    <h4 class="mb-4 text-center">${schemes.title[currentLang]}</h4>
    <ul class="nav nav-pills scheme-tabs mb-4 justify-content-center">
        <li class="nav-item"><a class="nav-link active" data-toggle="pill" href="#current">📋 ${t('current')}</a></li>
        <li class="nav-item"><a class="nav-link" data-toggle="pill" href="#upcoming">🔜 ${t('upcoming')}</a></li>
        <li class="nav-item"><a class="nav-link" data-toggle="pill" href="#ongoing">⏳ ${t('ongoing')}</a></li>
    </ul>
    <div class="tab-content">
        <div class="tab-pane fade show active" id="current">${renderSchemes(schemes.current, 'current')}</div>
        <div class="tab-pane fade" id="upcoming">${renderSchemes(schemes.upcoming, 'upcoming')}</div>
        <div class="tab-pane fade" id="ongoing">${renderSchemes(schemes.ongoing, 'ongoing')}</div>
    </div>`;
    $('#schemesSection').html(html);
}

function renderSchemes(schemes, type) {
    if (schemes.length === 0) return `<p class="text-center text-muted">${t('noSchemes')}</p>`;
    var badgeClass = type === 'current' ? 'scheme-badge-current' : type === 'upcoming' ? 'scheme-badge-upcoming' : 'scheme-badge-ongoing';
    var typeLabel = t(type);
    var html = '<div class="row">';
    schemes.forEach(function (scheme) {
        html += `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card scheme-card h-100">
                <div class="card-body">
                    <span class="${badgeClass} mb-2 d-inline-block">${typeLabel.toUpperCase()}</span>
                    <h6 class="font-weight-bold">${scheme.name[currentLang]}</h6>
                    <p class="text-muted small">${scheme.description[currentLang]}</p>
                    <p class="small"><b>${t('eligibility')}:</b> ${scheme.eligibility[currentLang]}</p>
                    <p class="small"><b>${t('benefit')}:</b> ${scheme.benefit[currentLang]}</p>
                </div>
                <div class="card-footer bg-white border-0">
                    <a href="${scheme.link}" target="_blank" class="btn btn-sm btn-outline-warning btn-block">${t('viewDetails')} 🔗</a>
                </div>
            </div>
        </div>`;
    });
    html += '</div>';
    return html;
}

function getSchemes(category) {
    var data = {
        students: {
            title: { en: "🎓 Students", hi: "🎓 छात्र" },
            current: [
                {
                    name: { en: "PM Scholarship Scheme", hi: "पीएम स्कॉलरशिप योजना" },
                    description: { en: "Scholarship for children of ex-servicemen", hi: "भूतपूर्व सैनिकों के बच्चों के लिए स्कॉलरशिप" },
                    eligibility: { en: "Children of Ex-Servicemen, min 60% marks", hi: "भूतपूर्व सैनिकों के बच्चे, न्यूनतम 60% अंक" },
                    benefit: { en: "₹2500/month for boys, ₹3000/month for girls", hi: "लड़कों के लिए ₹2500/माह, लड़कियों के लिए ₹3000/माह" },
                    link: "https://scholarships.gov.in"
                },
                {
                    name: { en: "National Scholarship Portal", hi: "राष्ट्रीय स्कॉलरशिप पोर्टल" },
                    description: { en: "Central government scholarships for students", hi: "छात्रों के लिए केंद्र सरकार की स्कॉलरशिप" },
                    eligibility: { en: "Students from Class 1 to PhD", hi: "कक्षा 1 से पीएचडी तक के छात्र" },
                    benefit: { en: "₹1000 to ₹20000 per year", hi: "प्रति वर्ष ₹1000 से ₹20000" },
                    link: "https://scholarships.gov.in"
                },
                {
                    name: { en: "Central Sector Scholarship", hi: "केंद्रीय क्षेत्र स्कॉलरशिप" },
                    description: { en: "Merit based scholarship for college students", hi: "कॉलेज छात्रों के लिए मेरिट आधारित स्कॉलरशिप" },
                    eligibility: { en: "Top 20 percentile in Class 12, family income below ₹8 lakh", hi: "कक्षा 12 में टॉप 20 पर्सेंटाइल, परिवार की आय ₹8 लाख से कम" },
                    benefit: { en: "₹10,000 to ₹20,000 per year", hi: "प्रति वर्ष ₹10,000 से ₹20,000" },
                    link: "https://scholarships.gov.in"
                },
                {
                    name: { en: "Ishan Uday Scholarship", hi: "इशान उदय स्कॉलरशिप" },
                    description: { en: "For students from North East region", hi: "पूर्वोत्तर क्षेत्र के छात्रों के लिए" },
                    eligibility: { en: "Students from NE states pursuing graduation", hi: "स्नातक कर रहे पूर्वोत्तर राज्यों के छात्र" },
                    benefit: { en: "₹5,400 to ₹7,800 per month", hi: "प्रति माह ₹5,400 से ₹7,800" },
                    link: "https://scholarships.gov.in"
                }
            ],
            upcoming: [
                {
                    name: { en: "Pragati Scholarship", hi: "प्रगति स्कॉलरशिप" },
                    description: { en: "For girl students in technical education", hi: "तकनीकी शिक्षा में छात्राओं के लिए" },
                    eligibility: { en: "Girl students in Diploma/Degree technical courses", hi: "डिप्लोमा/डिग्री तकनीकी कोर्स की छात्राएं" },
                    benefit: { en: "₹50,000 per year", hi: "प्रति वर्ष ₹50,000" },
                    link: "https://www.aicte-india.org"
                }
            ],
            ongoing: [
                {
                    name: { en: "Post Matric Scholarship", hi: "पोस्ट मैट्रिक स्कॉलरशिप" },
                    description: { en: "For SC/ST students after Class 10", hi: "कक्षा 10 के बाद SC/ST छात्रों के लिए" },
                    eligibility: { en: "SC/ST students, family income below ₹2.5 lakh", hi: "SC/ST छात्र, परिवार की आय ₹2.5 लाख से कम" },
                    benefit: { en: "Full tuition fee + maintenance allowance", hi: "पूरी ट्यूशन फीस + निर्वाह भत्ता" },
                    link: "https://scholarships.gov.in"
                }
            ]
        },
        women: {
            title: { en: "👩 Women", hi: "👩 महिलाएं" },
            current: [
                {
                    name: { en: "Beti Bachao Beti Padhao", hi: "बेटी बचाओ बेटी पढ़ाओ" },
                    description: { en: "Scheme to promote welfare of girl child", hi: "बालिका के कल्याण को बढ़ावा देने की योजना" },
                    eligibility: { en: "Girl child 0-18 years, all families", hi: "0-18 वर्ष की बालिकाएं, सभी परिवार" },
                    benefit: { en: "Education support + awareness programs", hi: "शिक्षा सहायता + जागरूकता कार्यक्रम" },
                    link: "https://wcd.nic.in"
                },
                {
                    name: { en: "Sukanya Samriddhi Yojana", hi: "सुकन्या समृद्धि योजना" },
                    description: { en: "Savings scheme for girl child", hi: "बालिका के लिए बचत योजना" },
                    eligibility: { en: "Girl child below 10 years", hi: "10 वर्ष से कम उम्र की बालिका" },
                    benefit: { en: "8.2% interest rate, tax benefits", hi: "8.2% ब्याज दर, टैक्स लाभ" },
                    link: "https://www.indiapost.gov.in"
                },
                {
                    name: { en: "PM Matru Vandana Yojana", hi: "पीएम मातृ वंदना योजना" },
                    description: { en: "Maternity benefit scheme", hi: "मातृत्व लाभ योजना" },
                    eligibility: { en: "Pregnant women for first live birth", hi: "पहले जीवित बच्चे के लिए गर्भवती महिलाएं" },
                    benefit: { en: "₹5,000 direct benefit transfer", hi: "₹5,000 सीधा लाभ स्थानांतरण" },
                    link: "https://pmmvy.wcd.gov.in"
                }
            ],
            upcoming: [
                {
                    name: { en: "Mahila Samman Saving Certificate", hi: "महिला सम्मान बचत प्रमाणपत्र" },
                    description: { en: "Special savings scheme for women", hi: "महिलाओं के लिए विशेष बचत योजना" },
                    eligibility: { en: "All women and girls", hi: "सभी महिलाएं और बालिकाएं" },
                    benefit: { en: "7.5% interest rate, 2 year deposit", hi: "7.5% ब्याज दर, 2 वर्ष की जमा अवधि" },
                    link: "https://www.indiapost.gov.in"
                }
            ],
            ongoing: [
                {
                    name: { en: "Stand Up India", hi: "स्टैंड अप इंडिया" },
                    description: { en: "Loans for women entrepreneurs", hi: "महिला उद्यमियों के लिए ऋण" },
                    eligibility: { en: "Women above 18 years for business", hi: "व्यवसाय के लिए 18 वर्ष से अधिक उम्र की महिलाएं" },
                    benefit: { en: "₹10 lakh to ₹1 crore loan", hi: "₹10 लाख से ₹1 करोड़ तक ऋण" },
                    link: "https://www.standupmitra.in"
                },
                {
                    name: { en: "Mahila Shakti Kendra", hi: "महिला शक्ति केंद्र" },
                    description: { en: "Empowerment of rural women", hi: "ग्रामीण महिलाओं का सशक्तिकरण" },
                    eligibility: { en: "Rural women across India", hi: "देशभर की ग्रामीण महिलाएं" },
                    benefit: { en: "Skill development + awareness", hi: "कौशल विकास + जागरूकता" },
                    link: "https://wcd.nic.in"
                }
            ]
        },
        farmer: {
            title: { en: "🌾 Farmer", hi: "🌾 किसान" },
            current: [
                {
                    name: { en: "PM Kisan Samman Nidhi", hi: "पीएम किसान सम्मान निधि" },
                    description: { en: "Direct income support to farmers", hi: "किसानों को सीधी आय सहायता" },
                    eligibility: { en: "All small and marginal farmers", hi: "सभी छोटे और सीमांत किसान" },
                    benefit: { en: "₹6,000 per year in 3 installments", hi: "3 किस्तों में प्रति वर्ष ₹6,000" },
                    link: "https://pmkisan.gov.in"
                },
                {
                    name: { en: "Pradhan Mantri Fasal Bima Yojana", hi: "प्रधानमंत्री फसल बीमा योजना" },
                    description: { en: "Crop insurance scheme for farmers", hi: "किसानों के लिए फसल बीमा योजना" },
                    eligibility: { en: "All farmers growing notified crops", hi: "अधिसूचित फसलें उगाने वाले सभी किसान" },
                    benefit: { en: "Insurance coverage for crop loss", hi: "फसल नुकसान के लिए बीमा कवरेज" },
                    link: "https://pmfby.gov.in"
                },
                {
                    name: { en: "Kisan Credit Card", hi: "किसान क्रेडिट कार्ड" },
                    description: { en: "Credit facility for farmers", hi: "किसानों के लिए ऋण सुविधा" },
                    eligibility: { en: "All farmers, sharecroppers, tenant farmers", hi: "सभी किसान, बंटाईदार, किरायेदार किसान" },
                    benefit: { en: "Flexible credit up to ₹3 lakh at 7% interest", hi: "7% ब्याज पर ₹3 लाख तक लचीला ऋण" },
                    link: "https://www.nabard.org"
                }
            ],
            upcoming: [
                {
                    name: { en: "PM Krishi Sinchayee Yojana", hi: "पीएम कृषि सिंचाई योजना" },
                    description: { en: "Water conservation and irrigation", hi: "जल संरक्षण और सिंचाई" },
                    eligibility: { en: "All farmers with agricultural land", hi: "कृषि भूमि वाले सभी किसान" },
                    benefit: { en: "Subsidy on drip/sprinkler irrigation", hi: "ड्रिप/स्प्रिंकलर सिंचाई पर सब्सिडी" },
                    link: "https://pmksy.gov.in"
                }
            ],
            ongoing: [
                {
                    name: { en: "Soil Health Card Scheme", hi: "मृदा स्वास्थ्य कार्ड योजना" },
                    description: { en: "Soil testing for better yield", hi: "बेहतर उत्पादन के लिए मिट्टी परीक्षण" },
                    eligibility: { en: "All farmers across India", hi: "देशभर के सभी किसान" },
                    benefit: { en: "Free soil testing + crop recommendations", hi: "मुफ्त मिट्टी परीक्षण + फसल सिफारिशें" },
                    link: "https://soilhealth.dac.gov.in"
                },
                {
                    name: { en: "PM Kisan Mandhan Yojana", hi: "पीएम किसान मानधन योजना" },
                    description: { en: "Pension scheme for small farmers", hi: "छोटे किसानों के लिए पेंशन योजना" },
                    eligibility: { en: "Farmers aged 18-40, landholding below 2 hectares", hi: "18-40 वर्ष के किसान, 2 हेक्टेयर से कम भूमि" },
                    benefit: { en: "₹3,000 per month pension after 60 years", hi: "60 वर्ष के बाद प्रति माह ₹3,000 पेंशन" },
                    link: "https://pmkmy.gov.in"
                }
            ]
        },
        senior: {
            title: { en: "👴 Senior Citizens", hi: "👴 वरिष्ठ नागरिक" },
            current: [
                {
                    name: { en: "Indira Gandhi National Old Age Pension", hi: "इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन" },
                    description: { en: "Monthly pension for poor elderly", hi: "गरीब वृद्धों के लिए मासिक पेंशन" },
                    eligibility: { en: "Age 60+, BPL family", hi: "60+ वर्ष आयु, बीपीएल परिवार" },
                    benefit: { en: "₹200-500 per month", hi: "प्रति माह ₹200-500" },
                    link: "https://nsap.nic.in"
                },
                {
                    name: { en: "Pradhan Mantri Vaya Vandana Yojana", hi: "प्रधानमंत्री वय वंदना योजना" },
                    description: { en: "Pension scheme for senior citizens", hi: "वरिष्ठ नागरिकों के लिए पेंशन योजना" },
                    eligibility: { en: "Age 60+, no upper age limit", hi: "60+ वर्ष आयु, अधिकतम आयु सीमा नहीं" },
                    benefit: { en: "8% guaranteed return, monthly pension", hi: "8% गारंटीड रिटर्न, मासिक पेंशन" },
                    link: "https://licindia.in"
                },
                {
                    name: { en: "Senior Citizen Savings Scheme", hi: "वरिष्ठ नागरिक बचत योजना" },
                    description: { en: "High interest savings for senior citizens", hi: "वरिष्ठ नागरिकों के लिए उच्च ब्याज बचत" },
                    eligibility: { en: "Age 60+ or 55+ (retired)", hi: "60+ वर्ष या 55+ (सेवानिवृत्त)" },
                    benefit: { en: "8.2% interest rate per year", hi: "प्रति वर्ष 8.2% ब्याज दर" },
                    link: "https://www.indiapost.gov.in"
                }
            ],
            upcoming: [
                {
                    name: { en: "Rashtriya Vayoshri Yojana", hi: "राष्ट्रीय वयोश्री योजना" },
                    description: { en: "Free assistive devices for poor elderly", hi: "गरीब वृद्धों के लिए मुफ्त सहायक उपकरण" },
                    eligibility: { en: "Age 60+, BPL families", hi: "60+ वर्ष आयु, बीपीएल परिवार" },
                    benefit: { en: "Free wheelchair, hearing aids, spectacles", hi: "मुफ्त व्हीलचेयर, श्रवण यंत्र, चश्मा" },
                    link: "https://socialjustice.gov.in"
                }
            ],
            ongoing: [
                {
                    name: { en: "Ayushman Bharat for Senior Citizens", hi: "वरिष्ठ नागरिकों के लिए आयुष्मान भारत" },
                    description: { en: "Health coverage for all senior citizens", hi: "सभी वरिष्ठ नागरिकों के लिए स्वास्थ्य कवरेज" },
                    eligibility: { en: "All citizens aged 70+", hi: "70+ वर्ष आयु के सभी नागरिक" },
                    benefit: { en: "₹5 lakh health coverage per year", hi: "प्रति वर्ष ₹5 लाख स्वास्थ्य कवरेज" },
                    link: "https://pmjay.gov.in"
                }
            ]
        },
        disability: {
            title: { en: "♿ Differently Abled", hi: "♿ दिव्यांगजन" },
            current: [
                {
                    name: { en: "ADIP Scheme", hi: "एडिप योजना" },
                    description: { en: "Assistive devices for disabled persons", hi: "दिव्यांगजनों के लिए सहायक उपकरण" },
                    eligibility: { en: "Disability 40%+, income below ₹2 lakh", hi: "40%+ दिव्यांगता, आय ₹2 लाख से कम" },
                    benefit: { en: "Free assistive devices worth ₹10,000+", hi: "₹10,000+ मूल्य के मुफ्त सहायक उपकरण" },
                    link: "https://alimco.in"
                },
                {
                    name: { en: "National Handicapped Finance Corporation", hi: "राष्ट्रीय विकलांग वित्त निगम" },
                    description: { en: "Loans for self employment", hi: "स्वरोजगार के लिए ऋण" },
                    eligibility: { en: "Persons with 40%+ disability", hi: "40%+ दिव्यांगता वाले व्यक्ति" },
                    benefit: { en: "Loans up to ₹3 lakh at 5% interest", hi: "5% ब्याज पर ₹3 लाख तक ऋण" },
                    link: "https://www.nhfdc.nic.in"
                }
            ],
            upcoming: [
                {
                    name: { en: "Sugamya Bharat Abhiyan", hi: "सुगम्य भारत अभियान" },
                    description: { en: "Accessible India Campaign", hi: "एक्सेसिबल इंडिया कैंपेन" },
                    eligibility: { en: "All persons with disabilities", hi: "सभी दिव्यांगजन" },
                    benefit: { en: "Accessible public infrastructure", hi: "सुलभ सार्वजनिक बुनियादी ढांचा" },
                    link: "https://accessibleindia.gov.in"
                }
            ],
            ongoing: [
                {
                    name: { en: "Scholarship for Disabled Students", hi: "दिव्यांग छात्रों के लिए स्कॉलरशिप" },
                    description: { en: "Education support for disabled students", hi: "दिव्यांग छात्रों के लिए शिक्षा सहायता" },
                    eligibility: { en: "Students with 40%+ disability", hi: "40%+ दिव्यांगता वाले छात्र" },
                    benefit: { en: "₹500 to ₹2000 per month", hi: "प्रति माह ₹500 से ₹2000" },
                    link: "https://scholarships.gov.in"
                }
            ]
        },
        backward: {
            title: { en: "🏘️ Backward Classes", hi: "🏘️ पिछड़ा वर्ग" },
            current: [
                {
                    name: { en: "Post Matric Scholarship for OBC", hi: "ओबीसी के लिए पोस्ट मैट्रिक स्कॉलरशिप" },
                    description: { en: "Scholarship for OBC students", hi: "ओबीसी छात्रों के लिए स्कॉलरशिप" },
                    eligibility: { en: "OBC students, family income below ₹1 lakh", hi: "ओबीसी छात्र, परिवार की आय ₹1 लाख से कम" },
                    benefit: { en: "Full tuition fee + maintenance allowance", hi: "पूरी ट्यूशन फीस + निर्वाह भत्ता" },
                    link: "https://scholarships.gov.in"
                },
                {
                    name: { en: "Pre Matric Scholarship for OBC", hi: "ओबीसी के लिए प्री मैट्रिक स्कॉलरशिप" },
                    description: { en: "Scholarship for OBC students Class 1-10", hi: "कक्षा 1-10 के ओबीसी छात्रों के लिए स्कॉलरशिप" },
                    eligibility: { en: "OBC students, family income below ₹44,500", hi: "ओबीसी छात्र, परिवार की आय ₹44,500 से कम" },
                    benefit: { en: "₹100 to ₹350 per month", hi: "प्रति माह ₹100 से ₹350" },
                    link: "https://scholarships.gov.in"
                }
            ],
            upcoming: [
                {
                    name: { en: "Dr Ambedkar Post Matric Scholarship", hi: "डॉ अंबेडकर पोस्ट मैट्रिक स्कॉलरशिप" },
                    description: { en: "For EBC and DNT students", hi: "ईबीसी और डीएनटी छात्रों के लिए" },
                    eligibility: { en: "EBC/DNT students, income below ₹1 lakh", hi: "ईबीसी/डीएनटी छात्र, आय ₹1 लाख से कम" },
                    benefit: { en: "Full fee + maintenance allowance", hi: "पूरी फीस + निर्वाह भत्ता" },
                    link: "https://scholarships.gov.in"
                }
            ],
            ongoing: [
                {
                    name: { en: "OBC Development Corporation Loan", hi: "ओबीसी विकास निगम ऋण" },
                    description: { en: "Self employment loans for OBC", hi: "ओबीसी के लिए स्वरोजगार ऋण" },
                    eligibility: { en: "OBC persons, income below ₹3 lakh", hi: "ओबीसी व्यक्ति, आय ₹3 लाख से कम" },
                    benefit: { en: "Loans up to ₹5 lakh at low interest", hi: "कम ब्याज पर ₹5 लाख तक ऋण" },
                    link: "https://www.nbcfdc.gov.in"
                }
            ]
        },
        defence: {
            title: { en: "🪖 Defence Families", hi: "🪖 रक्षा परिवार" },
            current: [
                {
                    name: { en: "PM Scholarship for Ex-Servicemen", hi: "भूतपूर्व सैनिकों के लिए पीएम स्कॉलरशिप" },
                    description: { en: "Scholarship for children of ex-servicemen", hi: "भूतपूर्व सैनिकों के बच्चों के लिए स्कॉलरशिप" },
                    eligibility: { en: "Children/widows of Ex-Servicemen, min 60% marks", hi: "भूतपूर्व सैनिकों/विधवाओं के बच्चे, न्यूनतम 60% अंक" },
                    benefit: { en: "₹2500/month boys, ₹3000/month girls", hi: "लड़कों के लिए ₹2500/माह, लड़कियों के लिए ₹3000/माह" },
                    link: "https://ksb.gov.in"
                },
                {
                    name: { en: "Armed Forces Flag Day Fund", hi: "सशस्त्र सेना ध्वज दिवस कोष" },
                    description: { en: "Welfare of war widows and disabled soldiers", hi: "युद्ध विधवाओं और दिव्यांग सैनिकों का कल्याण" },
                    eligibility: { en: "War widows, disabled soldiers, ex-servicemen", hi: "युद्ध विधवाएं, दिव्यांग सैनिक, भूतपूर्व सैनिक" },
                    benefit: { en: "Financial assistance + rehabilitation", hi: "वित्तीय सहायता + पुनर्वास" },
                    link: "https://ksb.gov.in"
                }
            ],
            upcoming: [
                {
                    name: { en: "Sainik School Scholarship", hi: "सैनिक स्कूल स्कॉलरशिप" },
                    description: { en: "For children of defence personnel", hi: "रक्षा कर्मियों के बच्चों के लिए" },
                    eligibility: { en: "Children of serving/retired defence personnel", hi: "सेवारत/सेवानिवृत्त रक्षा कर्मियों के बच्चे" },
                    benefit: { en: "Full scholarship at Sainik Schools", hi: "सैनिक स्कूलों में पूर्ण स्कॉलरशिप" },
                    link: "https://sainikschoolsociety.in"
                }
            ],
            ongoing: [
                {
                    name: { en: "Ex-Servicemen Contributory Health Scheme", hi: "भूतपूर्व सैनिक अंशदायी स्वास्थ्य योजना" },
                    description: { en: "Healthcare for ex-servicemen families", hi: "भूतपूर्व सैनिक परिवारों के लिए स्वास्थ्य सेवा" },
                    eligibility: { en: "All ex-servicemen and their dependents", hi: "सभी भूतपूर्व सैनिक और उनके आश्रित" },
                    benefit: { en: "Free medical treatment at ECHS polyclinics", hi: "ईसीएचएस पॉलीक्लिनिक में मुफ्त उपचार" },
                    link: "https://echs.gov.in"
                },
                {
                    name: { en: "Canteen Stores Department", hi: "कैंटीन स्टोर्स डिपार्टमेंट" },
                    description: { en: "Subsidized goods for defence families", hi: "रक्षा परिवारों के लिए सब्सिडी वाला सामान" },
                    eligibility: { en: "Serving soldiers, ex-servicemen, widows", hi: "सेवारत सैनिक, भूतपूर्व सैनिक, विधवाएं" },
                    benefit: { en: "Subsidized food, electronics, clothing", hi: "सब्सिडी वाला भोजन, इलेक्ट्रॉनिक्स, कपड़े" },
                    link: "https://csdindia.gov.in"
                }
            ]
        }
    };
    return data[category] || { title: { en: category, hi: category }, current: [], upcoming: [], ongoing: [] };
}