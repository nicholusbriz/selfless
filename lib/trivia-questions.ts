export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: 'grammar' | 'vocabulary' | 'reading' | 'idioms' | 'common-mistakes';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  explanation?: string;
}

export const triviaQuestions: TriviaQuestion[] = [
  // Grammar - Beginner
  {
    id: 'g1',
    question: 'Choose the correct form:',
    options: [
      'She don\'t like coffee',
      'She doesn\'t likes coffee',
      'She doesn\'t like coffee',
      'She not like coffee'
    ],
    correctAnswer: 2,
    category: 'grammar',
    difficulty: 'beginner',
    explanation: 'Use "doesn\'t" + base verb for third person singular.'
  },
  {
    id: 'g2',
    question: 'Past tense of "go":',
    options: ['go', 'went', 'gone', 'going'],
    correctAnswer: 1,
    category: 'grammar',
    difficulty: 'beginner',
    explanation: '"Went" is the past tense of "go".'
  },
  {
    id: 'g3',
    question: 'They ___ playing football.',
    options: ['is', 'am', 'are', 'be'],
    correctAnswer: 2,
    category: 'grammar',
    difficulty: 'beginner',
    explanation: 'Use "are" with plural subjects like "they".'
  },
  {
    id: 'g4',
    question: 'I saw ___ elephant.',
    options: ['a', 'an', 'the', 'no article'],
    correctAnswer: 1,
    category: 'grammar',
    difficulty: 'beginner',
    explanation: 'Use "an" before vowel sounds.'
  },
  {
    id: 'g5',
    question: 'I\'m good ___ math.',
    options: ['in', 'at', 'on', 'with'],
    correctAnswer: 1,
    category: 'grammar',
    difficulty: 'beginner',
    explanation: 'The phrase is "good at".'
  },

  // Grammar - Intermediate
  {
    id: 'g6',
    question: 'If I ___ rich, I would travel.',
    options: ['am', 'was', 'were', 'be'],
    correctAnswer: 2,
    category: 'grammar',
    difficulty: 'intermediate',
    explanation: 'Use "were" in hypothetical if-clauses, even with "I".'
  },
  {
    id: 'g7',
    question: 'Which is passive voice?',
    options: [
      'The teacher explained the lesson',
      'The lesson was explained by the teacher',
      'The teacher explains the lesson',
      'The lesson explains the teacher'
    ],
    correctAnswer: 1,
    category: 'grammar',
    difficulty: 'intermediate',
    explanation: 'Passive: object + "was" + past participle + "by" + subject.'
  },
  {
    id: 'g8',
    question: 'This is the book ___ I bought.',
    options: ['who', 'which', 'whom', 'what'],
    correctAnswer: 1,
    category: 'grammar',
    difficulty: 'intermediate',
    explanation: '"Which" refers to things, "who" to people.'
  },
  {
    id: 'g9',
    question: 'I have seen him ___ yesterday.',
    options: ['since', 'for', 'ago', 'in'],
    correctAnswer: 0,
    category: 'grammar',
    difficulty: 'intermediate',
    explanation: 'Use "since" with present perfect for a starting point.'
  },
  {
    id: 'g10',
    question: '___ you like coffee?',
    options: ['You like do', 'Do you like', 'Like you do', 'Do like you'],
    correctAnswer: 1,
    category: 'grammar',
    difficulty: 'intermediate',
    explanation: 'Question order: auxiliary + subject + main verb.'
  },

  // Vocabulary - Beginner
  {
    id: 'v1',
    question: 'Synonym for "happy":',
    options: ['sad', 'joyful', 'angry', 'tired'],
    correctAnswer: 1,
    category: 'vocabulary',
    difficulty: 'beginner',
    explanation: '"Joyful" means happy.'
  },
  {
    id: 'v2',
    question: 'Antonym of "big":',
    options: ['large', 'huge', 'small', 'giant'],
    correctAnswer: 2,
    category: 'vocabulary',
    difficulty: 'beginner',
    explanation: '"Small" is the opposite of "big".'
  },
  {
    id: 'v3',
    question: '"Huge" means:',
    options: ['Very small', 'Very large', 'Medium', 'Normal'],
    correctAnswer: 1,
    category: 'vocabulary',
    difficulty: 'beginner',
    explanation: '"Huge" means very large.'
  },
  {
    id: 'v4',
    question: '"Ancient" means:',
    options: ['Modern', 'Very old', 'New', 'Future'],
    correctAnswer: 1,
    category: 'vocabulary',
    difficulty: 'beginner',
    explanation: '"Ancient" means very old.'
  },
  {
    id: 'v5',
    question: '"Brave" means:',
    options: ['Afraid', 'Courageous', 'Lazy', 'Quiet'],
    correctAnswer: 1,
    category: 'vocabulary',
    difficulty: 'beginner',
    explanation: '"Brave" means showing courage.'
  },

  // Vocabulary - Intermediate
  {
    id: 'v6',
    question: '"Meticulous" means:',
    options: ['Careless', 'Very careful', 'Fast', 'Slow'],
    correctAnswer: 1,
    category: 'vocabulary',
    difficulty: 'intermediate',
    explanation: '"Meticulous" means very careful and detail-oriented.'
  },
  {
    id: 'v7',
    question: 'Synonym for "elaborate":',
    options: ['Simple', 'Detailed', 'Brief', 'Short'],
    correctAnswer: 1,
    category: 'vocabulary',
    difficulty: 'intermediate',
    explanation: '"Elaborate" means detailed.'
  },
  {
    id: 'v8',
    question: '"Prudent" means:',
    options: ['Careless', 'Wise', 'Risky', 'Fast'],
    correctAnswer: 1,
    category: 'vocabulary',
    difficulty: 'intermediate',
    explanation: '"Prudent" means wise and careful.'
  },
  {
    id: 'v9',
    question: 'Antonym of "benevolent":',
    options: ['Kind', 'Cruel', 'Generous', 'Helpful'],
    correctAnswer: 1,
    category: 'vocabulary',
    difficulty: 'intermediate',
    explanation: '"Benevolent" means kind. "Cruel" is the opposite.'
  },
  {
    id: 'v10',
    question: '"Persevere" means:',
    options: ['Give up', 'Keep trying', 'Run away', 'Start'],
    correctAnswer: 1,
    category: 'vocabulary',
    difficulty: 'intermediate',
    explanation: '"Persevere" means to continue despite difficulty.'
  },

  // Idioms - Beginner
  {
    id: 'i1',
    question: '"Break a leg" means:',
    options: ['Break your leg', 'Good luck', 'Sit down', 'Be careful'],
    correctAnswer: 1,
    category: 'idioms',
    difficulty: 'beginner',
    explanation: 'It means "good luck" before a performance.'
  },
  {
    id: 'i2',
    question: '"Piece of cake" means:',
    options: ['Dessert', 'Very easy', 'Difficult', 'Food'],
    correctAnswer: 1,
    category: 'idioms',
    difficulty: 'beginner',
    explanation: 'It means something is very easy.'
  },
  {
    id: 'i3',
    question: '"Under the weather" means:',
    options: ['Outside rain', 'Feeling sick', 'Weather report', 'Cold'],
    correctAnswer: 1,
    category: 'idioms',
    difficulty: 'beginner',
    explanation: 'It means feeling sick.'
  },
  {
    id: 'i4',
    question: '"Cost an arm and a leg" means:',
    options: ['Injury', 'Very expensive', 'Free', 'Moderate'],
    correctAnswer: 1,
    category: 'idioms',
    difficulty: 'beginner',
    explanation: 'It means very expensive.'
  },
  {
    id: 'i5',
    question: '"Hit the sack" means:',
    options: ['Hit a bag', 'Go to sleep', 'Get angry', 'Exercise'],
    correctAnswer: 1,
    category: 'idioms',
    difficulty: 'beginner',
    explanation: 'It means go to sleep.'
  },

  // Common Mistakes
  {
    id: 'm1',
    question: 'Correct: "I should ___ gone."',
    options: ['of', 'have', 'off', 'have\'ve'],
    correctAnswer: 1,
    category: 'common-mistakes',
    difficulty: 'beginner',
    explanation: 'Use "have" not "of".'
  },
  {
    id: 'm2',
    question: '___ going to the park.',
    options: ['Their', 'There', 'They\'re', 'Theire'],
    correctAnswer: 2,
    category: 'common-mistakes',
    difficulty: 'beginner',
    explanation: '"They\'re" = "they are".'
  },
  {
    id: 'm3',
    question: 'I need to ___ down.',
    options: ['lay', 'lie', 'laid', 'lied'],
    correctAnswer: 1,
    category: 'common-mistakes',
    difficulty: 'intermediate',
    explanation: 'Use "lie" for resting, "lay" for placing things.'
  },
  {
    id: 'm4',
    question: '___ went to the store.',
    options: ['Me and him', 'Him and me', 'He and I', 'I and him'],
    correctAnswer: 2,
    category: 'common-mistakes',
    difficulty: 'beginner',
    explanation: 'Use subject pronouns: "He and I".'
  },
  {
    id: 'm5',
    question: 'The ___ was immediate.',
    options: ['affect', 'effect', 'affect effected', 'effect affected'],
    correctAnswer: 1,
    category: 'common-mistakes',
    difficulty: 'intermediate',
    explanation: '"Effect" is a noun (result), "affect" is a verb (influence).'
  },

  // Reading Comprehension
  {
    id: 'r1',
    question: 'Library closes at 5 PM weekdays, 8 PM weekends. Today is Saturday. Closes at?',
    options: ['5 PM', '8 PM', 'Closed', '6 PM'],
    correctAnswer: 1,
    category: 'reading',
    difficulty: 'beginner',
    explanation: 'Saturday is a weekend, so 8 PM.'
  },
  {
    id: 'r2',
    question: 'Sarah has 3 apples. Gives 1 to Tom, 2 to Mary. Left?',
    options: ['3', '2', '1', '0'],
    correctAnswer: 3,
    category: 'reading',
    difficulty: 'beginner',
    explanation: '3 - 1 - 2 = 0.'
  },
  {
    id: 'r3',
    question: 'Homework due Friday. John submitted Thursday. On time?',
    options: ['Late', 'Early', 'No', 'Yes'],
    correctAnswer: 1,
    category: 'reading',
    difficulty: 'beginner',
    explanation: 'Thursday is before Friday, so early.'
  },
  {
    id: 'r4',
    question: 'Train every hour. Last at 10 PM. Now 9:30 PM. More trains?',
    options: ['0', '1', '2', '3'],
    correctAnswer: 1,
    category: 'reading',
    difficulty: 'intermediate',
    explanation: 'Only one train left at 10 PM.'
  },
  {
    id: 'r5',
    question: 'If rain, match cancelled. Match not cancelled. Conclusion?',
    options: ['Rained', 'No rain', 'Maybe rained', 'Unknown'],
    correctAnswer: 1,
    category: 'reading',
    difficulty: 'intermediate',
    explanation: 'If not cancelled, then no rain.'
  },

  // Grammar - Advanced
  {
    id: 'g11',
    question: 'He suggested ___ home.',
    options: ['to go', 'going', 'that we go', 'B and C'],
    correctAnswer: 3,
    category: 'grammar',
    difficulty: 'advanced',
    explanation: '"Suggest" takes gerund or subjunctive.'
  },
  {
    id: 'g12',
    question: 'I wish I ___ rich.',
    options: ['was', 'were', 'am', 'be'],
    correctAnswer: 1,
    category: 'grammar',
    difficulty: 'advanced',
    explanation: 'Use "were" in subjunctive mood for wishes.'
  },
  {
    id: 'g13',
    question: 'Students who ___ the answer.',
    options: ['know', 'knows', 'known', 'knowing'],
    correctAnswer: 0,
    category: 'grammar',
    difficulty: 'advanced',
    explanation: '"Who" refers to plural "students", so use "know".'
  },
  {
    id: 'g14',
    question: 'The reason is ___.',
    options: ['because', 'that', 'for', 'due to'],
    correctAnswer: 1,
    category: 'grammar',
    difficulty: 'advanced',
    explanation: 'Use "that" after "the reason is".'
  },
  {
    id: 'g15',
    question: 'Where are you ___?',
    options: ['going to', 'going', 'go', 'went'],
    correctAnswer: 1,
    category: 'grammar',
    difficulty: 'advanced',
    explanation: '"Where are you going" is correct.'
  },

  // More Vocabulary - Advanced
  {
    id: 'v11',
    question: '"Ubiquitous" means:',
    options: ['Rare', 'Everywhere', 'Unknown', 'Modern'],
    correctAnswer: 1,
    category: 'vocabulary',
    difficulty: 'advanced',
    explanation: 'Means present everywhere.'
  },
  {
    id: 'v12',
    question: '"Ephemeral" means:',
    options: ['Forever', 'Short-lived', 'Ancient', 'Strong'],
    correctAnswer: 1,
    category: 'vocabulary',
    difficulty: 'advanced',
    explanation: 'Means lasting a short time.'
  },
  {
    id: 'v13',
    question: '"Altruistic" means:',
    options: ['Selfish', 'Selfless', 'Angry', 'Confused'],
    correctAnswer: 1,
    category: 'vocabulary',
    difficulty: 'advanced',
    explanation: 'Means unselfish concern for others.'
  },
  {
    id: 'v14',
    question: 'Synonym for "ambiguous":',
    options: ['Clear', 'Unclear', 'Certain', 'Obvious'],
    correctAnswer: 1,
    category: 'vocabulary',
    difficulty: 'advanced',
    explanation: 'Means unclear or having multiple meanings.'
  },
  {
    id: 'v15',
    question: '"Pragmatic" means:',
    options: ['Idealistic', 'Practical', 'Theoretical', 'Emotional'],
    correctAnswer: 1,
    category: 'vocabulary',
    difficulty: 'advanced',
    explanation: 'Means practical and realistic.'
  },

  // More Idioms - Intermediate/Advanced
  {
    id: 'i6',
    question: '"Let the cat out of the bag" means:',
    options: ['Release pet', 'Reveal secret', 'Mistake', 'Open door'],
    correctAnswer: 1,
    category: 'idioms',
    difficulty: 'intermediate',
    explanation: 'Means to reveal a secret.'
  },
  {
    id: 'i7',
    question: '"Burn the midnight oil" means:',
    options: ['Start fire', 'Work late', 'Cook dinner', 'Use lamps'],
    correctAnswer: 1,
    category: 'idioms',
    difficulty: 'intermediate',
    explanation: 'Means to work late at night.'
  },
  {
    id: 'i8',
    question: '"Barking up the wrong tree" means:',
    options: ['Like a dog', 'Wrong place', 'Climbing tree', 'Making noise'],
    correctAnswer: 1,
    category: 'idioms',
    difficulty: 'intermediate',
    explanation: 'Means pursuing the wrong thing.'
  },
  {
    id: 'i9',
    question: '"Hit the nail on the head" means:',
    options: ['Construction', 'Exactly right', 'Hit something', 'Mistake'],
    correctAnswer: 1,
    category: 'idioms',
    difficulty: 'intermediate',
    explanation: 'Means to be exactly right.'
  },
  {
    id: 'i10',
    question: '"Bite the bullet" means:',
    options: ['Eat hard', 'Face difficulty', 'Get hurt', 'Be brave'],
    correctAnswer: 1,
    category: 'idioms',
    difficulty: 'intermediate',
    explanation: 'Means to face something difficult.'
  }
];

export function getRandomQuestions(count: number, difficulty?: 'beginner' | 'intermediate' | 'advanced'): TriviaQuestion[] {
  let filtered = triviaQuestions;
  
  if (difficulty) {
    filtered = triviaQuestions.filter(q => q.difficulty === difficulty);
  }
  
  // Shuffle and pick random questions
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function getQuestionById(id: string): TriviaQuestion | undefined {
  return triviaQuestions.find(q => q.id === id);
}
