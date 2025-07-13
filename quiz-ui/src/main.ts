import './styles/main.css';
import { SuiService } from './services/SuiService';

const suiService = new SuiService();

// UI Elements
const app = document.getElementById('app') || document.body;

app.innerHTML = `
  <h1>Sui Quiz Dapp</h1>
  <button id="connect-wallet">Connect Wallet</button>
  <div id="wallet-status">Not connected</div>
  <hr/>
  <h2>Create Quiz</h2>
  <button id="create-quiz">Create Quiz</button>
  <div id="quiz-id"></div>
  <h2>Add Question</h2>
  <form id="add-question-form">
    <input type="text" id="question-id" placeholder="Question ID (number)" required />
    <input type="text" id="question-text" placeholder="Question Text" required />
    <input type="number" id="correct-answer" placeholder="Correct Answer Index" required />
    <button type="submit">Add Question</button>
  </form>
  <div id="add-question-status"></div>
`;

// Wallet state
let wallet: any = null;
let quizId: string | null = null;

// Wallet connect (Suiet Wallet example)
document.getElementById('connect-wallet')?.addEventListener('click', async () => {
  // This is a placeholder for Suiet Wallet integration
  // In a real app, use the Suiet Wallet SDK or Sui Wallet Adapter
  // For demo, just simulate a connected wallet
  wallet = {
    // Replace with real wallet signer object
    signAndExecuteTransactionBlock: async ({ transactionBlock }: any) => {
      alert('This is a placeholder. Integrate with a real wallet for signing.');
      return { digest: 'demo-tx-digest' };
    },
    address: '0xDEMOADDRESS',
  };
  document.getElementById('wallet-status')!.textContent = `Connected: ${wallet.address}`;
});

document.getElementById('create-quiz')?.addEventListener('click', async () => {
  if (!wallet) {
    alert('Please connect your wallet first!');
    return;
  }
  try {
    const result = await suiService.createQuiz(wallet);
    quizId = result.digest || 'demo-quiz-id';
    document.getElementById('quiz-id')!.textContent = `Quiz Created! Quiz ID: ${quizId}`;
  } catch (e) {
    alert('Failed to create quiz.');
  }
});

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
  const correctAnswer = Number((document.getElementById('correct-answer') as HTMLInputElement).value);
  try {
    await suiService.addQuestion(wallet, quizId, questionId, questionText, correctAnswer);
    document.getElementById('add-question-status')!.textContent = 'Question added!';
  } catch (e) {
    document.getElementById('add-question-status')!.textContent = 'Failed to add question.';
  }
}); 