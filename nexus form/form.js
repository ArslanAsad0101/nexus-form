let currentStep = 1;
const totalSteps = 4;
const form = document.getElementById('multiStepForm');

document.addEventListener('DOMContentLoaded', () => {
    loadSavedData();
    updateProgress();
    setupCategoryLogic();
    
    form.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('input', () => {
            saveDataToLocalStorage();
            const errorElement = document.getElementById(`error-${input.id || input.name}`);
            if (errorElement) errorElement.textContent = '';
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        submitForm();
    });
});

function nextStep(step) {
    if (validateStep(step)) {
        if (step === 3) {
            generateSummary();
        }
        
        currentStep = step + 1;
        showStep(currentStep);
        updateProgress();
        saveDataToLocalStorage();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function prevStep(step) {
    currentStep = step - 1;
    showStep(currentStep);
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showStep(step) {
    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');
}

function updateProgress() {
    const indicators = document.querySelectorAll('.step-indicator');
    const progressBar = document.getElementById('progressBar');
    
    const progressWidth = ((currentStep - 1) / (totalSteps - 1)) * 100;
    progressBar.style.width = `${progressWidth}%`;

    indicators.forEach((indicator, index) => {
        const stepNum = index + 1;
        indicator.classList.remove('active', 'completed');
        
        if (stepNum < currentStep) {
            indicator.classList.add('completed');
        } else if (stepNum === currentStep) {
            indicator.classList.add('active');
        }
    });
}

function validateStep(step) {
    let isValid = true;
    
    if (step === 1) {
        const fullName = document.getElementById('fullName');
        const email = document.getElementById('email');
        const country = document.getElementById('country');
        
        if (!fullName.value.trim()) {
            showError('fullName', 'Please enter your full name');
            isValid = false;
        }
        
        if (!email.value.trim() || !validateEmail(email.value)) {
            showError('email', 'Please enter a valid email');
            isValid = false;
        }
        
        if (!country.value) {
            showError('country', 'Please select a country');
            isValid = false;
        }
    } else if (step === 2) {
        const category = form.querySelector('input[name="category"]:checked');
        if (!category) {
            showError('category', 'Please select a category');
            isValid = false;
        }
    } else if (step === 3) {
        const category = form.querySelector('input[name="category"]:checked').value;
        
        if (category === 'Fully Funded') {
            const motivation = document.getElementById('motivation');
            if (!motivation.value.trim()) {
                showError('motivation', 'Please enter your motivation');
                isValid = false;
            }
        } else if (category === 'Invitation Letter') {
            const passport = document.getElementById('passportNumber');
            const purpose = document.getElementById('travelPurpose');
            
            if (!passport.value.trim()) {
                showError('passportNumber', 'Please enter your passport number');
                isValid = false;
            }
            if (!purpose.value.trim()) {
                showError('travelPurpose', 'Please enter your purpose of travel');
                isValid = false;
            }
        } else if (category === 'Self-Funded') {
            const confirm = document.getElementById('budgetConfirm');
            if (!confirm.checked) {
                showError('budgetConfirm', 'You must confirm your budget');
                isValid = false;
            }
        }
    }
    
    return isValid;
}

function showError(fieldId, message) {
    const errorElement = document.getElementById(`error-${fieldId}`);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setupCategoryLogic() {
    const radios = form.querySelectorAll('input[name="category"]');
    
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            document.querySelectorAll('.dynamic-section').forEach(sec => sec.style.display = 'none');
            
            if (radio.value === 'Fully Funded') {
                document.getElementById('logic-fully-funded').style.display = 'block';
            } else if (radio.value === 'Invitation Letter') {
                document.getElementById('logic-invitation').style.display = 'block';
            } else if (radio.value === 'Self-Funded') {
                document.getElementById('logic-self-funded').style.display = 'block';
            }
            
            saveDataToLocalStorage();
        });
    });

    const checked = form.querySelector('input[name="category"]:checked');
    if (checked) checked.dispatchEvent(new Event('change'));
}

function generateSummary() {
    const summaryDiv = document.getElementById('summaryContent');
    const formData = new FormData(form);
    
    let html = `
        <div class="summary-item">
            <div class="summary-label">Full Name</div>
            <div class="summary-value">${formData.get('fullName') || 'N/A'}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Email</div>
            <div class="summary-value">${formData.get('email') || 'N/A'}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Country</div>
            <div class="summary-value">${formData.get('country') || 'N/A'}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Category</div>
            <div class="summary-value">${formData.get('category') || 'N/A'}</div>
        </div>
    `;

    const category = formData.get('category');
    if (category === 'Fully Funded') {
        html += `
            <div class="summary-item">
                <div class="summary-label">Motivation</div>
                <div class="summary-value">${formData.get('motivation') || 'N/A'}</div>
            </div>
        `;
    } else if (category === 'Invitation Letter') {
        html += `
            <div class="summary-item">
                <div class="summary-label">Passport Number</div>
                <div class="summary-value">${formData.get('passportNumber') || 'N/A'}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Purpose of Travel</div>
                <div class="summary-value">${formData.get('travelPurpose') || 'N/A'}</div>
            </div>
        `;
    } else if (category === 'Self-Funded') {
        html += `
            <div class="summary-item">
                <div class="summary-label">Budget Confirmation</div>
                <div class="summary-value">Confirmed</div>
            </div>
        `;
    }

    summaryDiv.innerHTML = html;
}

function saveDataToLocalStorage() {
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });
    data['budgetConfirm'] = document.getElementById('budgetConfirm').checked;
    
    localStorage.setItem('applicationFormData', JSON.stringify(data));
}

function loadSavedData() {
    const saved = localStorage.getItem('applicationFormData');
    if (!saved) return;

    const data = JSON.parse(saved);
    
    if (data.fullName) document.getElementById('fullName').value = data.fullName;
    if (data.email) document.getElementById('email').value = data.email;
    if (data.country) document.getElementById('country').value = data.country;
    
    if (data.category) {
        const radio = form.querySelector(`input[name="category"][value="${data.category}"]`);
        if (radio) radio.checked = true;
    }

    if (data.motivation) document.getElementById('motivation').value = data.motivation;
    if (data.passportNumber) document.getElementById('passportNumber').value = data.passportNumber;
    if (data.travelPurpose) document.getElementById('travelPurpose').value = data.travelPurpose;
    if (data.budgetConfirm) document.getElementById('budgetConfirm').checked = data.budgetConfirm;
}

function submitForm() {
    localStorage.removeItem('applicationFormData');
    window.location.href = 'thankyou.html';
}
