'use client';
import { DocusealForm } from '@docuseal/react';
import { useSession } from 'next-auth/react';

export default function Contrato() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p>Carregando informações</p>;
  }

  if (!session) {
    return <p>Faça o login para continuar.</p>;
  }

  return (
    <div className='flex flex-col w-full'>
      <div className='flex flex-col w-full text-center'>
        <h1>FluencyLab Contrato de Aulas</h1>
        <DocusealForm
          src="https://docuseal.co/d/nTfYew1JkgCck5"
          email={session.user.email}
        />
      </div>
    </div>
  );
}
