import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Complete 100 trivia questions - Levels 1-10
const allQuestions = [
  // LEVEL 1 - BEGINNER (10)
  { q: "Which word is closest in meaning to HAPPY?", o: ["Angry", "Joyful", "Nervous", "Lonely"], a: 1, cat: "vocabulary", d: "beginner" },
  { q: 'What does the idiom "A piece of cake" mean?', o: ["Something expensive", "Something confusing", "Something delicious", "Something very easy"], a: 3, cat: "idioms", d: "beginner" },
  { q: "Which sentence is grammatically correct?", o: ["She go to school every day.", "She going to school every day.", "She goes to school every day.", "She gone to school every day."], a: 2, cat: "grammar", d: "beginner" },
  { q: "What is the opposite of GENEROUS?", o: ["Kind", "Friendly", "Selfish", "Helpful"], a: 2, cat: "vocabulary", d: "beginner" },
  { q: "Which word is spelled correctly?", o: ["Definately", "Definitely", "Definetely", "Definatly"], a: 1, cat: "common-mistakes", d: "beginner" },
  { q: 'What does "Break the ice" mean?', o: ["To start a friendly conversation", "To destroy something", "To end a friendship", "To make someone angry"], a: 0, cat: "idioms", d: "beginner" },
  { q: "What is the correct plural form of CHILD?", o: ["Childs", "Childes", "Childrens", "Children"], a: 3, cat: "grammar", d: "beginner" },
  { q: "Which word is a synonym for BRAVE?", o: ["Careless", "Fearful", "Courageous", "Weak"], a: 2, cat: "vocabulary", d: "beginner" },
  { q: "Which sentence is correct?", o: ["They was playing football.", "They were playing football.", "They is playing football.", "They be playing football."], a: 1, cat: "grammar", d: "beginner" },
  { q: 'What does "Under the weather" mean?', o: ["Being outdoors", "Being excited", "Being confused", "Feeling unwell"], a: 3, cat: "idioms", d: "beginner" },
  
  // LEVEL 2 - BEGINNER (10)
  { q: "Which word is the opposite of ANCIENT?", o: ["Modern", "Historic", "Old", "Traditional"], a: 0, cat: "vocabulary", d: "beginner" },
  { q: 'Complete the sentence: "I have lived here _____ 2020."', o: ["For", "During", "Since", "By"], a: 2, cat: "grammar", d: "beginner" },
  { q: 'What does "Hit the books" mean?', o: ["To damage books", "To begin studying seriously", "To purchase books", "To throw books away"], a: 1, cat: "idioms", d: "beginner" },
  { q: "Which of these is an adjective?", o: ["Quickly", "Running", "Beauty", "Beautiful"], a: 3, cat: "grammar", d: "beginner" },
  { q: "Choose the correctly punctuated sentence.", o: ["Where are you going.", "Where are you going!", "Where are you going?", "Where, are you going?"], a: 2, cat: "grammar", d: "beginner" },
  { q: "Which word means to speak very quietly?", o: ["Whisper", "Shout", "Announce", "Argue"], a: 0, cat: "vocabulary", d: "beginner" },
  { q: "Which sentence uses THEIR correctly?", o: ["Their going to the market.", "The students forgot their books.", "Put the bag over their.", "Their is a beautiful day."], a: 1, cat: "grammar", d: "beginner" },
  { q: 'What does "Once in a blue moon" mean?', o: ["Every evening", "Every month", "Very frequently", "Very rarely"], a: 3, cat: "idioms", d: "beginner" },
  { q: "Which of these words is a noun?", o: ["Happiness", "Happy", "Happily", "Happier"], a: 0, cat: "grammar", d: "beginner" },
  { q: "Which sentence is written in the past tense?", o: ["She eats breakfast.", "She is eating breakfast.", "She ate breakfast.", "She will eat breakfast."], a: 2, cat: "grammar", d: "beginner" },
  
  // LEVEL 3 - BEGINNER (10)
  { q: "Which word is a synonym for ENORMOUS?", o: ["Tiny", "Huge", "Narrow", "Weak"], a: 1, cat: "vocabulary", d: "beginner" },
  { q: 'What does the idiom "Spill the beans" mean?', o: ["To cook food", "To waste money", "To reveal a secret", "To make a mistake"], a: 2, cat: "idioms", d: "beginner" },
  { q: "Which sentence is grammatically correct?", o: ["Neither of the boys is present.", "Neither of the boys are present.", "Neither boys is present.", "Neither of boys were present."], a: 0, cat: "grammar", d: "beginner" },
  { q: "What is the opposite of OPTIMISTIC?", o: ["Cheerful", "Hopeful", "Positive", "Pessimistic"], a: 3, cat: "vocabulary", d: "beginner" },
  { q: "Choose the correct spelling.", o: ["Recieve", "Receive", "Receeve", "Receve"], a: 1, cat: "common-mistakes", d: "beginner" },
  { q: 'What does "Burn the midnight oil" mean?', o: ["To waste electricity", "To stay up late working or studying", "To cook at night", "To sleep very late"], a: 1, cat: "idioms", d: "beginner" },
  { q: "Which sentence is in the future tense?", o: ["I visited my uncle.", "I visit my uncle.", "I will visit my uncle.", "I am visiting my uncle yesterday."], a: 2, cat: "grammar", d: "beginner" },
  { q: "Which word is an antonym of EXPAND?", o: ["Contract", "Increase", "Extend", "Enlarge"], a: 0, cat: "vocabulary", d: "beginner" },
  { q: "Choose the correct sentence.", o: ["He don't like coffee.", "He doesn't likes coffee.", "He not like coffee.", "He doesn't like coffee."], a: 3, cat: "grammar", d: "beginner" },
  { q: 'What does "Actions speak louder than words" mean?', o: ["Speaking loudly is important.", "What people do matters more than what they say.", "Actions are always noisy.", "Words are more powerful than actions."], a: 1, cat: "idioms", d: "beginner" },
  
  // LEVEL 4 - BEGINNER (10)
  { q: "Which word means the same as RELUCTANT?", o: ["Excited", "Willing", "Unwilling", "Certain"], a: 2, cat: "vocabulary", d: "beginner" },
  { q: 'What does "A blessing in disguise" mean?', o: ["Something that appears bad but turns out good.", "A hidden treasure.", "A secret gift.", "An unexpected punishment."], a: 0, cat: "idioms", d: "beginner" },
  { q: "Which sentence is correct?", o: ["If I was you, I will apologize.", "If I were you, I would apologize.", "If I am you, I would apologize.", "If I be you, I apologize."], a: 1, cat: "grammar", d: "beginner" },
  { q: "What is the plural of CRISIS?", o: ["Crisises", "Crisies", "Crisiss", "Crises"], a: 3, cat: "grammar", d: "beginner" },
  { q: "Which word is closest in meaning to GENEROUS?", o: ["Selfish", "Giving", "Greedy", "Careless"], a: 1, cat: "vocabulary", d: "beginner" },
  { q: 'What does "Bite off more than you can chew" mean?', o: ["To eat too quickly.", "To speak without thinking.", "To take on more responsibility than you can handle.", "To avoid difficult tasks."], a: 2, cat: "idioms", d: "beginner" },
  { q: "Which sentence is correct?", o: ["The information is useful.", "The informations are useful.", "The information are useful.", "The informations is useful."], a: 0, cat: "grammar", d: "beginner" },
  { q: "Which word is an antonym of FREQUENT?", o: ["Regular", "Common", "Repeated", "Rare"], a: 3, cat: "vocabulary", d: "beginner" },
  { q: "What is the correct comparative form of GOOD?", o: ["Gooder", "Best", "Better", "More good"], a: 2, cat: "grammar", d: "beginner" },
  { q: 'What does "The ball is in your court" mean?', o: ["You are playing a game.", "It is now your responsibility to take action.", "You have won a competition.", "You should wait for someone else."], a: 1, cat: "idioms", d: "beginner" },
  
  // LEVEL 5 - INTERMEDIATE (10)
  { q: "Which word is closest in meaning to AMBIGUOUS?", o: ["Unclear", "Obvious", "Accurate", "Certain"], a: 0, cat: "vocabulary", d: "intermediate" },
  { q: 'What does "Beat around the bush" mean?', o: ["To work in a garden.", "To avoid addressing the main point.", "To speak very confidently.", "To explain something clearly."], a: 1, cat: "idioms", d: "intermediate" },
  { q: "Which sentence is grammatically correct?", o: ["Each of the students have a book.", "Each of the students are having a book.", "Each of the students has a book.", "Each students has a book."], a: 2, cat: "grammar", d: "intermediate" },
  { q: "What is the antonym of METICULOUS?", o: ["Careful", "Precise", "Thorough", "Careless"], a: 3, cat: "vocabulary", d: "intermediate" },
  { q: "Which word means the ability to recover quickly from difficulties?", o: ["Resilience", "Hesitation", "Confusion", "Negligence"], a: 0, cat: "vocabulary", d: "intermediate" },
  { q: "Choose the correct sentence.", o: ["Despite of the rain, we continued.", "Despite the rain, we continued.", "Although of the rain, we continued.", "In spite the rain, we continued."], a: 1, cat: "grammar", d: "intermediate" },
  { q: 'What does "Barking up the wrong tree" mean?', o: ["Making too much noise.", "Choosing the correct approach.", "Accusing or pursuing the wrong person or idea.", "Avoiding responsibility."], a: 2, cat: "idioms", d: "intermediate" },
  { q: "Which word is a synonym for ABUNDANT?", o: ["Scarce", "Limited", "Insufficient", "Plentiful"], a: 3, cat: "vocabulary", d: "intermediate" },
  { q: "Which sentence is in the passive voice?", o: ["The chef prepared the meal.", "The meal was prepared by the chef.", "The chef is preparing the meal.", "The chef prepares meals daily."], a: 1, cat: "grammar", d: "intermediate" },
  { q: 'What does "Cut corners" mean?', o: ["To take a shorter road.", "To draw geometric shapes.", "To do something cheaply or carelessly to save time or money.", "To complete a task perfectly."], a: 2, cat: "idioms", d: "intermediate" },
  
  // LEVEL 6 - INTERMEDIATE (10)
  { q: "Which word means excessive pride in oneself?", o: ["Humility", "Arrogance", "Compassion", "Integrity"], a: 1, cat: "vocabulary", d: "intermediate" },
  { q: 'What does "Throw in the towel" mean?', o: ["To clean something.", "To start a new challenge.", "To admit defeat or give up.", "To celebrate victory."], a: 2, cat: "idioms", d: "intermediate" },
  { q: "Which sentence uses the subjunctive mood correctly?", o: ["I suggest that he studies harder.", "I suggest that he study harder.", "I suggest that he studying harder.", "I suggest that he studied harder."], a: 1, cat: "grammar", d: "intermediate" },
  { q: "What is the closest synonym for VAGUE?", o: ["Precise", "Definite", "Detailed", "Unclear"], a: 3, cat: "vocabulary", d: "intermediate" },
  { q: "Which sentence is correct?", o: ["She is senior than me.", "She is senior to me.", "She is more senior than to me.", "She is senior from me."], a: 1, cat: "grammar", d: "intermediate" },
  { q: 'What does "A double-edged sword" mean?', o: ["Something that has both advantages and disadvantages.", "Something that is completely beneficial.", "A dangerous weapon only.", "Something that has no consequences."], a: 0, cat: "idioms", d: "intermediate" },
  { q: "Which word is the opposite of TRANSPARENT?", o: ["Clear", "Visible", "Opaque", "Obvious"], a: 2, cat: "vocabulary", d: "intermediate" },
  { q: "Identify the correctly punctuated sentence.", o: ["However I decided to stay.", "However, I decided to stay.", "However I, decided to stay.", "However; I, decided to stay."], a: 1, cat: "grammar", d: "intermediate" },
  { q: "What does the word CONCISE mean?", o: ["Using few words while expressing much meaning.", "Using unnecessarily complicated language.", "Speaking without confidence.", "Repeating information several times."], a: 0, cat: "vocabulary", d: "intermediate" },
  { q: "Which sentence is correct?", o: ["Neither John nor his friends was invited.", "Neither John nor his friends is invited.", "Neither John nor his friends were invited.", "Neither John or his friends were invited."], a: 2, cat: "grammar", d: "intermediate" },
  
  // LEVEL 7 - INTERMEDIATE (10)
  { q: "Which word means to make something less severe?", o: ["Intensify", "Exaggerate", "Aggravate", "Alleviate"], a: 3, cat: "vocabulary", d: "intermediate" },
  { q: 'What does "The last straw" mean?', o: ["The final thing that makes a difficult situation unbearable.", "The last opportunity to drink.", "A small problem that can be ignored.", "The beginning of a new experience."], a: 0, cat: "idioms", d: "intermediate" },
  { q: "Which sentence is grammatically correct?", o: ["Hardly I had arrived when it started raining.", "Hardly had I arrived when it started raining.", "Hardly had I arrived than it started raining.", "Hardly I arrived when it started raining."], a: 1, cat: "grammar", d: "intermediate" },
  { q: "What is the meaning of PROCRASTINATE?", o: ["To work efficiently.", "To complete tasks early.", "To delay or postpone tasks.", "To plan carefully."], a: 2, cat: "vocabulary", d: "intermediate" },
  { q: "Which word is the opposite of BENEVOLENT?", o: ["Kind", "Compassionate", "Charitable", "Malevolent"], a: 3, cat: "vocabulary", d: "intermediate" },
  { q: 'What does "A storm in a teacup" mean?', o: ["A serious natural disaster.", "A minor issue exaggerated into a major problem.", "A disagreement that cannot be resolved.", "An unexpected opportunity."], a: 1, cat: "idioms", d: "intermediate" },
  { q: "Choose the correctly structured sentence.", o: ["No sooner did he arrive than the meeting began.", "No sooner he arrived than the meeting began.", "No sooner had he arrive than the meeting began.", "No sooner did he arrived than the meeting began."], a: 0, cat: "grammar", d: "intermediate" },
  { q: "Which word means to deliberately avoid answering a question?", o: ["Elaborate", "Clarify", "Evade", "Emphasize"], a: 2, cat: "vocabulary", d: "intermediate" },
  { q: "Which sentence uses the semicolon correctly?", o: ["I wanted to travel; but I had no money.", "I wanted to travel; I had saved enough money.", "I wanted; to travel I had saved enough money.", "I; wanted to travel, I had saved enough money."], a: 1, cat: "grammar", d: "intermediate" },
  { q: 'What does "To add insult to injury" mean?', o: ["To apologize sincerely.", "To make a bad situation even worse.", "To solve an existing problem.", "To criticize someone constructively."], a: 1, cat: "idioms", d: "intermediate" },
  
  // LEVEL 8 - ADVANCED (10)
  { q: "Which word means someone who uses many words to express very little?", o: ["Eloquent", "Verbose", "Concise", "Articulate"], a: 1, cat: "vocabulary", d: "advanced" },
  { q: 'What does "To steal someone\'s thunder" mean?', o: ["To take credit or attention away from someone else's achievement.", "To interrupt a thunderstorm.", "To criticize someone's performance.", "To reveal an important secret."], a: 0, cat: "idioms", d: "advanced" },
  { q: "Which sentence is grammatically correct?", o: ["Had I knew about the meeting, I would have attended.", "If I would have known, I had attended.", "Had I known about the meeting, I would have attended.", "If I have known, I would attended."], a: 2, cat: "grammar", d: "advanced" },
  { q: "What does the word UBIQUITOUS mean?", o: ["Extremely rare", "Difficult to understand", "Completely invisible", "Present or found everywhere"], a: 3, cat: "vocabulary", d: "advanced" },
  { q: "Which word is closest in meaning to EPHEMERAL?", o: ["Permanent", "Temporary", "Endless", "Ancient"], a: 1, cat: "vocabulary", d: "advanced" },
  { q: 'What does "Between a rock and a hard place" mean?', o: ["Being physically trapped between two objects.", "Having two equally enjoyable choices.", "Facing a difficult situation with no easy option.", "Being unable to make a simple decision."], a: 2, cat: "idioms", d: "advanced" },
  { q: "Which sentence uses the word WHOM correctly?", o: ["Whom is responsible for this decision?", "Whom did you give the document to?", "Whom arrived at the office first?", "Whom is going to lead the meeting?"], a: 1, cat: "grammar", d: "advanced" },
  { q: "Which word means to deliberately mislead someone?", o: ["Enlighten", "Clarify", "Inform", "Deceive"], a: 3, cat: "vocabulary", d: "advanced" },
  { q: "Which sentence demonstrates correct parallel structure?", o: ["She enjoys reading, swimming, and cycling.", "She enjoys reading, to swim, and cycling.", "She enjoys to read, swimming, and cycle.", "She enjoys reading, swimming, and to cycle."], a: 0, cat: "grammar", d: "advanced" },
  { q: 'What does "A Pyrrhic victory" mean?', o: ["A victory achieved without effort.", "A victory that brings great rewards.", "A victory achieved at such a great cost that it is almost a defeat.", "A victory that is completely unexpected."], a: 2, cat: "idioms", d: "advanced" },
  
  // LEVEL 9 - ADVANCED (10)
  { q: "Which word describes someone who deliberately uses ambiguous language to avoid committing to a clear position?", o: ["Forthright", "Evasive", "Transparent", "Candid"], a: 1, cat: "vocabulary", d: "advanced" },
  { q: 'What does "To move the goalposts" mean?', o: ["To change the rules or conditions unfairly during a process.", "To improve a team's performance.", "To establish clear expectations.", "To abandon a difficult project."], a: 0, cat: "idioms", d: "advanced" },
  { q: "Which sentence is grammatically correct?", o: ["Scarcely had she entered when the phone rang.", "Scarcely she had entered when the phone rang.", "Scarcely had she entered than the phone rang.", "Scarcely did she entered when the phone rang."], a: 0, cat: "grammar", d: "advanced" },
  { q: "What does the word OBSTINATE mean?", o: ["Easily persuaded.", "Extremely generous.", "Unwilling to change one's opinion or behaviour.", "Always willing to compromise."], a: 2, cat: "vocabulary", d: "advanced" },
  { q: "Which word means a person who pretends to have virtues, beliefs or qualities they do not actually possess?", o: ["Philanthropist", "Hypocrite", "Optimist", "Pacifist"], a: 1, cat: "vocabulary", d: "advanced" },
  { q: 'What does "To call someone\'s bluff" mean?', o: ["To praise someone publicly.", "To make an empty promise.", "To avoid a confrontation.", "To challenge someone to prove that their threat or claim is genuine."], a: 3, cat: "idioms", d: "advanced" },
  { q: "Which sentence is correct?", o: ["The criteria for selection is clear.", "The criterion for selection are clear.", "The criteria for selection are clear.", "The criterias for selection are clear."], a: 2, cat: "grammar", d: "advanced" },
  { q: "Which word means to make something seem less important or serious than it really is?", o: ["Understate", "Exaggerate", "Emphasize", "Magnify"], a: 0, cat: "vocabulary", d: "advanced" },
  { q: 'What is the meaning of the idiom "A leopard cannot change its spots"?', o: ["People can easily change their nature.", "A person's fundamental character is difficult to change.", "Animals cannot change their appearance.", "Everyone deserves a second chance."], a: 1, cat: "idioms", d: "advanced" },
  { q: "Which sentence correctly uses the word WHOM?", o: ["The person whom called you is my brother.", "Whom do you think will win?", "The person whom I interviewed was qualified.", "Whom wants to participate?"], a: 2, cat: "grammar", d: "advanced" },
  
  // LEVEL 10 - ADVANCED (10)
  { q: "Which word means the use of language that is deliberately indirect or softened to make something unpleasant sound more acceptable?", o: ["Hyperbole", "Euphemism", "Irony", "Metaphor"], a: 1, cat: "vocabulary", d: "advanced" },
  { q: 'What does "To cut the Gordian knot" mean?', o: ["To create a complicated problem.", "To avoid making a decision.", "To solve a complicated problem through a bold and decisive action.", "To make a difficult situation worse."], a: 2, cat: "idioms", d: "advanced" },
  { q: "Which sentence is grammatically correct?", o: ["Not only he was intelligent, but he was also hardworking.", "Not only was he intelligent, but he was also hardworking.", "Not only he is intelligent, but also hardworking was he.", "Not only was intelligent he, but he was also hardworking."], a: 1, cat: "grammar", d: "advanced" },
  { q: "What does the word PERSPICACIOUS mean?", o: ["Having a sharp understanding or insight.", "Being easily confused.", "Being excessively talkative.", "Having difficulty making decisions."], a: 0, cat: "vocabulary", d: "advanced" },
  { q: "Which word describes a statement that appears self-contradictory but may contain a deeper truth?", o: ["Analogy", "Allegory", "Paradox", "Proverb"], a: 2, cat: "vocabulary", d: "advanced" },
  { q: 'What does "To throw down the gauntlet" mean?', o: ["To surrender in a competition.", "To issue a challenge or confrontation.", "To refuse an invitation.", "To avoid an argument."], a: 1, cat: "idioms", d: "advanced" },
  { q: "Which sentence uses the subjunctive correctly?", o: ["It is essential that every participant be present.", "It is essential that every participant is present.", "It is essential that every participant are present.", "It is essential that every participant being present."], a: 0, cat: "grammar", d: "advanced" },
  { q: "Which word means to criticize someone or something severely?", o: ["Commend", "Applaud", "Condone", "Censure"], a: 3, cat: "vocabulary", d: "advanced" },
  { q: 'What does the phrase "The exception that proves the rule" generally suggest?', o: ["Every rule has no exceptions.", "An exception can sometimes reveal that a general rule exists.", "Rules are always incorrect.", "Exceptions should always be ignored."], a: 1, cat: "idioms", d: "advanced" },
  { q: "Which sentence is grammatically correct?", o: ["Were he to accept the offer, he would relocate.", "Was he to accepted the offer, he would relocate.", "Were he accepted the offer, he would relocate.", "If he were accept the offer, he would relocate."], a: 0, cat: "grammar", d: "advanced" }
];

async function seedAll() {
  console.log(`Starting to seed ${allQuestions.length} trivia questions...`);
  
  let created = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const q of allQuestions) {
    try {
      await prisma.triviaQuestion.create({
        data: {
          question: q.q,
          options: q.o,
          correctAnswer: q.a,
          category: q.cat,
          difficulty: q.d,
          timesAsked: 0,
          timesCorrect: 0,
          difficultyRating: 0.0,
          isActive: true
        }
      });
      created++;
      if (created % 10 === 0) console.log(`  ✓ ${created}/${allQuestions.length} created...`);
    } catch (error) {
      if (error.code === 'P2002') {
        skipped++;
      } else {
        errors++;
      }
    }
  }
  
  console.log(`\n✅ Seeding complete!`);
  console.log(`   Created: ${created} questions`);
  console.log(`   Skipped: ${skipped} (already exist)`);
  if (errors > 0) console.log(`   Errors: ${errors}`);
  
  const total = await prisma.triviaQuestion.count();
  console.log(`   Total now in database: ${total} questions`);
}

seedAll()
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
