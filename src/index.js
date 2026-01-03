// --- 1. STATIC DATA (Content Arrays) ---
const journalPrompts = [
    {
        q: 'The Emotional Trigger',
        a: 'What is the one emotion (stress, guilt, exhaustion) that drives your impulse spending?',
    },
    {
        q: 'Values Alignment',
        a: 'Are my financial choices aligning with my core values? What would I sacrifice in my current spending to achieve my bigger financial goals?',
    },
    {
        q: 'The Money Script',
        a: 'How were you raised to think about money? What are some of your fears/concerns related to it?',
    },
];

const boundaryProtocols = [
    {
        q: 'Friend asks for money',
        a: "I care about you, but I made a commitment that all my savings this month are dedicated to my down payment fund. I can't access that money right now.",
    },
    {
        q: 'Family pressure for trip',
        a: "That sounds amazing, but I'm in a focused financial quarter right now to fund my investment goals. I'll join the next trip when it aligns with my plan.",
    },
];

//Brand Colors js
const COLOR_PRIMARY = '#530D6C';
const COLOR_ACCENT = '#FCB80B';
const COLOR_NEUTRAL = '#4A4A4A';

// Application State
let appState = {
    netMonthlyPaycheck: 0,
    fixedExpenses: 0,
    availableCash: 0,
    totalLeaks: 0,
    cashLeaks: [
        { category: '', amount: 0 },
        { category: '', amount: 0 },
        { category: '', amount: 0 },
    ],
    shortTermGoal: {
        title: '',
        amount: 0,
        targetDate: '',
    },
    spendingPlan: {
        wealth: 0,
        debtAcceleration: 0,
        guiltFreeBuckets: [
            { name: '', amount: 0 },
            { name: '', amount: 0 },
            { name: '', amount: 0 },
        ],
    },
    automation: {
        debtTransfer: false,
        wealthTransfer: false,
        shortTermTransfer: false,
    },
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

// Chart Instances
const charts = {};

function initChart(ctx, type, data, options, plugins = []) {
    if (charts[ctx.canvas.id]) {
        charts[ctx.canvas.id].destroy();
    }

    charts[ctx.canvas.id] = new Chart(ctx, {
        type,
        data,
        options,
        plugins,
    });
}

const emptyStatePlugin = {
    id: 'emptyState',
    beforeDraw(chart) {
        const dataset = chart.data.datasets[0];
        const hasData =
            dataset &&
            Array.isArray(dataset.data) &&
            dataset.data.some((v) => v > 0);

        if (!hasData) {
            const { ctx, width, height } = chart;

            ctx.save();
            ctx.clearRect(0, 0, width, height);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '16px sans-serif';
            ctx.fillStyle = '#9CA3AF';
            ctx.fillText('Waiting for data…', width / 2, height / 2);
            ctx.restore();
        }
    },
};

// Render Functions

// -- TAB 1: MINDSET --
function renderMindsetTab() {
    const content = `
        <div class="animate-fade-in">
            <h2 class="text-2xl font-bold mb-4 text-brand-primary">Module 1: The Six-Figure Mindset Reset</h2>
            <p class="mb-6 text-gray-600">Financial freedom begins with a mental shift. We're not budgeting; we're strategically directing our cash flow. This section helps uncover the 'why' behind your spending before we build the 'how'.</p>
            <div class="grid md:grid-cols-2 gap-6 items-start">
                <div>
                    <h3 class="font-semibold text-lg mb-4">Journal Prompts for Clarity</h3>
                    <div id="journal-prompts-container" class="space-y-4">
                        ${journalPrompts
                            .map(
                                (p) => `
                            <div class="prompt-card" onclick="this.classList.toggle('open')">
                                <div class="flex justify-between items-center">
                                    <h4 class="font-semibold">${p.q}</h4>
                                    <span class="text-xl text-brand-accent">&#9662;</span>
                                </div>
                                <div class="answer pt-2">
                                    <p class="text-sm text-gray-600">${p.a}</p>
                                </div>
                            </div>
                        `
                            )
                            .join('')}
                    </div>
                </div>
                <div class="text-center p-4 rounded-lg bg-[#F9FAFB] shadow-sm border border-gray-200">
                    <h3 class="font-semibold text-lg mb-4">The Power 3 Allocation Concept</h3>
                    <p class="text-sm text-gray-500 mb-4">We will build a plan based on this powerful framework: assigning a portion of your income first to wealth, then needs, then wants.</p>
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
        labels: [
            'Wealth (Future You)',
            'Needs (Essentials)',
            "Wants (Today's Joy)",
        ],
        datasets: [
            {
                data: [20, 50, 30],
                backgroundColor: [COLOR_PRIMARY, COLOR_NEUTRAL, COLOR_ACCENT],
                borderColor: '#FFFFFF',
                borderWidth: 2,
            },
        ],
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' },
            datalabels: {
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: 20,
                padding: 6,
                color: '#FFFFFF',
                font: { weight: 'bold', size: 15 },
                formatter: (value) => value + '%',
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        return ` ${context.raw}%`;
                    },
                },
            },
        },
    };
    initChart(ctx, 'doughnut', data, options, [ChartDataLabels]);
}

// -- TAB 2: AUDIT --
function renderAuditTab() {
    const content = `
        <div class="fade-in">
            <h2 class="text-2xl font-bold mb-4 text-brand-primary">Module 2: The Cash Flow Audit & Vision</h2>
            <p class="mb-6 text-gray-600">
                Clarity is power. We calculate your true available cash, identify leaks, and set the financial goal that will drive your new behavior.
            </p>
            <div class="grid md:grid-cols-2 gap-8">
                <!--Step 1-->
                <div class="space-y-6 p-6 bg-[#F9FAFB] rounded-lg border border-gray-200 shadow-sm">
                    <h3 class="font-semibold text-lg mb-2 text-gray-800">Step 1: Calculate Your Available Cash</h3>
                    <div>
                        <label for="netPay" class="block text-sm font-medium text-gray-700">Net Monthly Paycheck ($)</label>
                        <input type="number" id="netPay" class="w-full mt-1" placeholder="e.g., 8000" value="${
                            appState.netMonthlyPaycheck || ''
                        }">
                    </div>
                    <div>
                        <label for="fixedExpenses" class="block text-sm font-medium text-gray-700">Total Fixed Expenses ($)</label>
                        <input type="number" id="fixedExpenses" class="w-full mt-1" placeholder="Rent, min debt payments, etc." value="${
                            appState.fixedExpenses || ''
                        }">
                    </div>
                    <div id="availableCashResult" class="text-center font-bold text-2xl text-brand-primary h-8">Available Cash: $${appState.availableCash.toLocaleString()}</div>
                </div>
                <!--Step 2-->
                <div class="space-y-4 p-6 bg-[#F9FAFB] rounded-lg border border-gray-200 shadow-sm">
                    <h3 class="font-semibold text-lg mb-2 text-gray-800">Step 2: Map Your Top 3 Cash Leaks</h3>
                    <p class="text-sm text-gray-600">
                        Enter your top 3 variable spending categories from the last month.
                    </p>
                    ${appState.cashLeaks
                        .map(
                            (leak, index) => `
                        <div class="grid grid-cols-2 gap-2">
                            <input type="text" data-leak-category="${index}" class="w-full text-sm border p-2 rounded" placeholder="Category" value="${
                                leak.category || ''
                            }">
                            <input type="number" data-leak-amount="${index}" class="w-full text-sm border p-2 rounded" placeholder="Amount ($)" value="${
                                leak.amount || ''
                            }">
                        </div>
                    `
                        )
                        .join('')}
                    <div id="totalCashLeaks" class="text-center font-bold text-2xl text-amber-700 h-8">Total Cash Leaks: $${appState.totalLeaks.toLocaleString()}</div>
                </div>
            </div>
            <!--Step 3-->
            <div class="mt-8 p-6 bg-[#F9FAFB] rounded-lg border border-gray-200 shadow-sm">
                <h3 class="font-semibold text-lg mb-2 text-gray-800">Step 3: Vision - Short-Term Goal</h3>
                <p class="text-sm text-gray-600 mb-6">
                    Define one clear, measurable short-term goal to be funded by closing your Cash Leaks.
                </p>
                <div class="grid md:grid-cols-3 gap-4">
                    <div>
                        <label for="goalTitle" class="block text-sm font-medium text-gray-700">Goal Title</label>
                        <input type="text" id="goalTitle" class="w-full mt-1" placeholder="e.g., European Trip Fund"
                            value="${appState.shortTermGoal.title || ''}">
                    </div>
                    <div>
                        <label for="goalAmount" class="block text-sm font-medium text-gray-700">Target Amount
                            ($)</label>
                        <input type="number" id="goalAmount" class="w-full mt-1" placeholder="e.g., 5000"
                            value="${appState.shortTermGoal.amount || ''}">
                    </div>
                    <div>
                        <label for="goalDate" class="block text-sm font-medium text-gray-700">Target Completion Date</label>
                        <input type="date" id="goalDate" class="w-full mt-1" value="${
                            appState.shortTermGoal.targetDate || ''
                        }">
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('main-content-area').innerHTML = content;

    // -- Event Listeners for Audit --
    // Helper to update state and save
    const updateCalculations = () => {
        appState.availableCash =
            appState.netMonthlyPaycheck - appState.fixedExpenses;
        document.getElementById(
            'availableCashResult'
        ).textContent = `Available Cash: $${appState.availableCash.toLocaleString()}`;
    };

    const updateCashLeaks = () => {
        appState.totalLeaks = appState.cashLeaks.reduce(
            (sum, leak) => sum + leak.amount,
            0
        );
        document.getElementById(
            'totalCashLeaks'
        ).textContent = `Total Cash Leaks: $${appState.totalLeaks.toLocaleString()}`;
    };

    document.getElementById('netPay').addEventListener('input', (e) => {
        appState.netMonthlyPaycheck = parseFloat(e.target.value) || 0;
        updateCalculations();
        saveToLocalStorage();
    });

    document.getElementById('fixedExpenses').addEventListener('input', (e) => {
        appState.fixedExpenses = parseFloat(e.target.value) || 0;
        updateCalculations();
        saveToLocalStorage();
    });

    // Cash Leaks Listeners
    document
        .querySelectorAll('[data-leak-category], [data-leak-amount]')
        .forEach((input) => {
            input.addEventListener('input', (e) => {
                const index = parseInt(
                    e.target.dataset.leakCategory ?? e.target.dataset.leakAmount
                );
                const isCategory = e.target.dataset.leakCategory !== undefined;

                if (isCategory) {
                    appState.cashLeaks[index].category = e.target.value;
                } else {
                    appState.cashLeaks[index].amount =
                        parseFloat(e.target.value) || 0;
                }
                updateCashLeaks();
                saveToLocalStorage();
            });
        });

    // Goal Listeners
    document.getElementById('goalTitle').addEventListener('input', (e) => {
        appState.shortTermGoal.title = e.target.value;
        saveToLocalStorage();
    });
    document.getElementById('goalAmount').addEventListener('input', (e) => {
        appState.shortTermGoal.amount = parseFloat(e.target.value) || 0;
        saveToLocalStorage();
    });
    document.getElementById('goalDate').addEventListener('input', (e) => {
        appState.shortTermGoal.targetDate = e.target.value;
        saveToLocalStorage();
    });
}

// -- TAB 3: BLUEPRINT --
function renderBlueprintTab() {
    // Calculations
    const wealthTarget =
        appState.availableCash > 0
            ? Math.round(appState.availableCash * 0.2)
            : 0;
    appState.spendingPlan.wealth = wealthTarget; // Update state with calc

    const totalWants =
        appState.spendingPlan.debtAcceleration +
        appState.spendingPlan.guiltFreeBuckets.reduce(
            (sum, b) => sum + b.amount,
            0
        );
    const remainingForPlan = appState.availableCash - wealthTarget - totalWants;

    const monthsToFund =
        (appState.totalLeaks || 0) === 0
            ? 0
            : Math.ceil(
                  (appState.shortTermGoal.amount || 0) / appState.totalLeaks
              );

    const content = `
        <div class="animate-fade-in">
            <h2 class="text-2xl font-bold mb-4 text-brand-primary">Module 3: The Implementable Spending Plan</h2>
            <p class="mb-6 text-gray-600">
                This is where strategy meets action. Use your available cash to create a concrete, automated plan. Assign every dollar a job, starting with "Future You."
            </p>
            <div class="grid md:grid-cols-3 gap-8">
                <div class="md:col-span-2 space-y-6 p-6 bg-[#F9FAFB] rounded-lg border border-gray-200 shadow-sm">
                    
                    <div class="flex justify-between items-center bg-white p-4 rounded shadow-sm">
                        <p class="font-semibold">Available Cash to Plan:</p>
                        <p class="font-bold text-xl text-green-700">$${appState.availableCash.toLocaleString()}</p>
                    </div>

                    <div>
                        <p class="block text-sm font-medium text-gray-700">Wealth (Future You) - Target 20%</p>
                        <p class="text-lg font-semibold text-brand-primary">$${wealthTarget.toLocaleString()}</p>
                        <p class="text-sm text-gray-400">This is the amount you'll allocate to your future self. It's a commitment to your wealth-building journey.</p>
                    </div>

                    <div>
                        <p class="block text-sm font-medium text-gray-700">Aggressive Debt Attack ($) (Extra Principal)</p>
                        <input type="number" id="debtAcceleration" class="w-full mt-1 border p-2 rounded" value="${
                            appState.spendingPlan.debtAcceleration || ''
                        }">
                        <p class="text-sm text-gray-400">This is additional money on top of your wealth target and fixed.</p>
                    </div>

                    <div>
                        <h4 class="font-semibold pt-4 pb-2 border-t border-gray-200 text-gray-800">Goal Acceleration (From Leaks)</h4>
                        <div class="grid md:grid-cols-2 gap-2">
                            <div>
                                <label for="shortTermGoalName" class="block text-sm font-medium text-gray-700">Goal Title</label>        
                                <input id="shortTermGoalName" type="text" class="w-full mt-1" value="${
                                    appState.shortTermGoal.title || ''
                                }">
                            </div>
                            <div>
                                <label for="shortTermGoalAmount" class="block text-sm font-medium text-gray-700">Target ($)</label>
                                <input id="shortTermGoalAmount" type="number" class="w-full mt-1" value="${
                                    appState.shortTermGoal.amount || ''
                                }">
                            </div>
                        </div>

                        <div class="grid grid-cols-2 mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                            <div class="flex justify-between items-center">
                                <p class="font-semibold text-lg text-gray-700">Monthly Leak Reallocation: <span id="monthlyLeakReallocation" class="text-amber-700">$${
                                    appState.totalLeaks || '0'
                                }</span></p>
                            </div>
                            <div class="justify-self-end text-center">
                                <p id="monthsToFund" class="text-3xl font-bold text-amber-700">
                                ${monthsToFund}
                                </p>
                                <p class="text-sm text-amber-700">MONTHS TO FUND</p>
                            </div>
                        </div>
                    </div>

                    <h4 class="font-semibold pt-4 border-t border-gray-200 text-gray-800">Guilt-Free Spending Buckets (Wants) - Target &#8804; 30%</h4>
                    <div id="guiltFreeBucketsContainer" class="space-y-3">
                        ${appState.spendingPlan.guiltFreeBuckets
                            .map(
                                (bucket, index) => `
                            <div class="grid grid-cols-2 gap-2">
                                <input type="text" data-bucket-name="${index}" class="border p-2 rounded text-sm" value="${
                                    bucket.name
                                }" placeholder="New Bucket">
                                <input type="number" data-bucket-amount="${index}" class="border p-2 rounded text-sm" value="${
                                    bucket.amount || ''
                                }" placeholder="Amount">
                            </div>
                        `
                            )
                            .join('')}
                    </div>
                    <button id="addBucket" class="btn-secondary text-sm py-2 px-4 rounded-lg font-medium">+ Add Bucket</button>
                    <button id="removeBucket" class="btn-secondary text-sm py-2 px-4 rounded-lg font-medium">- Remove Bucket</button>

                    <div class="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                        <div class="flex justify-between items-center">
                            <p class="font-semibold text-gray-700">Remaining for Variable Essentials:</p>
                            <p id="remainingForNeeds" class="font-bold text-xl ${
                                remainingForPlan < 0
                                    ? 'text-red-600'
                                    : 'text-blue-500'
                            }">$${remainingForPlan.toLocaleString()}</p>
                        </div>
                        <p class="text-xs text-gray-500">This remaining amount must cover your variable essential spending (groceries, gas, etc.).</p>
                    </div>
                </div>

                <div class="text-center p-4 border border-gray-200 rounded-lg bg-[#F9FAFB] shadow-sm">
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
        appState.spendingPlan.debtAcceleration =
            parseFloat(document.getElementById('debtAcceleration').value) || 0;

        document
            .querySelectorAll('#guiltFreeBucketsContainer > div')
            .forEach((div, index) => {
                const name = div.querySelector(
                    `[data-bucket-name="${index}"]`
                ).value;
                const amount =
                    parseFloat(
                        div.querySelector(`[data-bucket-amount="${index}"]`)
                            .value
                    ) || 0;
                appState.spendingPlan.guiltFreeBuckets[index] = {
                    name,
                    amount,
                };
            });

        // 2. Calculate remaining
        const currentTotalWants =
            appState.spendingPlan.debtAcceleration +
            appState.spendingPlan.guiltFreeBuckets.reduce(
                (sum, b) => sum + b.amount,
                0
            );
        const currentRemaining =
            appState.availableCash - wealthTarget - currentTotalWants;

        // 3. Update Text and Chart (Without re-rendering HTML inputs)
        const remEl = document.getElementById('remainingForNeeds');
        remEl.textContent = `$${currentRemaining.toLocaleString()}`;

        if (currentRemaining < 0) {
            remEl.classList.remove('text-blue-500'); // Remove blue
            remEl.classList.add('text-red-600'); // Add red
        } else {
            remEl.classList.remove('text-red-600'); // Remove red
            remEl.classList.add('text-blue-500'); // Add blue
        }
        updateGoalAcceleration();
        renderPlanDonutChart();
        saveToLocalStorage();
    };

    const updateGoalAcceleration = () => {
        const monthlyLeaks = appState.totalLeaks || 0;

        const months =
            monthlyLeaks === 0
                ? 0
                : Math.ceil(
                      (appState.shortTermGoal.amount || 0) / monthlyLeaks
                  );

        document.getElementById(
            'monthlyLeakReallocation'
        ).textContent = `$${monthlyLeaks.toLocaleString()}`;

        document.getElementById('monthsToFund').textContent = months;
    };

    document
        .getElementById('debtAcceleration')
        .addEventListener('input', handleInput);
    document
        .getElementById('guiltFreeBucketsContainer')
        .addEventListener('input', handleInput);

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

    document
        .getElementById('shortTermGoalName')
        .addEventListener('input', (e) => {
            appState.shortTermGoal.title = e.target.value;
            saveToLocalStorage();
        });
    document
        .getElementById('shortTermGoalAmount')
        .addEventListener('input', (e) => {
            appState.shortTermGoal.amount = parseFloat(e.target.value) || 0;
            updateGoalAcceleration();
            saveToLocalStorage();
        });
}

function renderPlanDonutChart() {
    const ctx = document.getElementById('planDonutChart')?.getContext('2d');
    if (!ctx) return;

    const wealthTarget =
        appState.availableCash > 0
            ? Math.round(appState.availableCash * 0.2)
            : 0;
    const totalWants =
        appState.spendingPlan.debtAcceleration +
        appState.spendingPlan.guiltFreeBuckets.reduce(
            (sum, b) => sum + b.amount,
            0
        );
    let remainingNeeds = appState.availableCash - wealthTarget - totalWants;

    let dataLabels = ['Wealth Target'];
    let dataAmounts = [wealthTarget];
    let dataColors = [COLOR_PRIMARY];

    if (remainingNeeds < 0) {
        dataLabels.push('Over-Allocated');
        dataAmounts.push(Math.abs(remainingNeeds));
        dataColors.push('#FF6B6B');
        remainingNeeds = 0; // Prevent negative slice
    }

    dataLabels.push('Needs (Essentials)');
    dataAmounts.push(remainingNeeds);
    dataColors.push('#2B7FFF');

    if (appState.spendingPlan.debtAcceleration > 0) {
        dataLabels.push('Debt Attack');
        dataAmounts.push(appState.spendingPlan.debtAcceleration);
        dataColors.push(COLOR_NEUTRAL);
    }

    //Guilt Free Buckets
    appState.spendingPlan.guiltFreeBuckets.forEach((bucket) => {
        if (bucket.amount > 0) {
            dataLabels.push(bucket.name);
            dataAmounts.push(bucket.amount);
            dataColors.push(
                ['#FFF1C2', '#F5D77A', '#E3B94A', '#C99A17'][
                    dataLabels.length % 4
                ]
            );
        }
    });

    // Prepare and render chart
    const data = {
        labels: dataLabels,
        datasets: [
            {
                data: dataAmounts,
                backgroundColor: dataColors,
                borderColor: '#FFFFFF',
                borderWidth: 2,
            },
        ],
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' },
            datalabels: {
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: 20,
                padding: 6,
                color: '#FFFFFF',
                font: { weight: 'bold', size: 15 },
                formatter: (value, context) => {
                    const data = context.chart.data.datasets[0].data;
                    const total = data.reduce((sum, v) => sum + v, 0);
                    if (value <= 0 || !total) return null; //Check for zero total
                    return `${((value / total) * 100).toFixed(1)}%`;
                },
            },
            tooltip: {
                callbacks: { label: (c) => ` $${c.raw.toLocaleString()}` },
            },
        },
    };
    initChart(ctx, 'doughnut', data, options, [
        ChartDataLabels,
        emptyStatePlugin,
    ]);
}

// -- TAB 4: AUTOMATE --
function renderAutomateTab() {
    const content = `
        <div class="animate-fade-in">
            <h2 class="text-2xl font-bold mb-4 text-brand-primary">Module 4: Automation & Boundary Lock-In</h2>
            <p class="mb-6 text-gray-600">
                A plan is only as good as its execution. Here, we lock in your new habits through automation and prepare you to protect your financial boundaries.
            </p>
            <div class="grid md:grid-cols-2 gap-8">
                <div class="p-6 bg-[#F9FAFB] rounded-lg border border-gray-200 shadow-sm">
                    <h3 class="font-semibold text-lg mb-4">The Three-Transfer Automation System</h3>
                    <p class="text-sm text-gray-600 mb-4">Commit to setting up these two automated transfers to occur the day after your paycheck hits your account.</p>
                    <ul class="space-y-4">
                        <li class="flex items-start">
                            <input id="debtTransfer" type="checkbox" class="mt-1 text-brand-primary" ${
                                appState.automation.debtTransfer
                                    ? 'checked'
                                    : ''
                            } onchange="toggleAutomationCheck('debtTransfer', this.checked)">
                            <label for="debtTransfer" class="ml-3 text-sm">
                                <span class="font-semibold block text-gray-900">Transfer 1: Debt Acceleration</span>
                                Transfer <span class="font-bold text-brand-primary">$${(
                                    appState.spendingPlan.debtAcceleration || 0
                                ).toLocaleString()}</span> to your primary debt target.
                            </label>
                        </li>
                        <li class="flex items-start">
                            <input id="wealthTransfer" type="checkbox" class="mt-1 text-brand-primary" ${
                                appState.automation.wealthTransfer
                                    ? 'checked'
                                    : ''
                            } onchange="toggleAutomationCheck('wealthTransfer', this.checked)">
                            <label for="wealthTransfer" class="ml-3 text-sm">
                                <span class="font-semibold block text-gray-900">Transfer 2: Investment/Savings</span>
                                Transfer <span class="font-bold text-brand-primary">$${(
                                    appState.spendingPlan.wealth || 0
                                ).toLocaleString()}</span> to your brokerage or savings.
                            </label>
                        </li>
                        <li class="flex items-start">
                            <input id="shortTermTransfer" type="checkbox" class="mt-1 text-brand-primary" ${
                                appState.automation.shortTermTransfer
                                    ? 'checked'
                                    : ''
                            } onchange="toggleAutomationCheck('shortTermTransfer', this.checked)">
                            <label for="shortTermTransfer" class="ml-3 text-sm">
                                <span class="font-semibold block text-gray-900">Transfer 3: Short-Term Goal</span>
                                Transfer <span class="font-bold text-brand-primary">$${(
                                    appState.totalLeaks || 0
                                ).toLocaleString()}</span> to your goal specific savings account.
                            </label>
                        </li>
                    </ul>
                </div>
                <div class="p-6 bg-[#F9FAFB] rounded-lg border border-gray-200 shadow-sm">
                    <h3 class="font-semibold text-lg mb-4">The Boundary Protocol</h3>
                    <p class="text-sm text-gray-600 mb-4">High-earners protect their money with clear boundaries.
                        Here are scripts to practice.
                    </p>
                    <div class="space-y-4">
                        ${boundaryProtocols
                            .map(
                                (p) => `
                            <div class="prompt-card" onclick="this.classList.toggle('open')">
                                <div class="flex justify-between items-center">
                                    <h4 class="font-semibold">${p.q}</h4>
                                    <span class="text-xl text-brand-accent">&#9662;</span>
                                </div>
                                <div class="answer pt-2">
                                    <p class="text-sm text-gray-600">${p.a}</p>
                                </div>
                            </div>
                        `
                            )
                            .join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('main-content-area').innerHTML = content;
}

function toggleAutomationCheck(key, isChecked) {
    appState.automation[key] = isChecked;
    saveToLocalStorage();
}

// -- TAB 5: NEXT STEPS --
function renderNextStepsTab() {
    const content = `
        <div class="animate-fade-in">
            <div class="rounded-lg bg-[#F9FAFB] px-6 pb-10 pt-6 mb-4 border-gray-300 border-2 shadow-sm">
                <p class="text-base font-semibold text-[hsla(43,100%,45%,1)] mb-2 ">SAVE THE DATE</p>
                <h2 class="text-2xl font-bold mb-4 text-brand-primary">Arise & Align Conference 2026</h2>
                <p class="mb-6 text-gray-600">Reclaiming your health. Reframing your wealth. Restoring your wholeness. Join us for a full day of unmasking burnout and building holistic wealth.</p>   
                <a href="https://link.reframedfinancialcoaching.com/payment-link/693da086902dfc4e43068b91" target="_blank" class="btn-primary w-full sm:w-auto py-3 px-15 rounded-lg font-semibold text-center">
                Register Now!
                </a>
            </div>

            <div class="flex flex-col sm:flex-row gap-4 items-stretch">
                <div class="flex-1 flex flex-col px-8 pt-8 pb-12 bg-[#F9FAFB] rounded-lg border border-gray-200 shadow-sm">
                    <h3 class="font-semibold text-xl mb-4">Strategy Session</h3>
                    <p class="mb-4 text-gray-600">A 30-minute deep dive into your personalized spending plan and mindset hurdles.</p>
                    <a href="https://calendly.com/prea-epps/30min-strategy-session" target="_blank" class="mt-auto underline underline-offset-4 font-bold text-[var(--brand-primary)] hover:text-[var(--brand-hover)] transition-colors">
                        Book My Session &rarr;
                    </a> 
                </div>
                
                <div class="flex-1 flex flex-col px-8 pt-8 pb-12 bg-[#F9FAFB] rounded-lg border border-gray-200 shadow-sm">
                    <h3 class="font-semibold text-xl mb-4">Freedom Through Finance</h3>
                    <p class="mb-4 text-gray-600">Define your biggest goals and get a professional recommendation on your next steps.</p>
                    <a href="https://calendly.com/prea-epps/freedom-through-finance" target="_blank" class="mt-auto underline underline-offset-4 font-bold text-[var(--brand-primary)] hover:text-[var(--brand-hover)] transition-colors">
                        Schedule Call &rarr;
                    </a> 
                </div>
            </div>

            
            <button id="printSummaryBtn" class="flex items-center justify-center mt-6 px-12  mx-auto text-brand-primary border border-brand-primary hover:bg-gray-50 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                </svg>
                Print Workshop Summary
            </button>
        </div>
    `;
    document.getElementById('main-content-area').innerHTML = content;

    // Attach Event Listener for the Print Button
    document
        .getElementById('printSummaryBtn')
        .addEventListener('click', generateAndPrintSummary);
}

// --- PRINT FUNCTIONALITY ---
function generateAndPrintSummary() {
    // Sum up guilt-free buckets
    const totalWantsBuckets = appState.spendingPlan.guiltFreeBuckets.reduce(
        (sum, b) => sum + (b.amount || 0),
        0
    );
    const totalWants =
        appState.spendingPlan.debtAcceleration + totalWantsBuckets;

    // Calculate Needs
    const needsAmount =
        appState.availableCash -
        (appState.spendingPlan.wealth || 0) -
        totalWants;

    // Generate Date String
    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    // Build HTML Template
    const printHTML = `
        <div class="print-header">
            <h1 style="color: #530D6C; font-size: 24px; font-weight: bold; margin-bottom: 5px;">The Six Figure Spending Plan</h1>
            <p style="color: #666; font-size: 14px;">Workshop Summary • Generated on ${today}</p>
        </div>

        <div class="print-grid">
            <div class="print-section">
                <h3 style="font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ccc;">1. The Audit</h3>
                <table class="print-table">
                    <tr>
                        <td>Net Monthly Pay:</td>
                        <td style="text-align:right"><strong>$${(
                            appState.netMonthlyPaycheck || 0
                        ).toLocaleString()}</strong></td>
                    </tr>
                    <tr>
                        <td>Fixed Expenses:</td>
                        <td style="text-align:right; color: #666;">- $${(
                            appState.fixedExpenses || 0
                        ).toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0;"><strong>True Available Cash:</strong></td>
                        <td style="text-align:right; font-weight:bold; color: #530D6C;">$${(
                            appState.availableCash || 0
                        ).toLocaleString()}</td>
                    </tr>
                </table>
            </div>

             <div class="print-section">
                <h3 style="font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ccc;">2. The Goal (Vision)</h3>
                <p style="margin-bottom: 5px;"><strong>Goal:</strong> ${
                    appState.shortTermGoal.title || 'Not set'
                }</p>
                <p style="margin-bottom: 5px;"><strong>Target:</strong> $${(
                    appState.shortTermGoal.amount || 0
                ).toLocaleString()}</p>
                <p><strong>By:</strong> ${
                    appState.shortTermGoal.targetDate || 'No date set'
                }</p>

                <div style="margin-top: 15px;">
                    <p style="font-size: 12px; font-weight: bold; color: #666;">IDENTIFIED CASH LEAKS: $${
                        appState.totalLeaks || 0
                    }</p>
                    <ul style="font-size: 12px; margin-left: 15px;">
                        ${
                            appState.cashLeaks
                                .filter((l) => l.category)
                                .map(
                                    (l) =>
                                        `<li>${l.category}: $${l.amount}</li>`
                                )
                                .join('') || '<li>No leaks recorded</li>'
                        }
                    </ul>
                </div>
            </div>
        </div>

        <div class="print-section">
            <h3 style="font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ccc;">3. The Spending Plan</h3>
            <p style="font-size: 14px; color: #666; margin-bottom: 10px;">Allocating your <strong>$${(
                appState.availableCash || 0
            ).toLocaleString()}</strong> of available cash.</p>
            
            <table class="print-table" style="font-size: 14px;">
                <thead>
                    <tr>
                        <th style="padding: 8px;">Category</th>
                        <th style="padding: 8px; text-align: right;">Allocation</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 8px; color: #530D6C; font-weight: bold;">Wealth (Future You)</td>
                        <td style="padding: 8px; text-align: right; font-weight: bold;">$${(
                            appState.spendingPlan.wealth || 0
                        ).toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; color: #2B7FFF; font-weight: bold;">Needs (Essentials)</td>
                        <td style="padding: 8px; text-align: right; font-weight: bold;">$${needsAmount.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; font-weight: bold;">Wants (Total)</td>
                        <td style="padding: 8px; text-align: right;">$${totalWants.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 8px 4px 20px; font-size: 12px;">↳ Debt Acceleration</td>
                        <td style="padding: 4px 8px; text-align: right; font-size: 12px;">$${appState.spendingPlan.debtAcceleration.toLocaleString()}</td>
                    </tr>
                    ${appState.spendingPlan.guiltFreeBuckets
                        .filter((b) => b.name)
                        .map(
                            (b) => `
                    <tr>
                        <td style="padding: 4px 8px 4px 20px; font-size: 12px;">↳ Bucket: ${
                            b.name
                        }</td>
                        <td style="padding: 4px 8px; text-align: right; font-size: 12px;">$${(
                            b.amount || 0
                        ).toLocaleString()}</td>
                    </tr>
                    `
                        )
                        .join('')}
                </tbody>
            </table>
        </div>

        <div class="print-section">
            <h3 style="font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ccc;">4. Automation Commitments</h3>
            <ul style="list-style: none;">
                <li style="margin-bottom: 8px;">
                    <span style="font-size: 18px;">${
                        appState.automation.debtTransfer ? '☑' : '☐'
                    }</span> 
                    <strong>Debt Transfer:</strong> Auto-transfer $${appState.spendingPlan.debtAcceleration.toLocaleString()} day after payday.
                </li>
                <li style="margin-bottom: 8px;">
                    <span style="font-size: 18px;">${
                        appState.automation.wealthTransfer ? '☑' : '☐'
                    }</span> 
                    <strong>Wealth Transfer:</strong> Auto-transfer $${(
                        appState.spendingPlan.wealth || 0
                    ).toLocaleString()} day after payday.
                </li>
                <li style="margin-bottom: 8px;">
                    <span style="font-size: 18px;">${
                        appState.automation.shortTermTransfer ? '☑' : '☐'
                    }</span> 
                    <strong>Short-Term Goal Transfer:</strong> Auto-transfer $${appState.totalLeaks.toLocaleString()} monthly.
                </li>
            </ul>
        </div>

        <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
            <p>The Six Figure Spending Plan Workshop</p>
            <p>www.reframedfinancialcoaching.com</p>
        </div>
    `;

    // 4. Inject into DOM (hidden div)
    let printContainer = document.getElementById('print-area');
    if (!printContainer) {
        printContainer = document.createElement('div');
        printContainer.id = 'print-area';
        document.body.appendChild(printContainer);
    }

    printContainer.innerHTML = printHTML;

    // 5. Trigger Print
    window.print();
}

// Navigation Tab Handlers
function navigate(tabName) {
    // 1. Update Buttons
    document.querySelectorAll('.tab-button').forEach((btn) => {
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

// --- INITIALIZATION ---
// Add Click Listeners to Buttons
document.querySelectorAll('.tab-button').forEach((button) => {
    button.addEventListener('click', (e) => {
        navigate(e.target.dataset.tab);
    });
});

// Start App
loadFromLocalStorage();
navigate('mindset');
