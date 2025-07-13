import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';

const PACKAGE_ID = '0xe47c5f52a9ee6d5f68600b7adee98ad41abd5818cc16223063e72778868fce8c';
const MODULE_NAME = 'quiz';

export class SuiService {
  client: SuiClient;

  constructor() {
    this.client = new SuiClient({ url: getFullnodeUrl('testnet') });
  }

  async createQuiz(signer: any) {
    console.log('SuiService: Creating quiz with signer:', signer.address);
    
    const tx = new TransactionBlock();
    tx.setSender(signer.address);
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::create_quiz`,
      arguments: [],
    });
    
    console.log('SuiService: Transaction created, calling signAndExecuteTransactionBlock');
    const result = await signer.signAndExecuteTransactionBlock({ transactionBlock: tx });
    console.log('SuiService: Transaction completed:', result);
    
    return result;
  }

  async addQuestion(signer: any, quizId: string, questionId: number, questionText: string, correctAnswer: number) {
    const tx = new TransactionBlock();
    tx.setSender(signer.address);
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
    tx.setSender(signer.address);
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

  async verifyContract() {
    try {
      console.log('Verifying contract exists:', PACKAGE_ID);
      const packageInfo = await this.client.getObject({
        id: PACKAGE_ID,
        options: { showContent: true }
      });
      console.log('Contract package info:', packageInfo);
      return true;
    } catch (error) {
      console.error('Contract verification failed:', error);
      return false;
    }
  }

  async getQuizDetails(quizId: string) {
    try {
      console.log('Getting quiz details for:', quizId);
      const quizObject = await this.client.getObject({
        id: quizId,
        options: { showContent: true }
      });
      console.log('Quiz object details:', quizObject);
      return quizObject;
    } catch (error) {
      console.error('Failed to get quiz details:', error);
      throw error;
    }
  }
} 