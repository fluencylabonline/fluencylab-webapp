'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import toast from 'react-hot-toast';

interface SignatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: FormData) => Promise<void>;
    studentName: string;
}

interface FormData {
    cpf: string;
    name: string;
    birthDate: string;
    ip: string;
    browser: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
}

const SignatureModal: React.FC<SignatureModalProps> = ({ isOpen, onClose, onSubmit, studentName }) => {
    const [formData, setFormData] = useState<FormData>({
        cpf: '',
        name: studentName || '',
        birthDate: '',
        ip: 'N/A (Client-side)',
        browser: 'N/A (Client-side)',
        address: '',
        city: '',
        state: '',
        zipCode: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [shake, setShake] = useState(false); // For validation animation

    useEffect(() => {
        if (isOpen) {
            setFormData(prev => ({ ...prev, browser: navigator.userAgent }));
            setFormData({
                cpf: '',
                name: studentName || '',
                birthDate: '',
                ip: 'N/A (Client-side)',
                browser: navigator.userAgent || 'N/A (Client-side)',
                address: '',
                city: '',
                state: '',
                zipCode: '',
            });
            setAgreedToTerms(false);
        }
    }, [isOpen, studentName]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Optional: Add formatting for CPF as the user types (e.g., xxx.xxx.xxx-xx)
        if (name === 'cpf') {
            const formattedCpf = value
                .replace(/\D/g, '') // Remove non-digits
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            setFormData(prev => ({ ...prev, [name]: formattedCpf }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // --- New Helper Functions for Validation ---

    const validateCPF = (cpf: string): boolean => {
        cpf = cpf.replace(/[^\d]+/g, ''); // Remove non-numeric characters
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
            return false;
        }

        let sum = 0;
        let remainder;

        for (let i = 1; i <= 9; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;

        if ((remainder === 10) || (remainder === 11)) {
            remainder = 0;
        }
        if (remainder !== parseInt(cpf.substring(9, 10))) {
            return false;
        }

        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }
        remainder = (sum * 10) % 11;

        if ((remainder === 10) || (remainder === 11)) {
            remainder = 0;
        }
        if (remainder !== parseInt(cpf.substring(10, 11))) {
            return false;
        }

        return true;
    };

    const isAdult = (birthDateString: string): boolean => {
        const birthDate = new Date(birthDateString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 18;
    };

    // --- Modified validateForm function ---

    const validateForm = () => {
        if (!agreedToTerms) {
            toast.error('Você deve concordar com os termos para assinar.');
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return false;
        }
        
        const requiredFields = ['name', 'cpf', 'birthDate', 'address', 'city', 'state', 'zipCode'];
        const missingFields = requiredFields.filter(field => !formData[field as keyof FormData]);
        
        if (missingFields.length > 0) {
            toast.error('Por favor, preencha todos os campos obrigatórios.');
            return false;
        }

        if (!validateCPF(formData.cpf)) {
            toast.error('CPF inválido. Por favor, verifique o número.');
            return false;
        }

        if (!isAdult(formData.birthDate)) {
            toast.error('É necessário ter 18 anos ou mais para assinar o contrato.');
            return false;
        }
        
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            try {
                const ipResponse = await fetch('https://api.ipify.org?format=json');
                if (ipResponse.ok) {
                    const ipData = await ipResponse.json();
                    formData.ip = ipData.ip;
                }
            } catch (ipError) {
                console.warn('Error fetching IP address:', ipError);
            }

            await onSubmit(formData);
        } catch (error) {
            console.error('Modal submission error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4"
                                >
                                    Assinar Contrato Digitalmente
                                </Dialog.Title>
                                <form onSubmit={handleSubmit}>
                                    <div className="mt-2 space-y-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            Confirme seus dados e digite seu nome completo como assinatura digital. Ao clicar em Assinar, você concorda com todos os termos do contrato.
                                        </p>
                                        
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome Completo (Assinatura)</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                                                />
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CPF</label>
                                                    <input
                                                        type="text"
                                                        name="cpf"
                                                        id="cpf"
                                                        value={formData.cpf}
                                                        onChange={handleChange}
                                                        required
                                                        maxLength={14} // CPF format: 000.000.000-00
                                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Nascimento</label>
                                                    <input
                                                        type="date"
                                                        name="birthDate"
                                                        id="birthDate"
                                                        value={formData.birthDate}
                                                        onChange={handleChange}
                                                        required
                                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Endereço Completo (Rua, Nº, Comp.)</label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    id="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    required
                                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                                                />
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cidade</label>
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        id="city"
                                                        value={formData.city}
                                                        onChange={handleChange}
                                                        required
                                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                                                    <input
                                                        type="text"
                                                        name="state"
                                                        id="state"
                                                        value={formData.state}
                                                        onChange={handleChange}
                                                        required
                                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CEP</label>
                                                    <input
                                                        type="text"
                                                        name="zipCode"
                                                        id="zipCode"
                                                        value={formData.zipCode}
                                                        onChange={handleChange}
                                                        required
                                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className={`flex items-center mt-4 p-3 rounded-lg border ${agreedToTerms ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'} transition-all duration-300 ${shake ? 'animate-shake border-red-500' : ''}`}>
                                            <input
                                                id="terms"
                                                name="terms"
                                                type="checkbox"
                                                checked={agreedToTerms}
                                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                                className="h-5 w-5 text-blue-600 dark:text-blue-400 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded cursor-pointer transition-colors duration-200"
                                            />
                                            <label htmlFor="terms" className="ml-3 block text-sm text-gray-900 dark:text-gray-200 cursor-pointer">
                                                Li e concordo com os termos do contrato.
                                            </label>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg disabled:opacity-50"
                                            onClick={onClose}
                                            disabled={isLoading}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="inline-flex justify-center rounded-xl border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg disabled:opacity-50"
                                            disabled={!agreedToTerms || isLoading}
                                        >
                                            {isLoading ? (
                                                <span className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Assinando...
                                                </span>
                                            ) : 'Assinar Contrato'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default SignatureModal;