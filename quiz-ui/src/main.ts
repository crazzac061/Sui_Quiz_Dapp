import './styles/main.css';
import { SuiService } from './services/SuiService';
import { createTestSigner, createQuizWithKeypair, addQuestionWithKeypair, getTestAccountAddress, generateNewTestMnemonic, getCurrentTestMnemonic } from './utils/execStuff';
import { CONFIG } from './config';

const suiService = new SuiService();

// UI Elements
const app = document.getElementById('app') || document.body;

app.innerHTML = `
  <div class="container">
    <header>
      <h1>🎯 Sui Quiz Dapp</h1>
      <p>Create and take quizzes on the Sui blockchain</p>
    </header>

    <div class="wallet-section">
      <h2>🔗 Wallet Connection</h2>
      <button id="connect-wallet" class="btn btn-primary">Connect Slush Wallet</button>
      <div id="wallet-status" class="status">Not connected</div>
    </div>

    <div class="tabs">
      <button class="tab-btn active" data-tab="create">Create Quiz</button>
      <button class="tab-btn" data-tab="take">Take Quiz</button>
      <button class="tab-btn" data-tab="test">Test Mode</button>
    </div>

    <div id="create-tab" class="tab-content active">
      <h2>📝 Create New Quiz</h2>
      <button id="create-quiz" class="btn btn-success">Create Quiz</button>
      <div id="quiz-id" class="status"></div>
      
      <div id="question-form" style="display: none;">
        <h3>Add Questions</h3>
        <form id="add-question-form">
          <div class="form-group">
            <label>Question ID:</label>
            <input type="number" id="question-id" placeholder="1" required />
          </div>
          <div class="form-group">
            <label>Question Text:</label>
            <input type="text" id="question-text" placeholder="What is 2 + 2?" required />
          </div>
          <div class="form-group">
            <label>Options (comma separated):</label>
            <input type="text" id="question-options" placeholder="3, 4, 5, 6" required />
          </div>
          <div class="form-group">
            <label>Correct Answer Index (0-3):</label>
            <input type="number" id="correct-answer" placeholder="1" min="0" max="3" required />
          </div>
          <button type="submit" class="btn btn-primary">Add Question</button>
        </form>
        <div id="add-question-status" class="status"></div>
      </div>
    </div>

    <div id="take-tab" class="tab-content">
      <h2>🎮 Take Quiz</h2>
      <div class="form-group">
        <label>Quiz ID:</label>
        <input type="text" id="take-quiz-id" placeholder="Enter quiz ID" />
      </div>
      <button id="load-quiz" class="btn btn-primary">Load Quiz</button>
      <div id="quiz-display"></div>
    </div>

    <div id="test-tab" class="tab-content">
      <h2>🧪 Test Mode (Using execStuff)</h2>
      <p>This mode uses a keypair instead of wallet for testing</p>
      <div class="test-info">
        <p><strong>Test Account Address:</strong> <span id="test-address"></span></p>
        <p><strong>Network:</strong> <span id="test-network"></span></p>
        <p><strong>Status:</strong> <span id="test-status-info"></span></p>
        <p><strong>Current Mnemonic:</strong> <span id="test-mnemonic"></span></p>
        <button id="generate-new-mnemonic" class="btn btn-secondary">Generate New Mnemonic</button>
        <a id="test-faucet-link" href="#" target="_blank" class="btn btn-primary">Get Test Tokens</a>
      </div>
      
      <h3>Use Existing Quiz Object</h3>
      <div class="form-group">
        <label>Quiz Object ID:</label>
        <input type="text" id="existing-quiz-id" placeholder="0x3c90d1fcca996bb1aecae085925270d6eb7a33bdeaf8b4d425be03295fb7e292" value="0x3c90d1fcca996bb1aecae085925270d6eb7a33bdeaf8b4d425be03295fb7e292" />
      </div>
      <button id="use-existing-quiz" class="btn btn-success">Use Existing Quiz</button>
      <button id="view-quiz-details" class="btn btn-info">View Quiz Details</button>
      <button id="add-question-to-existing" class="btn btn-warning">Add Question to Existing Quiz</button>
      
      <h3>Create New Quiz</h3>
      <button id="test-create-quiz" class="btn btn-warning">Test Create Quiz</button>
      <button id="test-add-question" class="btn btn-warning">Test Add Question</button>
      <button id="verify-contract" class="btn btn-info">Verify Contract</button>
      <div id="test-quiz-id" class="status"></div>
      <div id="test-status" class="status"></div>
    </div>
  </div>
`;

// State management
let wallet: any = null;
let quizId: string | null = null;
let currentTab = 'create';

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).dataset.tab;
    if (target) {
      // Update active tab
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      (e.target as HTMLElement).classList.add('active');
      document.getElementById(`${target}-tab`)?.classList.add('active');
      currentTab = target;
    }
  });
});

// Wallet connection
document.getElementById('connect-wallet')?.addEventListener('click', async () => {
  const walletApi = (window as any).slushWallet;
  if (walletApi) {
    try {
      const accounts = await walletApi.requestAccounts();
      const address = accounts[0];
      wallet = {
        signAndExecuteTransactionBlock: walletApi.signAndExecuteTransactionBlock.bind(walletApi),
        address,
      };
      document.getElementById('wallet-status')!.textContent = `✅ Connected: ${address.slice(0, 6)}...${address.slice(-4)}`;
      document.getElementById('wallet-status')!.className = 'status success';
    } catch (e) {
      document.getElementById('wallet-status')!.textContent = '❌ Wallet connection failed';
      document.getElementById('wallet-status')!.className = 'status error';
    }
  } else {
    alert('Please install Slush Sui Wallet extension!');
    window.open('https://chrome.google.com/webstore/search/slush%20sui%20wallet', '_blank');
  }
});

// Add faucet link for wallet section
// (Removed as per user request)

// Create quiz
document.getElementById('create-quiz')?.addEventListener('click', async () => {
  if (!wallet) {
    alert('Please connect your wallet first!');
    return;
  }
  try {
    const createBtn = document.getElementById('create-quiz')!;
    createBtn.textContent = 'Creating...';
    createBtn.classList.add('loading');
    
    const result = await suiService.createQuiz(wallet);
    quizId = result.digest || 'demo-quiz-id';
    document.getElementById('quiz-id')!.textContent = `✅ Quiz Created! ID: ${quizId}`;
    document.getElementById('quiz-id')!.className = 'status success';
    document.getElementById('question-form')!.style.display = 'block';
    
    // Scroll to question form on mobile
    if (window.innerWidth <= 768) {
      document.getElementById('question-form')!.scrollIntoView({ behavior: 'smooth' });
    }
  } catch (e) {
    document.getElementById('quiz-id')!.textContent = '❌ Failed to create quiz';
    document.getElementById('quiz-id')!.className = 'status error';
  } finally {
    const createBtn = document.getElementById('create-quiz')!;
    createBtn.textContent = 'Create Quiz';
    createBtn.classList.remove('loading');
  }
});

// Add question
document.getElementById('add-question-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!wallet) {
    alert('Please connect your wallet first!');
    return;
  }
  if (!quizId) {
    alert('Please create a quiz first!');
    return;
  }
  
  const questionId = Number((document.getElementById('question-id') as HTMLInputElement).value);
  const questionText = (document.getElementById('question-text') as HTMLInputElement).value;
  const options = (document.getElementById('question-options') as HTMLInputElement).value;
  const correctAnswer = Number((document.getElementById('correct-answer') as HTMLInputElement).value);
  
  try {
    document.getElementById('add-question-status')!.textContent = 'Adding question...';
    await suiService.addQuestion(wallet, quizId, questionId, questionText, correctAnswer);
    document.getElementById('add-question-status')!.textContent = '✅ Question added successfully!';
    document.getElementById('add-question-status')!.className = 'status success';
    (e.target as HTMLFormElement).reset();
  } catch (e) {
    document.getElementById('add-question-status')!.textContent = '❌ Failed to add question';
    document.getElementById('add-question-status')!.className = 'status error';
  }
});

// Load quiz for taking
document.getElementById('load-quiz')?.addEventListener('click', async () => {
  const quizId = (document.getElementById('take-quiz-id') as HTMLInputElement).value;
  if (!quizId) {
    alert('Please enter a quiz ID');
    return;
  }
  
  // For now, show a demo quiz since we need to implement quiz fetching
  document.getElementById('quiz-display')!.innerHTML = `
    <div class="quiz-demo">
      <h3>Demo Quiz</h3>
      <div class="question">
        <p><strong>Question 1:</strong> What is 2 + 2?</p>
        <div class="options">
          <button class="option-btn" data-answer="0">3</button>
          <button class="option-btn" data-answer="1">4</button>
          <button class="option-btn" data-answer="2">5</button>
          <button class="option-btn" data-answer="3">6</button>
        </div>
      </div>
    </div>
  `;
});

// Test mode using execStuff
let testQuizId: string | null = null;
let existingQuizId: string | null = null;

// Handle window resize for responsive behavior
window.addEventListener('resize', () => {
  // Recalculate any responsive elements if needed
  const isMobile = window.innerWidth <= 768;
  document.body.classList.toggle('mobile', isMobile);
});

// Display test account address and add faucet links
document.addEventListener('DOMContentLoaded', () => {
  const testAddress = getTestAccountAddress();
  const currentMnemonic = getCurrentTestMnemonic();
  
  document.getElementById('test-address')!.textContent = testAddress;
  document.getElementById('test-network')!.textContent = CONFIG.NETWORK;
  document.getElementById('test-mnemonic')!.textContent = currentMnemonic;
  
  // Update faucet link with current test address
  const testFaucetLink = document.getElementById('test-faucet-link') as HTMLAnchorElement;
  if (testFaucetLink) {
    testFaucetLink.href = `https://faucet.sui.io/?address=${testAddress}`;
  }
  
  // Check if using custom config or default
  if (CONFIG.MNEMONICS !== "YOUR_MNEMONIC_PHRASE_HERE") {
    document.getElementById('test-status-info')!.textContent = "✅ Using your configured address";
    document.getElementById('test-status-info')!.className = "success";
  } else {
    document.getElementById('test-status-info')!.textContent = "⚠️ Using test address (get tokens from faucet)";
    document.getElementById('test-status-info')!.className = "warning";
  }
  
  // Add faucet link for wallet section
  const walletSection = document.querySelector('.wallet-section');
  if (walletSection) {
    const faucetLink = document.createElement('a');
    faucetLink.href = `https://faucet.sui.io/?address=${testAddress}`;
    faucetLink.target = '_blank';
    faucetLink.className = 'btn btn-primary';
    faucetLink.textContent = 'Get Test Tokens';
    faucetLink.style.marginTop = '10px';
    faucetLink.style.display = 'inline-block';
    
    walletSection.appendChild(faucetLink);
  }
});

document.getElementById('test-create-quiz')?.addEventListener('click', async () => {
  try {
    document.getElementById('test-status')!.textContent = 'Testing with keypair...';
    
    // Use the improved test signer
    const testSigner = createTestSigner();
    console.log('Test signer created with address:', testSigner.address);
    
    const result = await suiService.createQuiz(testSigner);
    testQuizId = result.digest || 'test-quiz-id';
    document.getElementById('test-quiz-id')!.textContent = `Test Quiz ID: ${testQuizId}`;
    document.getElementById('test-status')!.textContent = `✅ Test quiz created! Address: ${testSigner.address.slice(0, 6)}...`;
    document.getElementById('test-status')!.className = 'status success';
  } catch (e) {
    console.error('Test create quiz error:', e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    document.getElementById('test-status')!.textContent = '❌ Test failed: ' + errorMessage;
    document.getElementById('test-status')!.className = 'status error';
  }
});

document.getElementById('test-add-question')?.addEventListener('click', async () => {
  if (!testQuizId) {
    alert('Please create a test quiz first!');
    return;
  }
  
  try {
    document.getElementById('test-status')!.textContent = 'Adding test question...';
    
    const testSigner = createTestSigner();
    await suiService.addQuestion(testSigner, testQuizId, 1, "What is 2 + 2?", 1);
    
    document.getElementById('test-status')!.textContent = '✅ Test question added successfully!';
    document.getElementById('test-status')!.className = 'status success';
  } catch (e) {
    document.getElementById('test-status')!.textContent = '❌ Test question failed: ' + e;
    document.getElementById('test-status')!.className = 'status error';
  }
});

// Generate new mnemonic
document.getElementById('generate-new-mnemonic')?.addEventListener('click', () => {
  const newMnemonic = generateNewTestMnemonic();
  const newAddress = getTestAccountAddress();
  
  document.getElementById('test-mnemonic')!.textContent = newMnemonic;
  document.getElementById('test-address')!.textContent = newAddress;
  document.getElementById('test-status')!.textContent = '🔄 Generated new test mnemonic and address';
  document.getElementById('test-status')!.className = 'status success';
  
  // Update faucet links with new address
  const testFaucetLink = document.getElementById('test-faucet-link') as HTMLAnchorElement;
  if (testFaucetLink) {
    testFaucetLink.href = `https://faucet.sui.io/?address=${newAddress}`;
  }
  
  // Update wallet section faucet link if it exists
  const walletFaucetLink = document.querySelector('.wallet-section a[href*="faucet.sui.io"]') as HTMLAnchorElement;
  if (walletFaucetLink) {
    walletFaucetLink.href = `https://faucet.sui.io/?address=${newAddress}`;
  }
  
  // Reset quiz ID since we have a new address
  testQuizId = null;
  document.getElementById('test-quiz-id')!.textContent = '';
});

// Use existing quiz
document.getElementById('use-existing-quiz')?.addEventListener('click', () => {
  const quizId = (document.getElementById('existing-quiz-id') as HTMLInputElement).value;
  if (!quizId) {
    alert('Please enter a quiz object ID');
    return;
  }
  
  existingQuizId = quizId;
  document.getElementById('test-status')!.textContent = `✅ Using existing quiz: ${quizId.slice(0, 10)}...`;
  document.getElementById('test-status')!.className = 'status success';
});

// View quiz details
document.getElementById('view-quiz-details')?.addEventListener('click', async () => {
  const quizId = (document.getElementById('existing-quiz-id') as HTMLInputElement).value;
  if (!quizId) {
    alert('Please enter a quiz object ID');
    return;
  }
  
  try {
    document.getElementById('test-status')!.textContent = 'Loading quiz details...';
    const quizDetails = await suiService.getQuizDetails(quizId);
    
    document.getElementById('test-status')!.textContent = '✅ Quiz details loaded! Check console for details.';
    document.getElementById('test-status')!.className = 'status success';
    
    // Set as current quiz
    existingQuizId = quizId;
  } catch (e) {
    console.error('View quiz details error:', e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    document.getElementById('test-status')!.textContent = '❌ Failed to load quiz details: ' + errorMessage;
    document.getElementById('test-status')!.className = 'status error';
  }
});

// Add question to existing quiz
document.getElementById('add-question-to-existing')?.addEventListener('click', async () => {
  if (!existingQuizId) {
    alert('Please use an existing quiz first!');
    return;
  }
  
  try {
    document.getElementById('test-status')!.textContent = 'Adding question to existing quiz...';
    
    const testSigner = createTestSigner();
    await suiService.addQuestion(testSigner, existingQuizId, 1, "What is 2 + 2?", 1);
    
    document.getElementById('test-status')!.textContent = '✅ Question added to existing quiz successfully!';
    document.getElementById('test-status')!.className = 'status success';
  } catch (e) {
    console.error('Add question to existing quiz error:', e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    document.getElementById('test-status')!.textContent = '❌ Failed to add question to existing quiz: ' + errorMessage;
    document.getElementById('test-status')!.className = 'status error';
  }
});

// Verify contract
document.getElementById('verify-contract')?.addEventListener('click', async () => {
  try {
    document.getElementById('test-status')!.textContent = 'Verifying contract...';
    const isValid = await suiService.verifyContract();
    
    if (isValid) {
      document.getElementById('test-status')!.textContent = '✅ Contract verified successfully!';
      document.getElementById('test-status')!.className = 'status success';
    } else {
      document.getElementById('test-status')!.textContent = '❌ Contract verification failed - check package ID';
      document.getElementById('test-status')!.className = 'status error';
    }
  } catch (e) {
    console.error('Contract verification error:', e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    document.getElementById('test-status')!.textContent = '❌ Contract verification error: ' + errorMessage;
    document.getElementById('test-status')!.className = 'status error';
  }
});
