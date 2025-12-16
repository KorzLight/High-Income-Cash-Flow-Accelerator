// --- 1. STATIC DATA (Content Arrays) ---
const journalPrompts = [
    { q: "Unmasking the Root Cause", a: "What is the one emotion (stress, guilt, exhaustion) that drives your impulse spending?" },
    { q: "Aligning Choices with Values", a: "Are my financial choices aligning with my core values? What would I sacrifice in my current spending to achieve my bigger financial goals?" },
    { q: "Releasing Limiting Beliefs", a: "How were you raised to think about money? What are some of your fears/concerns related to it?" }
];

const boundaryProtocols = [
    { q: "Friend asks for money", a: "I care about you, but I made a commitment that all my savings this month are dedicated to my down payment fund. I can't access that money right now." },
    { q: "Family pressure for trip", a: "That sounds amazing, but I'm in a focused financial quarter right now to fund my investment goals. I'll join the next trip when it aligns with my plan." }
];

// Application State
let appState = {
    netMonthlyPaycheck: 0,
    fixedExpenses: 0,
    availableCash: 0,
    cashLeaks: [
        { category: '', amount: 0 },
        { category: '', amount: 0 },
        { category: '', amount: 0 }
    ],
    shortTermGoal: {
        title: '',
        amount: 0,
        targetDate: ''
    },
    spendingPlan: {
        wealth: 0,
        debtAcceleration: 0,
        guiltFreeBuckets: [
            { name: 'Dining Out', amount: 0 },
            { name: 'Entertainment', amount: 0 }
        ]
    },
    automation: {
        debtTransfer: false,
        wealthTransfer: false
    }
};

// Local Storage Persistence
function saveToLocalStorage() {
    localStorage.setItem('appState', JSON.stringify(appState));
}

function loadFromLocalStorage() {
    const stored = localStorage.getItem('appState');
    if (stored) {
        // Merge stored data to ensure new fields (like spendingPlan) exist if old data is loaded
        appState = { ...appState, ...JSON.parse(stored) };
    }
}

// Update Available Cash Display
function updateAvailableCashDisplay() {
    const el = document.getElementById('availableCashResult');
    if (!el) return;
    el.textContent = `Available Cash: $${appState.availableCash.toLocaleString()}`;
}

// Chart Instances
const charts = {}; // Holds chart instances to prevent "flickering"

function initChart(ctx, type, data, options) {
    if (charts[ctx.canvas.id]) {
        charts[ctx.canvas.id].destroy();
    }
    charts[ctx.canvas.id] = new Chart(ctx, { type, data, options });
}

// Render Functions

// -- TAB 1: MINDSET --
function renderMindsetTab() {
    const content = `
        <div class="animate-fade-in">
            <h2 class="text-2xl font-bold mb-4 text-[#A67B5B]">Module 1: The Six-Figure Mindset Reset</h2>
            <p class="mb-6 text-[#796A5C]">Financial freedom begins with a mental shift. We're not budgeting; we're strategically directing our cash flow. This section helps uncover the 'why' behind your spending before we build the 'how'.</p>
            <div class="grid md:grid-cols-2 gap-6 items-start">
                <div>
                    <h3 class="font-semibold text-lg mb-4">Journal Prompts for Clarity</h3>
                    <div id="journal-prompts-container" class="space-y-4">
                        ${journalPrompts.map(p => `
                            <div class="prompt-card" onclick="this.classList.toggle('open')">
                                <div class="flex justify-between items-center">
                                    <h4 class="font-semibold">${p.q}</h4>
                                    <span class="text-xl text-[#A67B5B]">&#9662;</span>
                                </div>
                                <div class="answer pt-2">
                                    <p class="text-sm text-[#796A5C]">${p.a}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="text-center p-4 rounded-lg bg-[#FDFBF8]">
                    <h3 class="font-semibold text-lg mb-4">The Power 3 Allocation Concept</h3>
                    <div class="chart-container h-64">
                        <canvas id="conceptDonutChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('main-content-area').innerHTML = content;
    renderConceptDonutChart();
}

// Draw Concept Donut Chart
function renderConceptDonutChart() {
    const ctx = document.getElementById('conceptDonutChart')?.getContext('2d');
    if (!ctx) return; 
    const data = {
        labels: ['Wealth (Future You)', 'Needs (Essentials)', 'Wants (Today\'s Joy)'],
        datasets: [{
            data: [20, 50, 30],
            backgroundColor: ['#A67B5B', '#D9CBBF', '#EAE0D5'],
            borderColor: '#FFFFFF',
            borderWidth: 2,
        }]
    };
    const options = { 
        responsive: true, maintainAspectRatio: false, 
        plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: (c) => `${c.label}: ${c.raw}%` } } } 
    };
    initChart(ctx, 'doughnut', data, options)
}

// -- TAB 2: AUDIT --
function renderAuditTab() {
    // Ensure calculation is fresh
    appState.availableCash = appState.netMonthlyPaycheck - appState.fixedExpenses;

    const content = `
        <div class="fade-in">
            <h2 class="text-2xl font-bold mb-4 text-[#A67B5B]">Module 2: The Cash Flow Audit & Vision</h2>
            <p class="mb-6 text-[#796A5C]">
                Clarity is power. We calculate your true available cash, identify leaks, and set the financial goal that will drive your new behavior.
            </p>
            <div class="grid md:grid-cols-2 gap-8">
                <!--Step 1-->
                <div class="space-y-6 p-6 bg-[#FDFBF8] rounded-lg border border-[#EAE0D5]">
                    <h3 class="font-semibold text-lg mb-2">Step 1: Calculate Your Available Cash</h3>
                    <div>
                        <label for="netPay" class="block text-sm font-medium text-[#3D352E]">Net Monthly Paycheck ($)</label>
                        <input type="number" id="netPay" class="w-full mt-1" placeholder="e.g., 8000" value="${appState.netMonthlyPaycheck || ''}">
                    </div>
                    <div>
                        <label for="fixedExpenses" class="block text-sm font-medium text-[#3D352E]">Total Fixed Expenses ($)</label>
                        <input type="number" id="fixedExpenses" class="w-full mt-1" placeholder="Rent, min debt payments, etc." value="${appState.fixedExpenses || ''}">
                    </div>
                    <div id="availableCashResult" class="text-center font-bold text-2xl text-[#A67B5B] h-8">Available Cash: $${appState.availableCash.toLocaleString()}</div>
                </div>
                <!--Step 2-->
                <div class="space-y-4 p-6 bg-[#FDFBF8] rounded-lg border border-[#EAE0D5]">
                    <h3 class="font-semibold text-lg mb-2">Step 2: Map Your Top 3 Cash Leaks</h3>
                    <p class="text-sm text-[#796A5C]">
                        Enter your top 3 variable spending categories from the last month.
                    </p>
                    ${appState.cashLeaks.map((leak, index) => `
                        <div class="grid grid-cols-2 gap-2">
                            <input type="text" data-leak-category="${index}" class="w-full text-sm border p-2 rounded" placeholder="Category" value="${leak.category}">
                            <input type="number" data-leak-amount="${index}" class="w-full text-sm border p-2 rounded" placeholder="Amount ($)" value="${leak.amount || ''}">
                        </div>
                    `).join('')}
                </div>
            </div>
            <!--Step 3-->
            <div class="mt-8 p-6 bg-[#FDFBF8] rounded-lg border border-[#EAE0D5]">
                <h3 class="font-semibold text-lg mb-2">Step 3: Vision - Your Motivation Engine</h3>
                <p class="text-sm text-[#796A5C] mb-6">
                    Define **ONE** clear, measurable short-term goal to be funded by closing your Cash Leaks.
                </p>
                <div class="grid md:grid-cols-3 gap-4">
                    <div>
                        <label for="goalTitle" class="block text-sm font-medium text-[#3D352E]">Goal Title</label>
                        <input type="text" id="goalTitle" class="w-full mt-1" placeholder="e.g., European Trip Fund"
                            value="">
                    </div>
                    <div>
                        <label for="goalAmount" class="block text-sm font-medium text-[#3D352E]">Target Amount
                            ($)</label>
                        <input type="number" id="goalAmount" class="w-full mt-1" placeholder="e.g., 5000"
                            value="">
                    </div>
                    <div>
                        <label for="goalDate" class="block text-sm font-medium text-[#3D352E]">Target Completion Date</label>
                        <input type="date" id="goalDate" class="w-full mt-1" value="">
                    </div>
                </div>
                <!--Chart Container-->
                <div class="chart-container h-48 md:h-56 mt-6">
                    <canvas id="cashLeaksChart"></canvas>
                </div>
            </div>
        </div>
    `;
    document.getElementById('main-content-area').innerHTML = content;
    renderCashLeaksChart();

    // -- Event Listeners for Audit --

    // Helper to update state and save
    const updateCalculations = () => {
        appState.availableCash = appState.netMonthlyPaycheck - appState.fixedExpenses;
        document.getElementById('availableCashResult').textContent = `Available Cash: $${appState.availableCash.toLocaleString()}`;
        saveToLocalStorage();
    };

    document.getElementById('netPay').addEventListener('input', (e) => {
        appState.netMonthlyPaycheck = parseFloat(e.target.value) || 0;
        updateCalculations();
    });

    document.getElementById('fixedExpenses').addEventListener('input', (e) => {
        appState.fixedExpenses = parseFloat(e.target.value) || 0;
        updateCalculations();
    });

    // Cash Leaks Listeners
    document.querySelectorAll('[data-leak-category], [data-leak-amount]').forEach(input => {
        input.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.leakCategory ?? e.target.dataset.leakAmount);
            const isCategory = e.target.dataset.leakCategory !== undefined;

            if (isCategory) appState.cashLeaks[index].category = e.target.value;
            else appState.cashLeaks[index].amount = parseFloat(e.target.value) || 0;

            renderCashLeaksChart();
            saveToLocalStorage();
        });
    });

    // Goal Listeners
    document.getElementById('goalTitle').addEventListener('input', e => { appState.shortTermGoal.title = e.target.value; saveToLocalStorage(); });
    document.getElementById('goalAmount').addEventListener('input', e => { appState.shortTermGoal.amount = parseFloat(e.target.value) || 0; saveToLocalStorage(); });
    document.getElementById('goalDate').addEventListener('input', e => { appState.shortTermGoal.targetDate = e.target.value; saveToLocalStorage(); });
}

function renderCashLeaksChart() {
    const ctx = document.getElementById('cashLeaksChart')?.getContext('2d');
    if (!ctx) return;
    const data = {
        labels: appState.cashLeaks.map(l => l.category || ''),
        datasets: [{
            label: 'Monthly Spending',
            data: appState.cashLeaks.map(l => l.amount),
            backgroundColor: ['#A67B5B', '#D9CBBF', '#EAE0D5'],
            borderRadius: 4,
        }]
    };
    const options = {
                indexAxis: 'y', responsive: true, maintainAspectRatio: false, 
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `$${c.raw.toLocaleString()}` } } },
                scales: { x: { beginAtZero: true } }
    };
    initChart(ctx, 'bar', data, options);
}

// -- TAB 3: BLUEPRINT --
function renderBlueprintTab() {
    // Calculations
    const wealthTarget = appState.availableCash > 0 ? Math.round(appState.availableCash * 0.2) : 0;
    appState.spendingPlan.wealth = wealthTarget; // Update state with calc

    const totalWants = appState.spendingPlan.debtAcceleration + appState.spendingPlan.guiltFreeBuckets.reduce((sum, b) => sum + b.amount, 0);
    const remainingForPlan = appState.availableCash - wealthTarget - totalWants;

    const content = `
        <div class="animate-fade-in">
            <h2 class="text-2xl font-bold mb-4 text-[#A67B5B]">Module 3: The Implementable Spending Plan</h2>
            <p class="mb-6 text-[#796A5C]">
                This is where strategy meets action. Use your available cash to create a concrete, automated plan. Assign every dollar a job, starting with "Future You."
            </p>
            <div class="grid md:grid-cols-3 gap-8">
                <div class="md:col-span-2 space-y-6 p-6 bg-[#FDFBF8] rounded-lg border border-[#EAE0D5]">
                    
                    <div class="flex justify-between items-center bg-white p-4 rounded shadow-sm">
                        <p class="font-semibold">Available Cash to Plan:</p>
                        <p class="font-bold text-xl text-[#A67B5B]">$${appState.availableCash.toLocaleString()}</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium">Wealth (Future You) - Target 20%</label>
                        <p class="text-lg font-semibold text-green-700">$${wealthTarget.toLocaleString()}</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium">Aggressive Debt Attack ($)</label>
                        <input type="number" id="debtAcceleration" class="w-full mt-1 border p-2 rounded" value="${appState.spendingPlan.debtAcceleration || ''}">
                    </div>

                    <h4 class="font-semibold pt-4 border-t border-[#EAE0D5]">Guilt-Free Spending Buckets (Wants)</h4>
                    <div id="guiltFreeBucketsContainer" class="space-y-3">
                        ${appState.spendingPlan.guiltFreeBuckets.map((bucket, index) => `
                            <div class="grid grid-cols-2 gap-2">
                                <input type="text" data-bucket-name="${index}" class="border p-2 rounded text-sm" value="${bucket.name}" placeholder="New Bucket">
                                <input type="number" data-bucket-amount="${index}" class="border p-2 rounded text-sm" value="${bucket.amount || ''}" placeholder="Amount">
                            </div>
                        `).join('')}
                    </div>
                    <button id="addBucket" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm font-semibold">+ Add Bucket</button>
                    <button id="removeBucket" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm font-semibold">- Remove Bucket</button>

                    <div class="mt-4 p-4 bg-white rounded-lg shadow-sm">
                        <div class="flex justify-between items-center">
                            <p class="font-semibold">Remaining for Needs (Essentials):</p>
                            <p id="remainingForNeeds" class="font-bold text-xl ${remainingForPlan < 0 ? 'text-red-600' : 'text-blue-700'}">$${remainingForPlan.toLocaleString()}</p>
                        </div>
                        <p class="text-xs text-gray-500">This remaining amount must cover your variable essential spending (groceries, gas, etc.).</p>
                    </div>
                </div>

                <div class="text-center p-4">
                    <h3 class="font-semibold text-lg mb-4">Your New Plan</h3>
                    <div class="chart-container h-64">
                        <canvas id="planDonutChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('main-content-area').innerHTML = content;
    renderPlanDonutChart();

    // -- Event Listeners for Blueprint --
    const handleInput = () => {
        // 1. Capture inputs
        appState.spendingPlan.debtAcceleration = parseFloat(document.getElementById('debtAcceleration').value) || 0;

        document.querySelectorAll('#guiltFreeBucketsContainer > div').forEach((div, index) => {
            const name = div.querySelector(`[data-bucket-name="${index}"]`).value;
            const amount = parseFloat(div.querySelector(`[data-bucket-amount="${index}"]`).value) || 0;
            appState.spendingPlan.guiltFreeBuckets[index] = { name, amount };
        });

        // 2. Calculate remaining
        const currentTotalWants = appState.spendingPlan.debtAcceleration + appState.spendingPlan.guiltFreeBuckets.reduce((sum, b) => sum + b.amount, 0);
        const currentRemaining = appState.availableCash - wealthTarget - currentTotalWants;

        // 3. Update Text and Chart (Without re-rendering HTML inputs)
        const remEl = document.getElementById('remainingForNeeds');
        remEl.textContent = `$${currentRemaining.toLocaleString()}`;

        if (currentRemaining < 0) {
            remEl.classList.remove('text-blue-700'); // Remove blue
            remEl.classList.add('text-red-600');     // Add red
        } 
        else {
            remEl.classList.remove('text-red-600');  // Remove red
            remEl.classList.add('text-blue-700');    // Add blue
        }

        renderPlanDonutChart();
        saveToLocalStorage();
    };

    document.getElementById('debtAcceleration').addEventListener('input', handleInput);
    document.getElementById('guiltFreeBucketsContainer').addEventListener('input', handleInput); // Event delegation

    // Add Bucket Button
    document.getElementById('addBucket').addEventListener('click', () => {
        appState.spendingPlan.guiltFreeBuckets.push({ name: '', amount: 0 });
        saveToLocalStorage();
        renderBlueprintTab(); // Re-render to show new row
    });
    // Remove Bucket Button
    document.getElementById('removeBucket').addEventListener('click', () => {
        if (appState.spendingPlan.guiltFreeBuckets.length > 0) {
            appState.spendingPlan.guiltFreeBuckets.pop();
            saveToLocalStorage();
            renderBlueprintTab(); // Re-render to show updated rows
        }
    });
}

function renderPlanDonutChart() {
    const ctx = document.getElementById('planDonutChart')?.getContext('2d');
    if (!ctx) return;

    const wealthTarget = Math.round(appState.availableCash * 0.2);
    const totalWants = appState.spendingPlan.debtAcceleration + appState.spendingPlan.guiltFreeBuckets.reduce((sum, b) => sum + b.amount, 0);
    let remainingNeeds = appState.availableCash - wealthTarget - totalWants;

    let dataLabels = ['Wealth Target'];
    let dataAmounts = [wealthTarget];
    let dataColors = ['#5F8670'];

    if (remainingNeeds < 0) {
        dataLabels.push('Over-Allocated');
        dataAmounts.push(Math.abs(remainingNeeds));
        dataColors.push('#FF6B6B');
        remainingNeeds = 0; // Prevent negative slice
    }

    dataLabels.push('Needs (Essentials)');
    dataAmounts.push(remainingNeeds);
    dataColors.push('#A67B5B');

    if (appState.spendingPlan.debtAcceleration > 0) {
        dataLabels.push('Debt Attack');
        dataAmounts.push(appState.spendingPlan.debtAcceleration);
        dataColors.push('#D9CBBF');
    }

    //Guilt Free Buckets
    appState.spendingPlan.guiltFreeBuckets.forEach(bucket => {
        if (bucket.amount > 0) {
            dataLabels.push(bucket.name);
            dataAmounts.push(bucket.amount);
            dataColors.push(['#EAE0D5', '#B4A596', '#796A5C', '#615449'][dataLabels.length % 4]);
        }
    });

    const data = {
        labels: dataLabels,
        datasets: [{
            data: dataAmounts,
            backgroundColor: dataColors,
            borderColor: '#FFFFFF',
            borderWidth: 2,
        }]
    };
    
    const options = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: (c) => `${c.label}: $${c.raw.toLocaleString()}` } } }
    };

    initChart(ctx, 'doughnut', data, options);
}

// -- TAB 4: AUTOMATE --
function renderAutomateTab() {
    // Dynamic values from appState
    if (!appState.automation) {
        appState.automation = { debtTransfer: false, wealthTransfer: false };
    }

    // 2. Dynamic values from appState
    const debtAmount = (appState.spendingPlan.debtAcceleration || 0).toLocaleString();
    const wealthAmount = (appState.spendingPlan.wealth || 0).toLocaleString();
    
    // 3. Determine Checkbox State strings
    const debtChecked = appState.automation.debtTransfer ? 'checked' : '';
    const wealthChecked = appState.automation.wealthTransfer ? 'checked' : '';

    const content = `
        <div class="animate-fade-in">
            <h2 class="text-2xl font-bold mb-4 text-[#A67B5B]">Module 4: Automation & Boundary Lock-In</h2>
            <p class="mb-6 text-[#796A5C]">
                A plan is only as good as its execution. Here, we lock in your new habits through automation and prepare you to protect your financial boundaries.
            </p>
            <div class="grid md:grid-cols-2 gap-8">
                <div class="p-6 bg-[#FDFBF8] rounded-lg border border-[#EAE0D5]">
                    <h3 class="font-semibold text-lg mb-4">The Two-Transfer Automation System</h3>
                    <p class="text-sm text-[#796A5C] mb-4">Commit to setting up these two automated transfers to occur the day after your paycheck hits your account.</p>
                    <ul class="space-y-4">
                        <li class="flex items-start">
                            <input type="checkbox" class="mt-1" ${debtChecked} onchange="toggleAutomationCheck('debtTransfer', this.checked)">
                            <label class="ml-3 text-sm">
                                <span class="font-semibold block">Transfer 1: Debt Acceleration</span>
                                Transfer <span class="font-bold">$${debtAmount}</span> to your primary debt target.
                            </label>
                        </li>
                        <li class="flex items-start">
                            <input type="checkbox" class="mt-1" ${wealthChecked} onchange="toggleAutomationCheck('wealthTransfer', this.checked)">
                            <label class="ml-3 text-sm">
                                <span class="font-semibold block">Transfer 2: Investment/Savings</span>
                                Transfer <span class="font-bold">$${wealthAmount}</span> to your brokerage or savings.
                            </label>
                        </li>
                    </ul>
                </div>
                <div class="p-6 bg-[#FDFBF8] rounded-lg border border-[#EAE0D5]">
                    <h3 class="font-semibold text-lg mb-4">The Boundary Protocol</h3>
                    <p class="text-sm text-[#796A5C] mb-4">High-earners protect their money with clear boundaries.
                        Here are scripts to practice.
                    </p>
                    <div class="space-y-4">
                        ${boundaryProtocols.map(p => `
                            <div class="prompt-card" onclick="this.classList.toggle('open')">
                                <div class="flex justify-between items-center">
                                    <h4 class="font-semibold">${p.q}</h4>
                                    <span class="text-xl text-[#A67B5B]">&#9662;</span>
                                </div>
                                <div class="answer pt-2">
                                    <p class="text-sm text-[#796A5C]">${p.a}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('main-content-area').innerHTML = content;
}

function toggleAutomationCheck(key, isChecked) {
    // Safety check in case old local storage data loaded without this object
    if (!appState.automation) {
        appState.automation = { debtTransfer: false, wealthTransfer: false };
    }
    
    appState.automation[key] = isChecked;
    saveToLocalStorage();
}

// -- TAB 5: NEXT STEPS --
function renderNextStepsTab() {
    const content = `
        <div class="animate-fade-in text-center max-w-2xl mx-auto">
            <h2 class="text-2xl font-bold mb-4 text-[#A67B5B]">Closing & Next Steps</h2>
            <p class="mb-6 text-[#796A5C]">You now have the map: Your implementable spending plan. The next step is getting your personalized GPS. While this workshop provides the strategy, one-on-one coaching tailors it to your unique income, debt reality, and long-term goals.</p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="#" class="btn-primary w-full sm:w-auto py-3 px-6 rounded-lg font-semibold text-center">
                        Book Your Private Discovery Call
                    </a>
                    <a href="#" class="btn-secondary w-full sm:w-auto py-3 px-6 rounded-lg font-semibold text-center">
                        Join the Financial Freedom Collective
                    </a>
                </div>
            </div>
        </div>
    `;
    document.getElementById('main-content-area').innerHTML = content;
}

// Navigation Tab Handlers
function navigate(tabName) {
    // 1. Update Buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('tab-active');
        btn.classList.add('tab-inactive');
    });
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('tab-active');
        activeBtn.classList.remove('tab-inactive');
    }

    // 2. Render Content
    if (tabName === 'mindset') renderMindsetTab();
    if (tabName === 'audit') renderAuditTab();
    if (tabName === 'blueprint') renderBlueprintTab();
    if (tabName === 'automate') renderAutomateTab();
    if (tabName === 'next') renderNextStepsTab();
}

// --- 7. INITIALIZATION ---
// Add Click Listeners to Buttons
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', (e) => {
        navigate(e.target.dataset.tab);
    });
});

// Start App
loadFromLocalStorage();
navigate('mindset');