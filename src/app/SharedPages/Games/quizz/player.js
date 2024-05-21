import React, { useState } from 'react';

const QuizPlayer = ({ questions }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);

  const handleOptionChange = (index) => {
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption !== null) {
      const isCorrect = questions[currentQuestion].options[selectedOption].isCorrect;
      setScore(score + (isCorrect ? 1 : 0));
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    }
  };

  const renderQuestion = () => {
    const question = questions[currentQuestion];
    if (!question) {
      return <div>You finished the quiz! Your score is {score} out of {questions.length}</div>;
    }
    return (
      <div>
        <h3>{question.text}</h3>
        <ul>
          {question.options.map((option, index) => (
            <li key={index}>
              <input
                type="radio"
                id={`option-${index}`}
                name="answer"
                value={index}
                checked={selectedOption === index}
                onChange={() => handleOptionChange(index)}
              />
              <label htmlFor={`option-${index}`}>{option.text}</label>
            </li>
          ))}
        </ul>
        <button onClick={handleSubmitAnswer}>Submit Answer</button>
      </div>
    );
  };

  return (
    <div>
      {renderQuestion()}
    </div>
  );
};

export default QuizPlayer;
