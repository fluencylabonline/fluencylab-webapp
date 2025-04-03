import React, { useState, useEffect } from 'react';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import PropTypes from 'prop-types';
import { useSession } from 'next-auth/react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { TbPencilCheck } from "react-icons/tb";

const MODEL_NAME = process.env.NEXT_PUBLIC_GEMINI_MODEL;
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

const TranslationComponent = ({ node, updateAttributes }) => {
  const [userTranslation, setUserTranslation] = useState(node.attrs.userTranslation || '');
  const [feedback, setFeedback] = useState(node.attrs.feedback || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Track if the component is in editing mode
  const [editedSentence, setEditedSentence] = useState(node.attrs.originalSentence);
  const { originalSentence, sentenceNumber } = node.attrs;
  const { data: session } = useSession(); // Use session to check if user is admin
  const isAdmin = session?.user?.role === 'admin'; // Assuming 'role' determines admin status

  const handleChange = (e) => {
    setUserTranslation(e.target.value);
  };

  const checkTranslation = async () => {
    setIsLoading(true);
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 500,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const prompt = `
      Verifique se a tradução em Português fornecida pelo usuário para a frase ${sentenceNumber}: "${originalSentence}" está correta.
      Tradução do usuário: "${userTranslation}".
      Retorne "Correta" se a tradução estiver correta ou "Incorreta: [feedback]" se não estiver correta.
    `;

    try {
      const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [],
      });

      const result = await chat.sendMessage(prompt);
      const responseText = result.response.text();

      let newFeedback = '';
      if (responseText.includes('Correta')) {
        newFeedback = 'Muito bem! 🎉';
      } else if (responseText.includes('Incorreta')) {
        const feedbackText = responseText.replace('Incorreta:', '').trim();
        newFeedback = `Incorreto. ${feedbackText} ❌`;
      } else {
        newFeedback = 'Could not determine the correctness of the translation.';
      }

      // Update node attributes with feedback and user translation
      updateAttributes({
        userTranslation,
        feedback: newFeedback,
      });

      setFeedback(newFeedback);
    } catch (error) {
      console.error('Error checking translation:', error);
      setFeedback('An error occurred while checking the translation.');
      updateAttributes({
        userTranslation,
        feedback: 'An error occurred while checking the translation.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true); // Enable editing mode
  };

  const handleSave = () => {
    if (editedSentence.trim() !== originalSentence.trim()) {
      updateAttributes({
        originalSentence: editedSentence, // Update the sentence
      });
    }
    setIsEditing(false); // Exit editing mode
  };

  const handleCancel = () => {
    setEditedSentence(originalSentence); // Revert changes if canceled
    setIsEditing(false); // Exit editing mode
  };

  return (
    <NodeViewWrapper className="react-component">
      <div className="flex flex-col items-start w-full ml-3">
        <div className="flex flex-row gap-3 items-start">
          <p className="flex flex-row items-end gap-2">
            <strong>{sentenceNumber}. </strong>
            {isEditing ? (
              <textarea
                className="border w-full pl-1"
                value={editedSentence}
                onChange={(e) => setEditedSentence(e.target.value)}
                rows="1"
              />
            ) : (
              originalSentence
            )}
          </p>
          <strong> - </strong>
          <input
            type="text"
            className="bg-transparent border-b-2 border-dotted outline-none pl-2 focus:border-fluency-blue-500"
            value={userTranslation}
            onChange={handleChange}
            placeholder="Escreva a tradução aqui"
          />
          <button
            onClick={checkTranslation}
            className="bg-fluency-green-500 hover:bg-fluency-green-700 transition-all duration-200 ease-in-out text-white px-1 py-1 rounded-md"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg
                className="text-gray-300 animate-spin"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
              >
                <path
                  d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
                  stroke="currentColor"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
                  stroke="currentColor"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-fluency-green-700"
                ></path>
              </svg>
            ) : (
              <TbPencilCheck />
            )}
          </button>
        </div>

        {feedback && (
            <div className="flex flex-col justify-center items-center mb-2">
              <p
                className={`${
                  feedback.includes('Muito bem') ? 'text-green-500' : 'text-red-500'
                } font-bold text-sm`}
              >
                {feedback}
              </p>
            </div>
          )}

        {isAdmin && (
          <div className="my-2">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="bg-yellow-500 text-white px-2 py-1 rounded-md text-sm font-bold"
              >
                Editar
              </button>
            ) : (
              <div>
                <button
                  onClick={handleSave}
                  className="bg-green-500 text-white px-2 py-1 rounded-md text-sm font-bold"
                >
                  Salvar
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-red-500 text-white px-2 py-1 rounded-md text-sm font-bold ml-2"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        )}
        <NodeViewContent />
      </div>
    </NodeViewWrapper>
  );
};

TranslationComponent.propTypes = {
  node: PropTypes.shape({
    attrs: PropTypes.shape({
      originalSentence: PropTypes.string.isRequired,
      sentenceNumber: PropTypes.number.isRequired,
      userTranslation: PropTypes.string,
      feedback: PropTypes.string,
    }).isRequired,
  }).isRequired,
  updateAttributes: PropTypes.func.isRequired,
};

export default TranslationComponent;
