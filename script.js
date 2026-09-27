document.addEventListener('DOMContentLoaded', () => {
    const profileDisplayArea = document.getElementById('profile-display-area');
    const profileModal = document.getElementById('profile-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const profileForm = document.getElementById('profile-form');
    const modalTitle = document.getElementById('modal-title');
    
    const heroSection = document.querySelector('.hero-section');
    const learnMoreSection = document.getElementById('learn-more-section');
    const configSection = document.getElementById('config-section');
    const resultSection = document.getElementById('result-section');
    
    const getStartedBtn = document.getElementById('get-started-btn');
    const learnMoreBtn = document.getElementById('learn-more-btn');
    const backToHomeBtn = document.getElementById('back-to-home-btn');
    const configBackBtn = document.getElementById('config-back-btn');
    const resultBackBtn = document.getElementById('result-back-btn');
    const setupVarsBtn = document.getElementById('setup-vars-btn');
    const generateBtn = document.getElementById('generate-btn');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    
    const inputCountInput = document.getElementById('input-count');
    const outputCountInput = document.getElementById('output-count');
    const dynamicInputsContainer = document.getElementById('dynamic-inputs-container');
    const inputFieldsList = document.getElementById('input-fields-list');
    const dynamicOutputsContainer = document.getElementById('dynamic-outputs-container');
    const outputFieldsList = document.getElementById('output-fields-list');
    const booleanExpressionInput = document.getElementById('boolean-expression');
    const truthTableContainer = document.getElementById('truth-table-container');
    const expressionDisplayBox = document.getElementById('expression-display-box');

    loadProfileState();

    window.openProfileModal = function(isEdit = false) {
        if (isEdit) {
            modalTitle.textContent = "Edit Profile";
            const saved = JSON.parse(localStorage.getItem('user_profile'));
            if (saved) {
                document.getElementById('profile-name').value = saved.name || '';
                document.getElementById('profile-age').value = saved.age || '';
                document.getElementById('profile-gender').value = saved.gender || 'Male';
                document.getElementById('profile-email').value = saved.email || '';
            }
        } else {
            modalTitle.textContent = "Create Profile";
            profileForm.reset();
        }
        profileModal.classList.remove('hidden');
    }

    document.getElementById('open-profile-modal-btn')?.addEventListener('click', () => openProfileModal(false));

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            profileModal.classList.add('hidden');
        });
    }

    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('profile-name').value;
        const age = document.getElementById('profile-age').value;
        const gender = document.getElementById('profile-gender').value;
        const email = document.getElementById('profile-email').value;
        const photoInput = document.getElementById('profile-photo');

        const existingProfile = JSON.parse(localStorage.getItem('user_profile')) || {};

        if (photoInput.files && photoInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(uploadEvent) {
                const profileData = {
                    name, age, gender, email,
                    photo: uploadEvent.target.result
                };
                localStorage.setItem('user_profile', JSON.stringify(profileData));
                updateProfileUI(profileData);
                profileModal.classList.add('hidden');
                alert('Profile saved successfully!');
            };
            reader.readAsDataURL(photoInput.files[0]);
        } else {
            const profileData = {
                name, age, gender, email,
                photo: existingProfile.photo || null
            };
            localStorage.setItem('user_profile', JSON.stringify(profileData));
            updateProfileUI(profileData);
            profileModal.classList.add('hidden');
            alert('Profile saved successfully!');
        }
    });

    function loadProfileState() {
        const savedProfile = localStorage.getItem('user_profile');
        if (savedProfile) {
            updateProfileUI(JSON.parse(savedProfile));
        }
    }

    function updateProfileUI(profile) {
        if (profile && profile.name) {
            profileDisplayArea.innerHTML = `
                <div class="user-profile-badge-small" onclick="openProfileModal(true)" title="Click to Edit Profile">
                    ${profile.photo ? `<img src="${profile.photo}" alt="Photo">` : `<i class="fa-solid fa-user-circle"></i>`}
                    <span>Hi ${profile.name}</span>
                </div>
            `;
        }
    }

    getStartedBtn.addEventListener('click', () => {
        heroSection.classList.add('hidden');
        configSection.classList.remove('hidden');
        generateVariableFields();
    });

    learnMoreBtn.addEventListener('click', () => {
        heroSection.classList.add('hidden');
        learnMoreSection.classList.remove('hidden');
    });

    backToHomeBtn.addEventListener('click', () => {
        learnMoreSection.classList.add('hidden');
        heroSection.classList.remove('hidden');
    });

    configBackBtn.addEventListener('click', () => {
        configSection.classList.add('hidden');
        heroSection.classList.remove('hidden');
    });

    resultBackBtn.addEventListener('click', () => {
        resultSection.classList.add('hidden');
        configSection.classList.remove('hidden');
    });

    setupVarsBtn.addEventListener('click', generateVariableFields);

    function generateVariableFields() {
        const numInputs = parseInt(inputCountInput.value) || 1;
        const numOutputs = parseInt(outputCountInput.value) || 1;

        inputFieldsList.innerHTML = '';
        for (let i = 0; i < numInputs; i++) {
            const defaultName = String.fromCharCode(65 + i);
            inputFieldsList.innerHTML += `
                <div>
                    <label style="font-size:0.85rem">Input ${i+1}:</label>
                    <input type="text" class="input-var-name" value="${defaultName}" style="padding:8px">
                </div>
            `;
        }
        dynamicInputsContainer.classList.remove('hidden');

        outputFieldsList.innerHTML = '';
        for (let i = 0; i < numOutputs; i++) {
            const defaultName = i === 0 ? 'Q' : `Y${i}`;
            outputFieldsList.innerHTML += `
                <div>
                    <label style="font-size:0.85rem">Output ${i+1}:</label>
                    <input type="text" class="output-var-name" value="${defaultName}" style="padding:8px">
                </div>
            `;
        }
        dynamicOutputsContainer.classList.remove('hidden');
    }

    generateBtn.addEventListener('click', () => {
        const numInputs = parseInt(inputCountInput.value);
        const inputVarElements = document.querySelectorAll('.input-var-name');
        const outputVarElements = document.querySelectorAll('.output-var-name');
        
        const variableNames = Array.from(inputVarElements).map(el => el.value.trim() || 'A');
        const outputNames = Array.from(outputVarElements).map(el => el.value.trim() || 'Q');
        const expression = booleanExpressionInput.value.trim();

        if (!expression) {
            alert('Please enter a valid boolean expression.');
            return;
        }

        const primaryOutputName = outputNames[0];
        expressionDisplayBox.innerHTML = `Expression: ${primaryOutputName} = ${expression}`;
        
        generateTruthTable(numInputs, variableNames, primaryOutputName, expression);

        configSection.classList.add('hidden');
        resultSection.classList.remove('hidden');
    });

    // Truth Table Generator
    function generateTruthTable(numInputs, variableNames, outputVarName, expression) {
        const totalRows = Math.pow(2, numInputs);

        let html = `<table><thead><tr>`;
        variableNames.forEach(v => {
            html += `<th><b>${v}</b></th>`;
        });
        html += `<th><b>${outputVarName}</b></th></tr></thead><tbody>`;

        for (let i = 0; i < totalRows; i++) {
            html += `<tr>`;
            const rowValues = {};
            for (let j = 0; j < numInputs; j++) {
                const val = (i >> (numInputs - 1 - j)) & 1;
                rowValues[variableNames[j]] = val;
                html += `<td><b>${val}</b></td>`;
            }

            let output = 0;
            try {
                let jsExpr = expression
                    .replace(/\band\b/gi, ' && ')
                    .replace(/\bor\b/gi, ' || ')
                    .replace(/\bnot\b/gi, ' ! ');

                const evalFunc = new Function(...variableNames, `return Boolean(${jsExpr});`);
                const argValues = variableNames.map(v => Boolean(rowValues[v]));
                
                output = evalFunc(...argValues) ? 1 : 0;
            } catch (err) {
                console.error("Evaluation error:", err);
                output = 'Error';
            }

            html += `<td><b>${output}</b></td></tr>`;
        }

        html += `</tbody></table>`;
        truthTableContainer.innerHTML = html;
    }

    // PDF Download Option - Fixed page breaks so everything fits nicely without empty pages
    downloadPdfBtn.addEventListener('click', () => {
        const element = document.getElementById('pdf-content');
        const opt = {
            margin:       5,
            filename:     'Truth_Table_Report.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { 
                scale: 2, 
                useCORS: true, 
                letterRendering: true,
                scrollY: 0 
            },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak:    { mode: [] } 
        };
        
        html2pdf().from(element).set(opt).save().catch(err => {
            console.error('PDF generation error:', err);
            alert('Error generating PDF. Please try again.');
        });
    });
});