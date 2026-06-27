const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz-a73iNraEY7iEdnrmPh-Vmg64f8yfT0-d1c6M7vo0SVB2icI5Gk_addcbfXoK9lQ/exec';

const expertGrid = document.getElementById('experts-grid');
const openFormBtn = document.getElementById('open-form-btn');
const registerModal = document.getElementById('register-modal');
const closeRegBtn = document.getElementById('close-reg-btn');
const closeRevBtn = document.getElementById('close-rev-btn');
const expertForm = document.getElementById('expert-form');
const resultsCount = document.getElementById('results-count');

const reviewModal = document.getElementById('review-modal');
const reviewForm = document.getElementById('review-form');
const modalReviewsList = document.getElementById('modal-reviews-list');
const modalReviewCount = document.getElementById('modal-review-count');

const searchBtn = document.getElementById('search-btn');
const areaSearch = document.getElementById('area-search');
const serviceFilter = document.getElementById('service-filter');
const chips = document.querySelectorAll('.chip');

let experts = [];
let activeExpertId = null; 

async function loadExpertsFromSheet() {
    expertGrid.innerHTML = '<div style="text-align:center; padding:40px; color:#D4AF37;"><p>அத்தியாவசிய விபரங்கள் லோடு ஆகிறது...</p></div>';
    try {
        const response = await fetch(SCRIPT_URL, { method: "GET", redirect: "follow" });
        experts = await response.json();
        if (experts.error) {
            console.error(experts.error);
            expertGrid.innerHTML = '<div style="text-align:center; padding:40px; color:red;"><p>Apps Script Error!</p></div>';
        } else {
            handleSearch();
        }
    } catch (error) {
        expertGrid.innerHTML = '<div style="text-align:center; padding:40px; color:red;"><p>டேட்டா பிழை!</p></div>';
    }
}

function renderExperts(dataToRender = experts) {
    expertGrid.innerHTML = '';
    const sortedData = [...dataToRender].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    resultsCount.textContent = `${sortedData.length} பதிவுகள் உள்ளன`;

    if(sortedData.length === 0) {
        expertGrid.innerHTML = '<div style="text-align:center; padding:40px; color:#5C677D;">பதிவுகள் எதுவும் இல்லை!</div>';
        return;
    }

    sortedData.forEach(expert => {
        const card = document.createElement('div');
        card.classList.add('expert-card');
        
        // Custom Icons for Life Essentials
        let iconClass = 'fa-hotel'; 
        if (expert.prof === 'mess') iconClass = 'fa-utensils';
        if (expert.prof === 'clinic') iconClass = 'fa-heart-pulse';

        const waMessage = encodeURIComponent(`வணக்கம், Local Workers தளம் மூலம் தொடர்பு கொள்கிறேன். உங்களது சேவை/ரூம் விபரங்கள் தேவைப்படுகிறது.`);

        card.innerHTML = `
            <div class="card-left" onclick="openReviewSystem('${expert.id}')">
                <div class="avatar-container"><i class="fa-solid ${iconClass}"></i></div>
                <div class="expert-info">
                    <span class="badge" style="${expert.prof === 'clinic' ? 'background:#FEE2E2; color:#DC2626; border-color:#FCA5A5;' : ''}">
                        ${getProfTamil(expert.prof)}
                    </span>
                    <h4>${expert.name}</h4>
                    <p class="expert-loc"><i class="fa-solid fa-location-dot"></i> ${expert.location}</p>
                    <div class="rating-badge"><i class="fa-solid fa-star"></i> <span>${expert.rating || '5.0'}</span></div>
                </div>
            </div>
            <div class="card-right-actions">
                <a href="tel:${expert.phone}" class="call-btn-link"><i class="fa-solid fa-phone"></i></a>
                <a href="https://wa.me/91${expert.phone}?text=${waMessage}" target="_blank" class="wa-btn-link"><i class="fa-brands fa-whatsapp"></i></a>
            </div>
        `;
        expertGrid.appendChild(card);
    });
}

function getProfTamil(prof) {
    if(prof === 'pg_room') return 'PG / ரூம்கள்';
    if(prof === 'mess') return 'ஹோம்லி மெஸ்';
    if(prof === 'clinic') return 'அவசர கிளினிக்';
    return prof;
}

window.openReviewSystem = function(id) {
    const expert = experts.find(e => e.id === id);
    if (!expert) return;

    activeExpertId = id;
    document.getElementById('modal-expert-name').textContent = expert.name;
    document.getElementById('modal-expert-prof').textContent = getProfTamil(expert.prof);
    document.getElementById('modal-expert-loc').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${expert.location}`;
    
    let iconClass = 'fa-hotel';
    if (expert.prof === 'mess') iconClass = 'fa-utensils';
    if (expert.prof === 'clinic') iconClass = 'fa-heart-pulse';
    
    document.getElementById('modal-expert-avatar').innerHTML = `<div class="avatar-container"><i class="fa-solid ${iconClass}"></i></div>`;

    renderReviewsList(expert);
    reviewModal.style.display = 'flex';
}

function renderReviewsList(expert) {
    modalReviewsList.innerHTML = '';
    const reviewsArr = expert.reviews || [];
    modalReviewCount.textContent = reviewsArr.length;

    if (reviewsArr.length === 0) {
        modalReviewsList.innerHTML = `<p style="font-size:12px; color:#5C677D; text-align:center;">மதிப்புரைகள் இல்லை.</p>`;
        return;
    }

    reviewsArr.forEach(rev => {
        const revCard = document.createElement('div');
        revCard.classList.add('single-review-card');
        revCard.innerHTML = `<div class="review-stars">${'⭐'.repeat(rev.stars)}</div><p>${rev.text}</p>`;
        modalReviewsList.appendChild(revCard);
    });
}

reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const ratingSelect = document.getElementById('review-rating').value;
    const reviewText = document.getElementById('review-text').value;

    const expert = experts.find(e => e.id === activeExpertId);
    if (expert) {
        if (!expert.reviews) expert.reviews = [];
        expert.reviews.unshift({ stars: parseInt(ratingSelect), text: reviewText });
        expert.rating = (expert.reviews.reduce((sum, r) => sum + r.stars, 0) / expert.reviews.length).toFixed(1);
        renderReviewsList(expert);
        handleSearch();
        reviewForm.reset();
    }
});

function handleSearch() {
    const searchText = areaSearch.value.toLowerCase().trim();
    const selectedService = serviceFilter.value;

    const filtered = experts.filter(expert => {
        const matchesLocation = expert.location ? expert.location.toLowerCase().includes(searchText) : false;
        const matchesService = (selectedService === 'all') || (expert.prof === selectedService);
        return matchesLocation && matchesService;
    });
    renderExperts(filtered);
}

chips.forEach(chip => {
    chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        serviceFilter.value = chip.getAttribute('data-filter');
        handleSearch();
    });
});

searchBtn.addEventListener('click', handleSearch);
areaSearch.addEventListener('keyup', (e) => { if(e.key === 'Enter') handleSearch(); });
openFormBtn.addEventListener('click', () => { registerModal.style.display = 'flex'; });
closeRegBtn.addEventListener('click', () => { registerModal.style.display = 'none'; });
closeRevBtn.addEventListener('click', () => { reviewModal.style.display = 'none'; });

expertForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newEntry = {
        id: Date.now().toString(),
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        prof: document.getElementById('prof').value,
        location: document.getElementById('location').value,
        rating: "5.0",
        reviews: []
    };

    experts.unshift(newEntry);
    handleSearch();
    registerModal.style.display = 'none';
    expertForm.reset();

    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: "create", ...newEntry })
        });
    } catch (error) { console.error(error); }
});

loadExpertsFromSheet();

// Support System
const tipsBtn = document.getElementById('tips-btn');
const tipsModal = document.getElementById('tips-modal');
const closeTipsBtn = document.getElementById('close-tips-btn');
const tipsForm = document.getElementById('tips-form');

tipsBtn.addEventListener('click', () => { tipsModal.style.display = 'flex'; });
closeTipsBtn.addEventListener('click', () => { tipsModal.style.display = 'none'; });
tipsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = document.getElementById('tips-amount').value;
    window.location.href = `upi://pay?pa=8939717405@ybl&pn=LocalWorkers&am=${amount}&cu=INR&tn=Support`;
    tipsModal.style.display = 'none';
});


