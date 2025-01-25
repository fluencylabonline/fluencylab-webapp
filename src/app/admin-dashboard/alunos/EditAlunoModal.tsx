'use client';

import { db } from '@/app/firebase';
import FluencyButton from '@/app/ui/Components/Button/button';
import FluencyInput from '@/app/ui/Components/Input/input';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';
import { query, collection, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CgRemoveR } from 'react-icons/cg';
import { FaUserCircle } from 'react-icons/fa';

interface Aluno {
  CNPJ: string;
  id: string;
  name: string;
  professor: string;
  professorId: string;
  mensalidade: number;
  idioma: any;
  payments: any;
  studentMail: string;
  status: string;
  diaAula: string;
  diaPagamento: number;
  userName: string;
  profilePictureURL: any;
}

interface Professor {
  id: string;
  name: string;
}

interface EditAlunoProps {
  selectedAluno: Aluno | null;
  onClose: () => void;
}

const EditAluno: React.FC<EditAlunoProps> = ({ selectedAluno, onClose }) => {
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [selectedUserProfilePic, setSelectedUserProfilePic] = useState<string | null>(null);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string>();
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [editableAluno, setEditableAluno] = useState<Aluno | null>(null);
  const [selectedCNPJ, setSelectedCNPJ] = useState<string | null>(selectedAluno?.CNPJ || '');
  const languages = ['Português', 'Ingles', 'Espanhol', 'Libras', 'Alemão'];

  useEffect(() => {
    setSelectedCNPJ(selectedAluno?.CNPJ || '');
  }, [selectedAluno]);

  useEffect(() => {
    if (selectedAluno) {
      setEditableAluno(selectedAluno);
      setSelectedUserEmail(selectedAluno.studentMail);
    }
  }, [selectedAluno]);

  useEffect(() => {
    if (selectedAluno) {
      setSelectedUserEmail(selectedAluno.studentMail);
  
      const storage = getStorage();
      const profilePicRef = ref(storage, `profilePictures/${selectedAluno.id}`);
      const profilePicRefOther = ref(storage, `profilePictures/default-profile-picture.png`);
  
      getDownloadURL(profilePicRef)
        .then((url) => {
          setSelectedUserProfilePic(url); // Set the user's profile picture URL
        })
        .catch((error) => {
          getDownloadURL(profilePicRefOther)
            .then((defaultUrl) => {
              setSelectedUserProfilePic(defaultUrl); // Set the default profile picture
            })
            .catch((defaultError) => {
              setSelectedUserProfilePic('/profilePictures/default-profile-picture.png');
            });
        });
    }
  }, [selectedAluno]);  

  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'teacher'));
        const querySnapshot = await getDocs(q);
        const professorList: Professor[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name
        }));
        setProfessors(professorList);
      } catch (error) {
        console.error('Error fetching professors:', error);
      }
    };

    fetchProfessors();
  }, []);

  const handleChange = (field: keyof Aluno, value: any) => {
    if (editableAluno) {
      setEditableAluno({ ...editableAluno, [field]: value });
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setSelectedLanguages(newLanguage);
    if (editableAluno) {
      setEditableAluno({ ...editableAluno, idioma: newLanguage });
    }
  };  

  const saveChanges = async () => {
    if (!editableAluno) return;

    // Validate required fields
    const { mensalidade, diaPagamento, idioma } = editableAluno;
    if (!mensalidade || !diaPagamento || !idioma) {
      toast.error('Todos os campos obrigatórios devem ser preenchidos!', { position: 'top-center' });
      return;
    }

    const userRef = doc(db, 'users', editableAluno.id);
    const updatedData = {
      mensalidade: editableAluno.mensalidade,
      CNPJ: editableAluno.CNPJ,
      diaPagamento: editableAluno.diaPagamento,
      idioma: editableAluno.idioma,
      professor: selectedProfessor ? selectedProfessor.name : editableAluno.professor,
      professorId: selectedProfessor ? selectedProfessor.id : editableAluno.professorId
    };

    try {
      await updateDoc(userRef, updatedData);
      toast.success('Alterações salvas!', { position: 'top-center' });
      onClose();
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Erro ao salvar alterações!', { position: 'top-center' });
    }
  };

  const removeProfessor = async () => {
    if (!selectedAluno) return;
  
    try {
      const userRef = doc(db, 'users', selectedAluno.id);
      await updateDoc(userRef, {
        professor: '',
        professorId: ''
      });
      toast.success('Professor removido!', { position: 'top-center' });
      onClose();
    } catch (error) {
      console.error('Error removing professor:', error);
      toast.error('Erro ao remover professor!', { position: 'top-center' });
    }
  };

  if (!selectedAluno) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark rounded-lg p-6 w-full max-w-lg overflow-hidden">
        <FluencyCloseButton onClick={onClose} /> {/* Use onClose prop to close modal */}
        <h3 className="text-lg font-medium mb-4">Atualizar Informações do Aluno</h3>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex justify-center items-center">
              {selectedUserProfilePic ? (
                <Image
                  width={100}
                  height={100}
                  priority
                  src={selectedUserProfilePic || '/profilePictures/default-profile-picture.png'}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <FaUserCircle className="text-4xl text-gray-500" />
              )}
            </div>
            <div>
              <p className="text-md font-semibold">{selectedAluno.name}</p>
              <p className="text-sm text-gray-600">{selectedUserEmail}</p>
            </div>
          </div>

          <div>
            <p className='text-xs font-semibold'>Mensalidade:</p>
            <FluencyInput
              placeholder="Mensalidade"
              type="number"
              value={editableAluno?.mensalidade}
              onChange={(e) => handleChange('mensalidade', Number(e.target.value))}
            />
          </div>

          <div>
            <p className='text-xs font-semibold'>Dia Pagamento:</p>
            <FluencyInput
              placeholder="Dia de Pagamento"
              type="number"
              value={editableAluno?.diaPagamento}
              onChange={(e) => handleChange('diaPagamento', Number(e.target.value))}
            />
          </div>

          <div>
            <p className='text-xs font-semibold'>Idioma:</p>
            <select
              value={editableAluno?.idioma || ''}
              onChange={handleLanguageChange}
              className="ease-in-out duration-300 w-full pl-4 pr-3 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"
            >
              <option value="">Selecione um idioma</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <p className='text-xs font-semibold'>Pagamento para:</p>
              <select
                className='ease-in-out duration-300 w-full pl-4 pr-3 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800'
                value={selectedAluno?.CNPJ || ''}
                onChange={(e) => handleChange('CNPJ', e.target.value )}
                >
                  <option value="">Selecione o CNPJ</option>
                  <option value="55.450.653/0001-64">Deise Laiane</option>
                  <option value="47.603.142/0001-07">Matheus Fernandes</option>
              </select>  
          </div>

          {selectedAluno.professor === '' && selectedAluno.professorId === '' ? (
            <div>
              <p className='text-xs font-semibold'>Professor</p>
              <select
                value={selectedProfessor ? selectedProfessor.id : ''}
                onChange={(e) => {
                  const selectedProf = professors.find(prof => prof.id === e.target.value) || null;
                  setSelectedProfessor(selectedProf);
                }}
                className='ease-in-out duration-300 w-full pl-4 pr-3 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-yellow-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800'
              >
                <option value="">Selecionar Professor</option>
                {professors.map((prof) => (
                  <option key={prof.id} value={prof.id}>{prof.name}</option>
                ))}
              </select>
            </div>
          ):(
            <div>
                <p className='text-xs font-semibold'>Professor Atual</p>
              <div className='flex flex-row gap-2 items-center bg-fluency-pages-light dark:bg-fluency-pages-dark p-2 px-3 rounded-md'>
                <p>{selectedAluno.professor}</p>
                <button onClick={removeProfessor}><CgRemoveR className='w-4 h-auto text-fluency-red-500 hover:text-fluency-red-700 duration-300 ease-in-out' /></button>
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-end">
            <FluencyButton variant="confirm" onClick={saveChanges}>
              Salvar
            </FluencyButton>
            <FluencyButton variant="gray" onClick={onClose}>
              Cancelar
            </FluencyButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAluno;
