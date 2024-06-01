import React, { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import FluencyButton from '@/app/ui/Components/Button/button';

const PasswordModal = ({ onLoginSubmit }) => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isLoginCorrect = await onLoginSubmit(login, password);
        if (!isLoginCorrect) {
            setErrorMessage('Login ou senha incorretos. Por favor, tente novamente.');
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="flex flex-col items-center justify-center bg-fluency-bg-light dark:bg-fluency-bg-dark p-8 rounded-md shadow-lg">
                <h2 className="text-lg font-bold mb-4">Insira o Login e a Senha</h2>
                <form className='flex flex-col items-center justify-center' onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Login"
                        value={login}
                        onChange={(e) => {
                            setLogin(e.target.value);
                            setErrorMessage('');
                        }}
                        className="border p-2 mb-4 w-full"
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setErrorMessage('');
                        }}
                        className="border p-2 mb-6 w-full"
                    />
                    <FluencyButton variant='confirm' type="submit">Entrar</FluencyButton>
                </form>
                {errorMessage && <p className="bg-fluency-red-600 p-2 px-3 rounded-md text-white mt-2 text-center text-sm">{errorMessage}</p>}
            </div>
            <Toaster />
        </div>
    );
};

export default PasswordModal;
