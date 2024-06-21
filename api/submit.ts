import { NextApiRequest, NextApiResponse } from 'next';

const questions = [
  {
    id: 1,
    question: "מהי חרדה?",
    options: ["רגש נורמלי שיכול להפוך להפרעה כאשר הוא מתמשך ואינטנסיבי.", "מחלה שאין לה טיפול.", "מצב פיזיולוגי שאין לו השפעות על התפקוד היומיומי.", "סוג של דיכאון."],
    correctAnswer: 0
  },
  // Add more questions here
];

export default (req: NextApiRequest, res: NextApiResponse) => {
  const { answers } = req.body;
  const result = questions.map((q, index) => ({
    question: q.question,
    correct: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index]
  }));
  res.status(200).json(result);
};