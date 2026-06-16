function showSchemes(category) {
    $('.category-card').removeClass('active');
    event.currentTarget.classList.add('active');
    $('#schemesSection').fadeIn(500);
    $('html, body').animate({
        scrollTop: $('#schemesSection').offset().top - 20
    }, 600);
    loadSchemes(category);
}

function loadSchemes(category) {
    var schemes = getSchemes(category);
    var html = `
    <h4 class="mb-4 text-center">${schemes.title} Schemes</h4>
    <ul class="nav nav-pills scheme-tabs mb-4 justify-content-center">
        <li class="nav-item"><a class="nav-link active" data-toggle="pill" href="#current">📋 Current</a></li>
        <li class="nav-item"><a class="nav-link" data-toggle="pill" href="#upcoming">🔜 Upcoming</a></li>
        <li class="nav-item"><a class="nav-link" data-toggle="pill" href="#ongoing">⏳ Ongoing</a></li>
    </ul>
    <div class="tab-content">
        <div class="tab-pane fade show active" id="current">${renderSchemes(schemes.current, 'current')}</div>
        <div class="tab-pane fade" id="upcoming">${renderSchemes(schemes.upcoming, 'upcoming')}</div>
        <div class="tab-pane fade" id="ongoing">${renderSchemes(schemes.ongoing, 'ongoing')}</div>
    </div>`;
    $('#schemesSection').html(html);
}

function renderSchemes(schemes, type) {
    if (schemes.length === 0) return '<p class="text-center text-muted">No schemes available</p>';
    var badgeClass = type === 'current' ? 'scheme-badge-current' : type === 'upcoming' ? 'scheme-badge-upcoming' : 'scheme-badge-ongoing';
    var html = '<div class="row">';
    schemes.forEach(function(scheme) {
        html += `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card scheme-card h-100">
                <div class="card-body">
                    <span class="${badgeClass} mb-2 d-inline-block">${type.toUpperCase()}</span>
                    <h6 class="font-weight-bold">${scheme.name}</h6>
                    <p class="text-muted small">${scheme.description}</p>
                    <p class="small"><b>Eligibility:</b> ${scheme.eligibility}</p>
                    <p class="small"><b>Benefit:</b> ${scheme.benefit}</p>
                </div>
                <div class="card-footer bg-white border-0">
                    <a href="${scheme.link}" target="_blank" class="btn btn-sm btn-outline-warning btn-block">View Details 🔗</a>
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
            title: "🎓 Students",
            current: [
                { name: "PM Scholarship Scheme", description: "Scholarship for children of ex-servicemen", eligibility: "Children of Ex-Servicemen, min 60% marks", benefit: "₹2500/month for boys, ₹3000/month for girls", link: "https://scholarships.gov.in" },
                { name: "National Scholarship Portal", description: "Central government scholarships for students", eligibility: "Students from Class 1 to PhD", benefit: "₹1000 to ₹20000 per year", link: "https://scholarships.gov.in" },
                { name: "Central Sector Scholarship", description: "Merit based scholarship for college students", eligibility: "Top 20 percentile in Class 12, family income below ₹8 lakh", benefit: "₹10,000 to ₹20,000 per year", link: "https://scholarships.gov.in" },
                { name: "Ishan Uday Scholarship", description: "For students from North East region", eligibility: "Students from NE states pursuing graduation", benefit: "₹5,400 to ₹7,800 per month", link: "https://scholarships.gov.in" }
            ],
            upcoming: [
                { name: "Pragati Scholarship", description: "For girl students in technical education", eligibility: "Girl students in Diploma/Degree technical courses", benefit: "₹50,000 per year", link: "https://www.aicte-india.org" }
            ],
            ongoing: [
                { name: "Post Matric Scholarship", description: "For SC/ST students after Class 10", eligibility: "SC/ST students, family income below ₹2.5 lakh", benefit: "Full tuition fee + maintenance allowance", link: "https://scholarships.gov.in" }
            ]
        },
        women: {
            title: "👩 Women",
            current: [
                { name: "Beti Bachao Beti Padhao", description: "Scheme to promote welfare of girl child", eligibility: "Girl child 0-18 years, all families", benefit: "Education support + awareness programs", link: "https://wcd.nic.in" },
                { name: "Sukanya Samriddhi Yojana", description: "Savings scheme for girl child", eligibility: "Girl child below 10 years", benefit: "8.2% interest rate, tax benefits", link: "https://www.indiapost.gov.in" },
                { name: "PM Matru Vandana Yojana", description: "Maternity benefit scheme", eligibility: "Pregnant women for first live birth", benefit: "₹5,000 direct benefit transfer", link: "https://pmmvy.wcd.gov.in" }
            ],
            upcoming: [
                { name: "Mahila Samman Saving Certificate", description: "Special savings scheme for women", eligibility: "All women and girls", benefit: "7.5% interest rate, 2 year deposit", link: "https://www.indiapost.gov.in" }
            ],
            ongoing: [
                { name: "Stand Up India", description: "Loans for women entrepreneurs", eligibility: "Women above 18 years for business", benefit: "₹10 lakh to ₹1 crore loan", link: "https://www.standupmitra.in" },
                { name: "Mahila Shakti Kendra", description: "Empowerment of rural women", eligibility: "Rural women across India", benefit: "Skill development + awareness", link: "https://wcd.nic.in" }
            ]
        },
        farmer: {
            title: "🌾 Farmer",
            current: [
                { name: "PM Kisan Samman Nidhi", description: "Direct income support to farmers", eligibility: "All small and marginal farmers", benefit: "₹6,000 per year in 3 installments", link: "https://pmkisan.gov.in" },
                { name: "Pradhan Mantri Fasal Bima Yojana", description: "Crop insurance scheme for farmers", eligibility: "All farmers growing notified crops", benefit: "Insurance coverage for crop loss", link: "https://pmfby.gov.in" },
                { name: "Kisan Credit Card", description: "Credit facility for farmers", eligibility: "All farmers, sharecroppers, tenant farmers", benefit: "Flexible credit up to ₹3 lakh at 7% interest", link: "https://www.nabard.org" }
            ],
            upcoming: [
                { name: "PM Krishi Sinchayee Yojana", description: "Water conservation and irrigation", eligibility: "All farmers with agricultural land", benefit: "Subsidy on drip/sprinkler irrigation", link: "https://pmksy.gov.in" }
            ],
            ongoing: [
                { name: "Soil Health Card Scheme", description: "Soil testing for better yield", eligibility: "All farmers across India", benefit: "Free soil testing + crop recommendations", link: "https://soilhealth.dac.gov.in" },
                { name: "PM Kisan Mandhan Yojana", description: "Pension scheme for small farmers", eligibility: "Farmers aged 18-40, landholding below 2 hectares", benefit: "₹3,000 per month pension after 60 years", link: "https://pmkmy.gov.in" }
            ]
        },
        senior: {
            title: "👴 Senior Citizens",
            current: [
                { name: "Indira Gandhi National Old Age Pension", description: "Monthly pension for poor elderly", eligibility: "Age 60+, BPL family", benefit: "₹200-500 per month", link: "https://nsap.nic.in" },
                { name: "Pradhan Mantri Vaya Vandana Yojana", description: "Pension scheme for senior citizens", eligibility: "Age 60+, no upper age limit", benefit: "8% guaranteed return, monthly pension", link: "https://licindia.in" },
                { name: "Senior Citizen Savings Scheme", description: "High interest savings for senior citizens", eligibility: "Age 60+ or 55+ (retired)", benefit: "8.2% interest rate per year", link: "https://www.indiapost.gov.in" }
            ],
            upcoming: [
                { name: "Rashtriya Vayoshri Yojana", description: "Free assistive devices for poor elderly", eligibility: "Age 60+, BPL families", benefit: "Free wheelchair, hearing aids, spectacles", link: "https://socialjustice.gov.in" }
            ],
            ongoing: [
                { name: "Ayushman Bharat for Senior Citizens", description: "Health coverage for all senior citizens", eligibility: "All citizens aged 70+", benefit: "₹5 lakh health coverage per year", link: "https://pmjay.gov.in" }
            ]
        },
        disability: {
            title: "♿ Differently Abled",
            current: [
                { name: "ADIP Scheme", description: "Assistive devices for disabled persons", eligibility: "Disability 40%+, income below ₹2 lakh", benefit: "Free assistive devices worth ₹10,000+", link: "https://alimco.in" },
                { name: "National Handicapped Finance Corporation", description: "Loans for self employment", eligibility: "Persons with 40%+ disability", benefit: "Loans up to ₹3 lakh at 5% interest", link: "https://www.nhfdc.nic.in" }
            ],
            upcoming: [
                { name: "Sugamya Bharat Abhiyan", description: "Accessible India Campaign", eligibility: "All persons with disabilities", benefit: "Accessible public infrastructure", link: "https://accessibleindia.gov.in" }
            ],
            ongoing: [
                { name: "Scholarship for Disabled Students", description: "Education support for disabled students", eligibility: "Students with 40%+ disability", benefit: "₹500 to ₹2000 per month", link: "https://scholarships.gov.in" }
            ]
        },
        backward: {
            title: "🏘️ Backward Classes",
            current: [
                { name: "Post Matric Scholarship for OBC", description: "Scholarship for OBC students", eligibility: "OBC students, family income below ₹1 lakh", benefit: "Full tuition fee + maintenance allowance", link: "https://scholarships.gov.in" },
                { name: "Pre Matric Scholarship for OBC", description: "Scholarship for OBC students Class 1-10", eligibility: "OBC students, family income below ₹44,500", benefit: "₹100 to ₹350 per month", link: "https://scholarships.gov.in" }
            ],
            upcoming: [
                { name: "Dr Ambedkar Post Matric Scholarship", description: "For EBC and DNT students", eligibility: "EBC/DNT students, income below ₹1 lakh", benefit: "Full fee + maintenance allowance", link: "https://scholarships.gov.in" }
            ],
            ongoing: [
                { name: "OBC Development Corporation Loan", description: "Self employment loans for OBC", eligibility: "OBC persons, income below ₹3 lakh", benefit: "Loans up to ₹5 lakh at low interest", link: "https://www.nbcfdc.gov.in" }
            ]
        },
        defence: {
            title: "🪖 Defence Families",
            current: [
                { name: "PM Scholarship for Ex-Servicemen", description: "Scholarship for children of ex-servicemen", eligibility: "Children/widows of Ex-Servicemen, min 60% marks", benefit: "₹2500/month boys, ₹3000/month girls", link: "https://ksb.gov.in" },
                { name: "Armed Forces Flag Day Fund", description: "Welfare of war widows and disabled soldiers", eligibility: "War widows, disabled soldiers, ex-servicemen", benefit: "Financial assistance + rehabilitation", link: "https://ksb.gov.in" }
            ],
            upcoming: [
                { name: "Sainik School Scholarship", description: "For children of defence personnel", eligibility: "Children of serving/retired defence personnel", benefit: "Full scholarship at Sainik Schools", link: "https://sainikschoolsociety.in" }
            ],
            ongoing: [
                { name: "Ex-Servicemen Contributory Health Scheme", description: "Healthcare for ex-servicemen families", eligibility: "All ex-servicemen and their dependents", benefit: "Free medical treatment at ECHS polyclinics", link: "https://echs.gov.in" },
                { name: "Canteen Stores Department", description: "Subsidized goods for defence families", eligibility: "Serving soldiers, ex-servicemen, widows", benefit: "Subsidized food, electronics, clothing", link: "https://csdindia.gov.in" }
            ]
        }
    };
    return data[category] || { title: category, current: [], upcoming: [], ongoing: [] };
}