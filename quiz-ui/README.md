# 🎯 Sui Quiz Dapp

A decentralized quiz application built on the Sui blockchain using TypeScript and Sui.js.

## 🚀 Features

- **Create Quizzes**: Deploy new quizzes on the Sui blockchain
- **Add Questions**: Add multiple-choice questions to your quizzes
- **Take Quizzes**: Answer questions and submit responses
- **Wallet Integration**: Connect with Slush Sui Wallet
- **Test Mode**: Use keypair-based testing with execStuff utility

## 📋 Prerequisites

- Node.js (v16 or higher)
- Slush Sui Wallet browser extension
- Sui testnet account with some test SUI tokens

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Slush Sui Wallet:**
   - Visit the Chrome Web Store
   - Search for "Slush Sui Wallet"
   - Install the extension
   - Create a wallet and get some testnet SUI

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   - Navigate to `http://localhost:8080`
   - Connect your Slush Sui Wallet

## 🎮 How to Use

### 1. Wallet Connection
- Click "Connect Slush Wallet" to connect your wallet
- Make sure you're on Sui testnet
- Ensure you have some test SUI tokens

### 2. Create Quiz
- Go to the "Create Quiz" tab
- Click "Create Quiz" to deploy a new quiz contract
- Note the Quiz ID that appears

### 3. Add Questions
- After creating a quiz, the question form will appear
- Fill in:
  - **Question ID**: Sequential number (1, 2, 3...)
  - **Question Text**: Your question
  - **Options**: Comma-separated answer choices
  - **Correct Answer Index**: 0-3 (corresponding to the option position)
- Click "Add Question" to submit

### 4. Take Quiz
- Go to the "Take Quiz" tab
- Enter a Quiz ID
- Click "Load Quiz" to view questions
- Select your answers and submit

### 5. Test Mode
- Use the "Test Mode" tab for development testing
- This mode uses a keypair instead of wallet extension
- Useful for testing without wallet connection

## 🔧 Understanding execStuff

The `execStuff.ts` file provides utilities for blockchain interaction without wallet extensions:

### What is execStuff?
- Creates a keypair from mnemonics (for testing)
- Provides a Sui client connection
- Enables transaction signing without wallet UI

### When to use execStuff:
1. **Development Testing**: Test your contract functions quickly
2. **Backend Operations**: Server-side transaction signing
3. **Automated Testing**: CI/CD pipeline testing
4. **Demo Purposes**: Show functionality without wallet setup

### Key Functions:

```typescript
// Basic setup
const { keypair, client } = execStuff();

// Create a test signer
const testSigner = createTestSigner();

// Direct quiz operations
await createQuizWithKeypair();
await addQuestionWithKeypair(quizId, questionId, questionText, correctAnswer);
await submitAnswerWithKeypair(quizId, questionId, userAnswer);
```

### Configuration:
- Set `MNEMONICS` environment variable for your test account
- Default uses a test mnemonic: `"test test test test test test test test test test test junk"`

## 🏗️ Project Structure

```
quiz-ui/
├── src/
│   ├── main.ts              # Main application entry point
│   ├── services/
│   │   └── SuiService.ts    # Blockchain interaction service
│   ├── utils/
│   │   └── execStuff.ts     # Keypair utilities for testing
│   ├── styles/
│   │   └── main.css         # Application styles
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
└── package.json
```

## 🔗 Smart Contract

The Dapp interacts with a Sui Move smart contract:
- **Package ID**: `0xe47c5f52a9ee6d5f68600b7adee98ad41abd5818cc16223063e72778868fce8c`
- **Module**: `quiz`
- **Functions**:
  - `create_quiz()`: Create a new quiz
  - `add_question()`: Add a question to a quiz
  - `submit_answer()`: Submit an answer to a question

## 🐛 Troubleshooting

### Wallet Connection Issues:
1. Make sure Slush Sui Wallet is installed
2. Check that you're on testnet
3. Try refreshing the page
4. Check browser console for errors

### Transaction Failures:
1. Ensure you have enough test SUI tokens
2. Check that the contract address is correct
3. Verify you're connected to testnet
4. Check transaction logs in Sui Explorer

### Test Mode Issues:
1. Verify your mnemonics are correct
2. Check that the test account has tokens
3. Ensure network connectivity

## 🚀 Deployment

To deploy to production:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to your hosting service:**
   - Upload the `dist/` folder
   - Configure for HTTPS
   - Update contract addresses for mainnet

3. **Update configuration:**
   - Change network from testnet to mainnet
   - Update package IDs to production contracts
   - Set up proper environment variables

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions or issues:
- Check the troubleshooting section
- Review Sui documentation
- Open an issue on GitHub 