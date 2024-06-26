import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import md5 from 'md5';
import styles from '../styles/Home.module.css';

const isProd = process.env.NODE_ENV === 'production';

function toBase64(str: string): string {
  const uint8Array = new TextEncoder().encode(str);
  let binaryString = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binaryString += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binaryString);
}

function fromBase64(str: string): string {
  const binaryString = atob(str);
  const uint8Array = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }
  return new TextDecoder().decode(uint8Array);
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  complaints?: number;
}

interface Result {
  question: string;
  correct: number;
  userAnswer: number;
  isCorrect: boolean;
  timeTaken: number;
}

interface State {
  testId: string;
  currentQuestionIndex: number;
  questions: Question[];
  answers: number[];
  questionTimes: number[];
  testStarted: boolean;
  startTime: number;
  initialTime: number;
  elapsedTime: number;
  stateHash: string;
}

const Home = () => {
  const [testId, setTestId] = useState<string>(Cookies.get('quizState') || Date.now().toString());
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [initialTime, setInitialTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [results, setResults] = useState<Result[]>([]);
  const [testStarted, setTestStarted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [questionTimes, setQuestionTimes] = useState<number[]>([]);
  const [stateHash, setStateHash] = useState<string>('');

  useEffect(() => {
    const savedTestId = Cookies.get('quizState');
    if (savedTestId) {
      const savedStateBase64 = localStorage.getItem(savedTestId);
      if (savedStateBase64) {
        const savedStateJson = fromBase64(savedStateBase64);
        const state: State = JSON.parse(savedStateJson);
        setTestId(state.testId);
        setCurrentQuestionIndex(state.currentQuestionIndex);
        setQuestions(state.questions);
        setAnswers(state.answers);
        setQuestionTimes(state.questionTimes);
        setTestStarted(state.testStarted);
        setStartTime(state.startTime);
        setInitialTime(state.initialTime);
        setElapsedTime(state.elapsedTime);
        setStateHash(state.stateHash);
      } else {
        loadQuestions();
      }
    } else {
      loadQuestions();
    }
  }, []);

  useEffect(() => {
    if (testStarted) {
      const timerId = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = Math.floor((currentTime - startTime) / 1000);
        setElapsedTime(elapsed);
        if (elapsed >= initialTime) {
          handleSubmit();
        }
      }, 1000);

      return () => clearInterval(timerId);
    }
  }, [testStarted, startTime, initialTime]);

  useEffect(() => {
    if (testStarted) {
      saveStateToLocalStorage();
    }
  }, [testId, currentQuestionIndex, questions, answers, questionTimes, testStarted, startTime, initialTime, elapsedTime]);

  const loadQuestions = async () => {
    try {      
      const basePath = isProd ? '/my-tests' : '';
      const response = await axios.get(`${basePath}/questions.json`);
      let filteredQuestions = response.data.filter((question: Question) => !question.complaints || question.complaints <= 1);
      filteredQuestions = shuffleArray(filteredQuestions);
      setQuestions(filteredQuestions);
      setAnswers(new Array(filteredQuestions.length).fill(null));
      setQuestionTimes(new Array(filteredQuestions.length).fill(0));
      setInitialTime(filteredQuestions.length * 60); // Default time of 1 minute per question in seconds
    } catch (error) {
      console.error('Failed to load questions:', error);
    }
  };

  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const calculateStateHash = (state: any) => {
    const { testId, questions, answers, currentQuestionIndex, testStarted, questionTimes, showResults, results, score } = state;
    const stateToHash = {
      testId,
      questions,
      answers,
      currentQuestionIndex,
      testStarted,
      questionTimes,
      showResults,
      results,
      score,
    };
    return md5(JSON.stringify(stateToHash));
  };

  const isValidTestKey = (str: string): boolean => {
    const unixTimestampRegex = /^test_\d{13}$/;
    return unixTimestampRegex.test(str);
  };

  const saveStateToLocalStorage = () => {
    const state: State = {
      testId,
      currentQuestionIndex,
      questions,
      answers,
      questionTimes,
      testStarted,
      startTime,
      initialTime,
      elapsedTime,
      stateHash,
    };
    const currentHash = calculateStateHash(state);
    if (stateHash !== currentHash) {
      setStateHash(currentHash);
      state.stateHash = currentHash;
      const stateJson = JSON.stringify(state);
      const stateBase64 = toBase64(stateJson);
      const allKeys = Object.keys(localStorage);
      const testKeys = allKeys.filter(isValidTestKey);
      const testKeysSorted = testKeys.sort();
      // Remove the oldest keys if there are more than 4 elements
      if (testKeysSorted.length > 4) {
        const keysToRemove = testKeysSorted.slice(0, testKeysSorted.length - 4);
        keysToRemove.forEach((key) => localStorage.removeItem(key));
      }
      localStorage.setItem(testId, stateBase64);
    }
  };

  const handleStart = async () => {
    await loadQuestions(); // Load and shuffle questions when starting a new test
    const newTestId = `test_${Date.now().toString()}`;
    setTestId(newTestId);
    const start = Date.now();
    setStartTime(start);
    setTestStarted(true);
    setElapsedTime(0);
    Cookies.set('quizState', newTestId, { expires: 1 });
  };

  const handleSubmit = () => {
    const calculatedResults = questions.map((q, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === q.correctAnswer;
      return {
        question: q.question,
        correct: q.correctAnswer,
        userAnswer,
        isCorrect,
        timeTaken: questionTimes[index]
      };
    });
    setResults(calculatedResults);
    setScore(calculatedResults.filter(result => result.isCorrect).length);
    setShowResults(true);
    Cookies.remove('quizState');
    localStorage.removeItem(testId);
  };

  const handleNext = () => {
    const currentTime = Date.now();
    setQuestionTimes(prevTimes => {
      const newTimes = [...prevTimes];
      newTimes[currentQuestionIndex] = (currentTime - startTime) / 60000;
      return newTimes;
    });
    setStartTime(currentTime);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleOptionChange = (index: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = index;
    setAnswers(newAnswers);
  };

  const reportBadQuestion = () => {
    const updatedQuestions = [...questions];
    const currentQuestion = updatedQuestions[currentQuestionIndex];
    if (!currentQuestion.complaints) {
      currentQuestion.complaints = 0;
    }
    currentQuestion.complaints++;
    setQuestions(updatedQuestions);
    handleNext();
  };

  const resetGame = async () => {
    Cookies.remove('quizState');
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setTestStarted(false);
    setAnswers([]);
    setScore(0);
    setElapsedTime(0);
    setQuestionTimes([]);
    const newTestId = `test_${Date.now().toString()}`;
    setTestId(newTestId);
    await loadQuestions(); // Load new set of questions
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const remainingTime = initialTime - elapsedTime;

  return (
    <div className={styles.container}>
      {!showResults ? (
        <>
          {!testStarted ? (
            <div className={styles.startContainer}>
              <button onClick={handleStart} className={`${styles.button} ${styles.startButton}`}>התחל מבחן</button>
            </div>
          ) : (
            <div className={styles.testContainer}>
              <div className={styles.timerContainer}>
                <p className={styles.timer}>זמן שנותר: {formatTime(remainingTime)}</p>
              </div>
              <div className={styles.questionContainer}>
                <p className={styles.question}>שאלה {currentQuestionIndex + 1}: {questions[currentQuestionIndex]?.question}</p>
                {questions[currentQuestionIndex]?.options.map((option, i) => (
                  <label key={i} className={styles.option}>
                    <input
                      type="radio"
                      name={`question-${currentQuestionIndex}`}
                      value={i}
                      checked={answers[currentQuestionIndex] === i}
                      onChange={() => handleOptionChange(i)}
                      className={styles.radio}
                    />
                    <span className={styles.fixedLabel}>{option}</span>
                  </label>
                ))}
              </div>
              <div className={styles.buttonContainer}>
                <button 
                  onClick={handlePrev} 
                  disabled={currentQuestionIndex < 1} 
                  className={`${styles.button} ${currentQuestionIndex < 1 ? styles.disabledButton : styles.navButton}`}
                >
                  הקודם
                </button>
                <button 
                  onClick={handleNext} 
                  disabled={currentQuestionIndex >= questions.length - 1} 
                  className={`${styles.button} ${currentQuestionIndex >= questions.length - 1 ? styles.disabledButton : styles.navButton}`}
                >
                  הבא
                </button>
                <button 
                  onClick={handleSubmit} 
                  disabled={currentQuestionIndex !== questions.length - 1} 
                  className={`${styles.button} ${currentQuestionIndex !== questions.length - 1 ? styles.disabledButton : styles.submitButton}`}
                >
                  שלח
                </button>
                <button
                  onClick={reportBadQuestion} 
                  className={`${styles.button} ${styles.reportButton}`}
                >
                  דווח על שאלה
                </button>
                <button
                  onClick={resetGame} 
                  className={`${styles.button} ${styles.resetButton}`}
                >
                  התחל מבחן חדש
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className={styles.resultsContainer}>
          <h2 className={styles.resultsTitle}>תוצאות:</h2>
          {results.map((result, index) => (
            <div key={index} className={`${styles.result} ${result.isCorrect ? styles.correct : styles.incorrect}`}>
              <p>{result.question}</p>
              <p>התשובה שלך: {questions[index].options[result.userAnswer] ?? "לא נבחרה תשובה"}</p>
              <p>התשובה הנכונה: {questions[index].options[result.correct]}</p>
              <p>{result.isCorrect ? 'נכון' : 'לא נכון'}</p>
              <p>זמן שלקח לענות: {result.timeTaken.toFixed(2)} דקות</p>
            </div>
          ))}
          <h3 className={styles.finalScore}>ניקוד סופי: {score} מתוך {questions.length}</h3>
          <button onClick={resetGame} 
            className={`${styles.button} ${styles.navButton}`}>חזור</button>
        </div>
      )}
    </div>
  );
};

export default Home;
