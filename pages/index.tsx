import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import md5 from 'md5';

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
        console.log('Loaded state from local storage:', state);
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
      const isProd = process.env.NODE_ENV === 'production';
      const basePath = isProd ? '/my-tests' : '';
      console.log('Base Path:', basePath); // Debugging
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
      console.log('Saving state to local storage:', state);
      setStateHash(currentHash);
      state.stateHash = currentHash;
      const stateJson = JSON.stringify(state);
      const stateBase64 = toBase64(stateJson);
      localStorage.setItem(testId, stateBase64);
      console.log('State saved to local storage:', localStorage.getItem(testId)); // Debug log to check if the state is being set
    }
  };

  const handleStart = async () => {
    await loadQuestions(); // Load and shuffle questions when starting a new test
    const newTestId = Date.now().toString();
    setTestId(newTestId);
    const start = Date.now();
    setStartTime(start);
    setTestStarted(true);
    setElapsedTime(0);
    Cookies.set('quizState', newTestId, { expires: 1 });
    saveStateToLocalStorage();
  };

  const handleSubmit = () => {
    const endTime = Date.now();
    const calculatedResults = questions.map((q, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === q.correctAnswer;
      const timeTaken = (endTime - startTime) / 60000;
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
    console.log('Option changed:', newAnswers);
    saveStateToLocalStorage();
  };

  const reportBadQuestion = () => {
    const updatedQuestions = [...questions];
    const currentQuestion = updatedQuestions[currentQuestionIndex];
    if (!currentQuestion.complaints) {
      currentQuestion.complaints = 0;
    }
    currentQuestion.complaints++;
    setQuestions(updatedQuestions);
    saveStateToLocalStorage();
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
    const newTestId = Date.now().toString();
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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {!showResults ? (
        <>
          {!testStarted ? (
            <div>
              <button onClick={handleStart} style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                התחל מבחן
              </button>
            </div>
          ) : (
            <div>
              <div>
                <p style={{ color: '#FF5733', fontSize: '18px' }}>זמן שנותר: {formatTime(remainingTime)}</p>
              </div>
              <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '5px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                <p style={{ fontSize: '18px' }}>שאלה {currentQuestionIndex + 1}: {questions[currentQuestionIndex]?.question}</p>
                {questions[currentQuestionIndex]?.options.map((option, i) => (
                  <div key={i} style={{ marginBottom: '10px' }}>
                    <input
                      type="radio"
                      name={`question-${currentQuestionIndex}`}
                      value={i}
                      checked={answers[currentQuestionIndex] === i}
                      onChange={() => handleOptionChange(i)}
                      style={{ marginRight: '10px' }}
                    />
                    <label>{option}</label>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '20px' }}>
                  <button 
                    onClick={handlePrev} 
                    disabled={currentQuestionIndex < 1} 
                    style={{ 
                      padding: '10px 20px', 
                      backgroundColor: currentQuestionIndex < 1 ? '#b0c4de' : '#2196F3', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '5px', 
                      cursor: currentQuestionIndex < 1 ? 'not-allowed' : 'pointer', 
                      marginRight: '10px' 
                    }}>
                      הקודם
                  </button>
                <button 
                  onClick={handleNext} 
                  disabled={currentQuestionIndex >= questions.length - 1} 
                  style={{ 
                    padding: '10px 20px', 
                    backgroundColor: currentQuestionIndex >= questions.length - 1 ? '#b0c4de' : '#2196F3', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '5px', 
                    cursor: currentQuestionIndex >= questions.length - 1 ? 'not-allowed' : 'pointer' 
                  }}>הבא
                </button>
                  <button 
                    onClick={handleSubmit} 
                    disabled={currentQuestionIndex !== questions.length - 1} 
                    style={{ 
                      padding: '10px 20px', 
                      backgroundColor: currentQuestionIndex >= questions.length - 1 ? '#FF5733' : '#b0c4de', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '5px', 
                      cursor: 'pointer', 
                      marginLeft: '10px' 
                    }}
                  >
                    שלח
                  </button>
                <button onClick={reportBadQuestion} style={{ padding: '10px 20px', backgroundColor: '#FF5733', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginLeft: '10px' }}>
                  דווח על שאלה
                </button>
                <button onClick={resetGame} style={{ padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginLeft: '10px' }}>
                  התחל מבחן חדש
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div>
          <h2 style={{ color: '#4CAF50' }}>תוצאות:</h2>
          {results.map((result, index) => (
            <div key={index} style={{ backgroundColor: result.isCorrect ? '#d4edda' : '#f8d7da', padding: '20px', marginBottom: '10px', borderRadius: '5px' }}>
              <p>{result.question}</p>
              <p>התשובה שלך: {questions[index].options[result.userAnswer]}</p>
              <p>התשובה הנכונה: {questions[index].options[result.correct]}</p>
              <p>{result.isCorrect ? 'נכון' : 'לא נכון'}</p>
              <p>זמן שלקח לענות: {result.timeTaken.toFixed(2)} דקות</p>
            </div>
          ))}
          <h3 style={{ color: '#FF5733' }}>ניקוד סופי: {score} מתוך {questions.length}</h3>
          <button onClick={resetGame} style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            חזור
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
