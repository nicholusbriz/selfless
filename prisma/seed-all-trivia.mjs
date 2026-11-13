import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const allTriviaQuestions = [
  // LEVEL 1 - BEGINNER (10 questions)
  { q: "Which word is closest in meaning to HAPPY?", o: ["Angry", "Joyful", "Nervous", "Lonely"], a: 1, cat: "vocabulary", d: "beginner", e: "Joyful is a synonym for happy." },
  { q: 'What does the idiom "A piece of cake" mean?', o: ["Something expensive", "Something confusing", "Something delicious", "Something very easy"], a: 3, cat: "idioms", d: "beginner", e: "This idiom means something is very easy to do." },
  { q: "Which sentence is grammatically correct?", o: ["She go to school every day.", "She going to school every day.", "She goes to school every day.", "She gone to school every day."], a: 2, cat: "grammar", d: "beginner", e: "The correct present simple form is 'goes'." },
  { q: "What is the opposite of GENEROUS?", o: ["Kind", "Friendly", "Selfish", "Helpful"], a: 2, cat: "vocabulary", d: "beginner", e: "Selfish is the opposite of generous." },
  { q: "Which word is spelled correctly?", o: ["Definately", "Definitely", "Definetely", "Definatly"], a: 1, cat: "common-mistakes", d: "beginner", e: "'Definitely' is the correct spelling." },
  { q: 'What does "Break the ice" mean?', o: ["To start a friendly conversation", "To destroy something", "To end a friendship", "To make someone angry"], a: 0, cat: "idioms", d: "beginner", e: "This idiom means to start a friendly conversation." },
  { q: "What is the correct plural form of CHILD?", o: ["Childs", "Childes", "Childrens", "Children"], a: 3, cat: "grammar", d: "beginner", e: "'Children' is the irregular plural form." },
  { q: "Which word is a synonym for BRAVE?", o: ["Careless", "Fearful", "Courageous", "Weak"], a: 2, cat: "vocabulary", d: "beginner", e: "Courageous is a synonym for brave." },
  { q: "Which sentence is correct?", o: ["They was playing football.", "They were playing football.", "They is playing football.", "They be playing football."], a: 1, cat: "grammar", d: "beginner", e: "The correct form is 'were' for 'they'." },
  { q: 'What does "Under the weather" mean?', o: ["Being outdoors", "Being excited", "Being confused", "Feeling unwell"], a: 3, cat: "idioms", d: "beginner", e: "This idiom means feeling sick or unwell." },
  
  // LEVEL 2 - BEGINNER (10 questions)
  { q: "Which word is the opposite of ANCIENT?", o: ["Modern", "Historic", "Old", "Traditional"], a: 0, cat: "vocabulary", d: "beginner", e: "Modern is the opposite of ancient." },
  { q: 'Complete the sentence: "I have lived here _____ 2020."', o: ["For", "During", "Since", "By"], a: 2, cat: "grammar", d: "beginner", e: "'Since' is correct for the starting point." },
  { q: 'What does "Hit the books" mean?', o: ["To damage books", "To begin studying seriously", "To purchase books", "To throw books away"], a: 1, cat: "idioms", d: "beginner", e: "This idiom means to begin studying seriously." },
  { q: "Which of these is an adjective?", o: ["Quickly", "Running", "Beauty", "Beautiful"], a: 3, cat: "grammar", d: "beginner", e: "Beautiful is an adjective." },
  { q: "Choose the correctly punctuated sentence.", o: ["Where are you going.", "Where are you going!", "Where are you going?", "Where, are you going?"], a: 2, cat: "grammar", d: "beginner", e: "A question mark is the correct punctuation." },
  { q: "Which word means to speak very quietly?", o: ["Whisper", "Shout", "Announce", "Argue"], a: 0, cat: "vocabulary", d: "beginner", e: "Whisper means to speak very quietly." },
  { q: "Which sentence uses THEIR correctly?", o: ["Their going to the market.", "The students forgot their books.", "Put the bag over their.", "Their is a beautiful day."], a: 1, cat: "grammar", d: "beginner", e: "'Their' shows possession; used correctly in option B." },
  { q: 'What does "Once in a blue moon" mean?', o: ["Every evening", "Every month", "Very frequently", "Very rarely"], a: 3, cat: "idioms", d: "beginner", e: "This idiom means very rarely." },
  { q: "Which of these words is a noun?", o: ["Happiness", "Happy", "Happily", "Happier"], a: 0, cat: "grammar", d: "beginner", e: "Happiness is a noun." },
  { q: "Which sentence is written in the past tense?", o: ["She eats breakfast.", "She is eating breakfast.", "She ate breakfast.", "She will eat breakfast."], a: 2, cat: "grammar", d: "beginner", e: "'Ate' is the past tense form." }
];

const questionMap = {};

async function seedTrivia() {
  console.log(`Starting to seed ${allTriviaQuestions.length} trivia questions...`);
  
  let created = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const data of allTriviaQuestions) {
    try {
      const question = await prisma.triviaQuestion.create({
        data: {
          question: data.q,
          options: data.o,
          correctAnswer: data.a,
          category: data.cat,
          difficulty: data.d,
          explanation: data.e,
          timesAsked: 0,
          timesCorrect: 0,
          difficultyRating: 0.0,
          isActive: true
        }
      });
      created++;
      if (created % 10 === 0) console.log(`✓ Created ${created} questions...`);
    } catch (error) {
      if (error.code === 'P2002') {
        skipped++;
      } else {
        errors++;
        console.error(`✗ Error creating "${data.q.substring(0, 40)}...":`, error.message);
      }
    }
  }
  
  console.log(`\n✓ Seeding complete!`);
  console.log(`  Created: ${created} new questions`);
  console.log(`  Skipped: ${skipped} (already exist)`);
  console.log(`  Errors: ${errors}`);
  
  const total = await prisma.triviaQuestion.count();
  console.log(`  Total in database: ${total}`);
}

seedTrivia()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
