import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { CONFIG } from '../config';

// Predefined test mnemonics for development
const TEST_MNEMONICS = [
  "test test test test test test test test test test test junk",
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
  "zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo vote",
  "legal winner thank year wave sausage worth useful legal winner thank yellow",
  "letter advice cage absurd amount doctor acoustic avoid letter advice cage above"
];

// Get or generate a test mnemonic
let storedMnemonic = localStorage.getItem('sui-test-mnemonic');

if (!storedMnemonic) {
  // Use a random test mnemonic
  const randomIndex = Math.floor(Math.random() * TEST_MNEMONICS.length);
  storedMnemonic = TEST_MNEMONICS[randomIndex];
  localStorage.setItem('sui-test-mnemonic', storedMnemonic);
  console.log('Using test mnemonic:', storedMnemonic);
}

// Use configuration or fallback to stored mnemonic
const MNEMONICS = CONFIG.MNEMONICS !== "YOUR_MNEMONIC_PHRASE_HERE" 
  ? CONFIG.MNEMONICS 
  : storedMnemonic;

const PACKAGE_ID = CONFIG.PACKAGE_ID;
const MODULE_NAME = CONFIG.MODULE_NAME;

export const execStuff = () => {
    const keypair = Ed25519Keypair.deriveKeypair(MNEMONICS);
    const client = new SuiClient({ url: getFullnodeUrl(CONFIG.NETWORK) });
    return { keypair, client };
};

// Get the test account address for getting faucet tokens
export const getTestAccountAddress = () => {
    const { keypair } = execStuff();
    return keypair.getPublicKey().toSuiAddress();
};

// Generate a new test mnemonic
export const generateNewTestMnemonic = () => {
    const randomIndex = Math.floor(Math.random() * TEST_MNEMONICS.length);
    const newMnemonic = TEST_MNEMONICS[randomIndex];
    localStorage.setItem('sui-test-mnemonic', newMnemonic);
    console.log('Generated new test mnemonic:', newMnemonic);
    return newMnemonic;
};

// Get current test mnemonic
export const getCurrentTestMnemonic = () => {
    return localStorage.getItem('sui-test-mnemonic') || TEST_MNEMONICS[0];
};

// Create a signer object that can be used with SuiService
export const createTestSigner = () => {
    const { keypair, client } = execStuff();
    const address = keypair.getPublicKey().toSuiAddress();
    
    return {
        signAndExecuteTransactionBlock: async ({ transactionBlock }: { transactionBlock: TransactionBlock }) => {
            try {
                console.log('Creating transaction with address:', address);
                
                // Check if account has any SUI tokens
                const balance = await client.getBalance({
                    owner: address,
                    coinType: '0x2::sui::SUI'
                });
                
                console.log('Account balance:', balance.totalBalance);
                
                if (parseInt(balance.totalBalance) === 0) {
                    throw new Error(`Test account ${address} has no SUI tokens. Please get test tokens from: https://faucet.sui.io/?address=${address}`);
                }
                
                // Build the transaction
                const builtTx = await transactionBlock.build({ client });
                console.log('Transaction built successfully');
                
                // Sign the transaction
                const signature = await keypair.signTransactionBlock(builtTx);
                console.log('Transaction signed successfully');
                
                // Execute the transaction
                const result = await client.executeTransactionBlock({
                    transactionBlock: builtTx,
                    signature: signature.signature,
                    options: {
                        showEffects: true,
                        showObjectChanges: true,
                    }
                });
                
                console.log('Transaction executed successfully:', result);
                return result;
            } catch (error) {
                console.error('Transaction failed:', error);
                if (error instanceof Error) {
                    throw new Error(`Transaction failed: ${error.message}`);
                }
                throw error;
            }
        },
        address,
        client
    };
};

// Helper function to create quiz using keypair
export const createQuizWithKeypair = async () => {
    const signer = createTestSigner();
    const tx = new TransactionBlock();
    
    tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::create_quiz`,
        arguments: [],
    });
    
    return await signer.signAndExecuteTransactionBlock({ transactionBlock: tx });
};

// Helper function to add question using keypair
export const addQuestionWithKeypair = async (quizId: string, questionId: number, questionText: string, correctAnswer: number) => {
    const signer = createTestSigner();
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
};

// Helper function to submit answer using keypair
export const submitAnswerWithKeypair = async (quizId: string, questionId: number, userAnswer: number) => {
    const signer = createTestSigner();
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
};

export default execStuff;