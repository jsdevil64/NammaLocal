const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw9cJtWhI-iNJlwAqrRgoajw6JV4UX9pko2abvKbYdNNt-hraKBaPDAPBS4buVvjdhT/exec';

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
    expertGrid.innerHTML = '<div style="text-align:center; padding:40px; grid-column: 1/-1; color:#D4AF37;"><p>Elite விபரங்கள் லோடு ஆகிறது...</p></div>';
    try {
        const response = await fetch(SCRIPT_URL, { method: "GET", redirect: "follow" });
        experts = await response.json();
        
        if (experts.error) {
            console.error("Apps Script Error:", experts.error);
            expertGrid.innerHTML = '<div style="text-align:center; padding:40px; grid-column: 1/-1; color:red;"><p>Apps Script Error!</p></div>';
        } else {
            handleSearch();
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        expertGrid.innerHTML = '<div style="text-align:center; padding:40px; grid-column: 1/-1; color:red;"><p>டேட்டா லோடு செய்வதில் பிழை ஏற்பட்டுள்ளது!</p></div>';
    }
}

function sortExpertsData(array) {
    return array.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
}

function renderExperts(dataToRender = experts) {
    expertGrid.innerHTML = '';
    const sortedData = sortExpertsData([...dataToRender]);
    resultsCount.textContent = `${sortedData.length} பதிவுகள் உள்ளன`;

    if(sortedData.length === 0) {
        expertGrid.innerHTML = `
            <div style="text-align:center; padding:40px; color:#5C677D; grid-column: 1/-1;">
                <i class="fa-solid fa-crown" style="font-size:36px; margin-bottom:10px; color:#cbd5e1;"></i>
                <p>இந்த ஏரியாவில் விபரங்கள் எதுவும் இல்லை! முதல் ஆளாகப் பதியவும்.</p>
            </div>`;
        return;
    }

    sortedData.forEach(expert => {
        const card = document.createElement('div');
        card.classList.add('expert-card');
        
        // Royal Icons for Transport, Halls & Planners
        let iconClass = 'fa-taxi'; 
        if (expert.prof === 'hall') iconClass = 'fa-building-columns';
        if (expert.prof === 'planner') iconClass = 'fa-gifts';

        const avatarHTML = `<div class="avatar-container"><i class="fa-solid ${iconClass}"></i></div>`;
        const waMessage = encodeURIComponent(`வணக்கம், Local Workers தளம் மூலம் தங்களை தொடர்பு கொள்கிறேன். உங்களது சேவை விபரங்கள் தேவைப்படுகிறது.`);

        card.innerHTML = `
            <div class="card-left" onclick="openReviewSystem('${expert.id}')">
                ${avatarHTML}
                <div class="expert-info">
                    <span class="badge">${getProfTamil(expert.prof)}</span>
                    <h4>${expert.name}</h4>
                    <p class="expert-loc"><i class="fa-solid fa-location-dot"></i> ${expert.location}</p>
                    <div class="rating-badge"><i class="fa-solid fa-star"></i> <span>${expert.rating || '5.0'}</span></div>
                </div>
            </div>
            <div class="card-right-actions">
                <a href="tel:${expert.phone}" class="call-btn-link" title="Call">
                    <i class="fa-solid fa-phone"></i>
                </a>
                <a href="https://wa.me/91${expert.phone}?text=${waMessage}" target="_blank" class="wa-btn-link" title="WhatsApp Chat">
                    <i class="fa-brands fa-whatsapp"></i>
                </a>
            </div>
        `;
        expertGrid.appendChild(card);
    });
}

function getProfTamil(prof) {
    if(prof === 'auto_cab') return 'ஆட்டோ / கேப்';
    if(prof === 'hall') return 'திருமண மண்டபம்';
    if(prof === 'planner') return 'ஃபங்ஷன் பிளானர்';
    return prof;
}

window.openReviewSystem = function(id) {
    const expert = experts.find(e => e.id === id);
    if (!expert) return;

    activeExpertId = id;
    document.getElementById('modal-expert-name').textContent = expert.name;
    document.getElementById('modal-expert-prof').textContent = getProfTamil(expert.prof);
    document.getElementById('modal-expert-loc').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${expert.location}`;
    
    let iconClass = 'fa-taxi';
    if (expert.prof === 'hall') iconClass = 'fa-building-columns';
    if (expert.prof === 'planner') iconClass = 'fa-gifts';
    
    document.getElementById('modal-expert-avatar').innerHTML = `<div class="avatar-container" style="margin-bottom:0;"><i class="fa-solid ${iconClass}"></i></div>`;

    renderReviewsList(expert);
    reviewModal.style.display = 'flex';
}

function renderReviewsList(expert) {
    modalReviewsList.innerHTML = '';
    const reviewsArr = expert.reviews || [];
    modalReviewCount.textContent = reviewsArr.length;

    if (reviewsArr.length === 0) {
        modalReviewsList.innerHTML = `<p style="font-size:12px; color:#5C677D; text-align:center; padding:10px;">மதிப்புரைகள் எதுவும் இல்லை.</p>`;
        return;
    }

    reviewsArr.forEach(rev => {
        const revCard = document.createElement('div');
        revCard.classList.add('single-review-card');
        let stars = '⭐'.repeat(rev.stars);
        revCard.innerHTML = `
            <div class="review-stars">${stars}</div>
            <p class="review-comment">${rev.text}</p>
        `;
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
        const totalStars = expert.reviews.reduce((sum, r) => sum + r.stars, 0);
        expert.rating = (totalStars / expert.reviews.length).toFixed(1);
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
        const filterValue = chip.getAttribute('data-filter');
        serviceFilter.value = filterValue;
        handleSearch();
    });
});

searchBtn.addEventListener('click', handleSearch);
areaSearch.addEventListener('keyup', (e) => { if(e.key === 'Enter') handleSearch(); });

openFormBtn.addEventListener('click', () => { registerModal.style.display = 'flex'; });
closeRegBtn.addEventListener('click', () => { registerModal.style.display = 'none'; });
closeRevBtn.addEventListener('click', () => { reviewModal.style.display = 'none'; });

// படிவச் சமர்ப்பிப்பு (Form Submit) லாஜிக்
expertForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = expertForm.querySelector('.submit-btn');
    submitBtn.textContent = 'பதிவாகிறது... வெயிட் பண்ணுங்க தலை...';
    submitBtn.disabled = true;
    
    const newExpertData = {
        id: Date.now().toString(),
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        prof: document.getElementById('prof').value,
        location: document.getElementById('location').value,
        rating: "5.0",
        isPremium: false,
        reviews: []
    };

    // லோக்கலாக உடனே கார்டை சேர்க்கிறது
    experts.unshift(newExpertData);
    handleSearch(); 
    
    // ரெஜிஸ்டர் ஃபார்ம் மோடலை மூடிவிட்டு, ஃபார்மை ரீசெட் செய்கிறது
    registerModal.style.display = 'none';
    expertForm.reset();

    // போட்டோவில் உள்ளபடி கஸ்டம் பாப்-அப்பை உடனே திரையில் காட்டுகிறது
    successModal.style.display = 'flex';

    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: "create", ...newExpertData })
        });
        console.log("Saved to Royal Database!");
    } catch (error) {
        console.error("Sheet save error:", error);
    } finally {
        submitBtn.textContent = 'விபரங்களைச் சமர்ப்பிக்க';
        submitBtn.disabled = false;
    }
});

// 'சரி' பட்டன் கிளிக் செய்யும்போது பாப்-அப் உடனடியாக மறைந்துவிடும்
if (successOkBtn) {
    successOkBtn.addEventListener('click', () => {
        successModal.style.display = 'none';
    });
}

loadExpertsFromSheet();

// --- ROYAL GIFT SYSTEM ---
const MY_UPI_ID = '8939717405@ybl'; 
const MY_NAME = 'Local Workers Premium Admin'; 

const tipsBtn = document.getElementById('tips-btn');
const tipsModal = document.getElementById('tips-modal');
const closeTipsBtn = document.getElementById('close-tips-btn');
const tipsForm = document.getElementById('tips-form');

tipsBtn.addEventListener('click', () => { tipsModal.style.display = 'flex'; });
closeTipsBtn.addEventListener('click', () => { tipsModal.style.display = 'none'; });

tipsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = document.getElementById('tips-amount').value;
    if (!amount || amount <= 0) return;

    const upiUrl = `upi://pay?pa=${encodeURIComponent(MY_UPI_ID)}&pn=${encodeURIComponent(MY_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Royal Gift for Local Workers App')}`;
    window.location.href = upiUrl;
    tipsModal.style.display = 'none';
    tipsForm.reset();
});
        


