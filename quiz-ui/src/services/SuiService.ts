import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';

const PACKAGE_ID = '<YOUR_PACKAGE_ID>'; // Replace with your deployed package ID
const MODULE_NAME = 'quiz';

export class SuiService {
  client: SuiClient;

  constructor() {
    this.client = new SuiClient({ url: getFullnodeUrl('testnet') });
  }

  async createQuiz(signer: any) {
    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::create_quiz`,
      arguments: [],
    });
    // You need to sign and execute the transaction with the user's wallet
    // This is a placeholder; actual signing depends on your wallet integration
    return await signer.signAndExecuteTransactionBlock({ transactionBlock: tx });
  }

  async addQuestion(signer: any, quizId: string, questionId: number, questionText: string, correctAnswer: number) {
    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::add_question`,
      arguments: [
        tx.object(quizId),
        tx.pure(questionId),
        tx.pure(questionText),
        tx.pure(correctAnswer)
      ],
    });
    return await signer.signAndExecuteTransactionBlock({ transactionBlock: tx });
  }

  async submitAnswer(signer: any, quizId: string, questionId: number, userAnswer: number) {
    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::submit_answer`,
      arguments: [
        tx.object(quizId),
        tx.pure(questionId),
        tx.pure(userAnswer)
      ],
    });
    return await signer.signAndExecuteTransactionBlock({ transactionBlock: tx });
  }

  async getQuestion(quizId: string, questionId: number) {
    // For view functions, you may need to use a custom RPC or event query
    // This is a placeholder
    return null;
  }
} 