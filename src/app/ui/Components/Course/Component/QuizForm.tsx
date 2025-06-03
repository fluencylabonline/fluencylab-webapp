import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { Lesson, QuizQuestion } from "../types";
import FluencyButton from "@/app/ui/Components/Button/button";
import FluencyInput from "@/app/ui/Components/Input/input";
import FluencySelect from "@/app/ui/Components/Input/select";

const QuizForm = ({
  lesson,
  initialQuestionData,
  onSaveQuestion,
  onDeleteQuestion,
  onCancel,
  onAddNewQuestionRequest,
  onRequestEditQuestion
}: {
  lesson: Lesson;
  initialQuestionData: QuizQuestion | null;
  onSaveQuestion: (data: Omit<QuizQuestion, 'id'>) => void;
  onDeleteQuestion: (lesson: Lesson, questionId: string) => void;
  onCancel: () => void;
  onAddNewQuestionRequest: () => void;
  onRequestEditQuestion: (question: QuizQuestion) => void;
}) => {
  const [question, setQuestion] = useState(initialQuestionData?.question || '');
  const [options, setOptions] = useState<string[]>(initialQuestionData?.options || ['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(initialQuestionData?.correctAnswer || '');

  useEffect(() => {
    setQuestion(initialQuestionData?.question || '');
    const currentOptions = initialQuestionData?.options || [];
    setOptions([...currentOptions, ...Array(4 - currentOptions.length).fill('')].slice(0, 4));
    setCorrectAnswer(initialQuestionData?.correctAnswer || '');
  }, [initialQuestionData]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    if (correctAnswer === options[index] && value !== options[index]) {
      setCorrectAnswer('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      toast.error("A pergunta não pode estar vazia.");
      return;
    }
    const filledOptions = options.filter(opt => opt.trim() !== '');
    if (filledOptions.length < 2) {
      toast.error("Deve haver pelo menos duas opções preenchidas.");
      return;
    }
    if (!correctAnswer || !filledOptions.includes(correctAnswer)) {
      toast.error("Selecione uma resposta correta válida entre as opções preenchidas.");
      return;
    }

    onSaveQuestion({ question, options: filledOptions, correctAnswer });
  };

  return (
    <div className="space-y-6">
      <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-4 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-fluency-text-light dark:text-fluency-text-dark">
            Questões Existentes ({lesson.quiz?.length || 0})
          </h3>
          {initialQuestionData && (
            <FluencyButton
              variant="solid"
              onClick={onAddNewQuestionRequest}
            >
              <FiPlus className="mr-2 w-4 h-4" /> Nova Questão
            </FluencyButton>
          )}
        </div>

        <div className="max-h-40 overflow-y-auto space-y-2">
          {(lesson.quiz || []).length === 0 ? (
            <p className="text-sm text-fluency-text-light dark:text-fluency-text-dark">
              Nenhuma questão adicionada
            </p>
          ) : (
            (lesson.quiz || []).map(q => (
              <div key={q.id} className="flex justify-between items-center p-2 bg-fluency-bg-light dark:bg-fluency-gray-800 rounded-lg">
                <span className="text-sm text-fluency-text-light dark:text-fluency-text-dark truncate">
                  {q.question}
                </span>
                <div className="flex gap-1">
                  <FluencyButton
                    onClick={() => {
                      onAddNewQuestionRequest();
                      onRequestEditQuestion(q);
                    }}
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </FluencyButton>
                  <FluencyButton
                    onClick={() => onDeleteQuestion(lesson, q.id)}
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </FluencyButton>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-4 rounded-xl">
        <h3 className="text-lg font-semibold text-fluency-text-light dark:text-fluency-text-dark mb-4">
          {initialQuestionData ? `Editando: "${initialQuestionData.question}"` : 'Nova Questão'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <FluencyInput
            label="Pergunta"
            id="quizQuestion"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            variant="solid"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-fluency-text-light dark:text-fluency-text-dark">
              Opções de Resposta (mínimo 2 preenchidas)
            </label>
            {options.map((option, index) => (
              <FluencyInput
                key={index}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Opção ${index + 1}`}
                variant="solid"
                className="text-sm"
              />
            ))}
          </div>

          <FluencySelect
            label="Resposta Correta"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            required
            variant="solid"
          >
            <option value="" disabled>Selecione a resposta correta</option>
            {options.filter(opt => opt.trim() !== '').map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </FluencySelect>

          <div className="pt-4 border-t border-fluency-gray-200 dark:border-fluency-gray-700 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <FluencyButton
              type="button"
              onClick={onCancel}
              variant="gray"
              className="w-full sm:w-auto"
            >
              Fechar
            </FluencyButton>
            <FluencyButton
              type="submit"
              variant="confirm"
              className="w-full sm:w-auto"
            >
              {initialQuestionData ? 'Salvar Alterações' : 'Adicionar Questão'}
            </FluencyButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizForm;