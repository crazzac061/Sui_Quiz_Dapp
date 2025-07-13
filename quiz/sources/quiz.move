module quiz::quiz {
    use sui::vec_map::{Self, VecMap};

    // Quiz struct to store quiz data
    public struct Quiz has key, store {
        id: UID,
        questions: VecMap<u64, vector<u8>>, // question id -> question text
        answers: VecMap<u64, u64>, // question id -> correct answer index
        creator: address,
    }

    // User score struct
    public struct Score has key, store {
        id: UID,
        quiz_id: ID, // Changed from UID to ID
        user: address,
        correct_answers: u64,
    }

    // Initialize a new quiz
    public entry fun create_quiz(ctx: &mut TxContext) {
        let quiz = Quiz {
            id: object::new(ctx),
            questions: vec_map::empty(),
            answers: vec_map::empty(),
            creator: tx_context::sender(ctx),
        };
        transfer::share_object(quiz);
    }

    // Add a question to the quiz
    public entry fun add_question(
        quiz: &mut Quiz,
        question_id: u64,
        question_text: vector<u8>,
        correct_answer: u64,
        ctx: &mut TxContext
    ) {
        assert!(quiz.creator == tx_context::sender(ctx), 0); // Only creator can add questions
        vec_map::insert(&mut quiz.questions, question_id, question_text);
        vec_map::insert(&mut quiz.answers, question_id, correct_answer);
    }

    // Submit an answer and track score
    public entry fun submit_answer(
        quiz: &Quiz,
        question_id: u64,
        user_answer: u64,
        ctx: &mut TxContext
    ) {
        let correct_answer = vec_map::get(&quiz.answers, &question_id);
        let is_correct = correct_answer == &user_answer;
        let score = Score {
            id: object::new(ctx),
            quiz_id: object::uid_to_inner(&quiz.id), // Convert UID to ID
            user: tx_context::sender(ctx),
            correct_answers: if (is_correct) { 1 } else { 0 },
        };
        transfer::transfer(score, tx_context::sender(ctx));
    }

    // Get quiz question text
    public fun get_question(quiz: &Quiz, question_id: u64): vector<u8> {
        *vec_map::get(&quiz.questions, &question_id)
    }
}