'use client';
import React, { useEffect } from 'react';
import './NotAuthorized.scss';
import Link from 'next/link';

export default function NotAuthorized() {
    const interval = 500;

    useEffect(() => {
        function generateLocks() {
            const lock = document.createElement('div');
            const position = generatePosition();
            lock.innerHTML = '<div class="top"></div><div class="bottom"></div>';
            lock.style.top = position[0];
            lock.style.left = position[1];
            lock.className = 'lock generated';
            document.body.appendChild(lock);
            setTimeout(() => {
                lock.style.opacity = '1';
            }, 100);
            setTimeout(() => {
                lock.parentElement?.removeChild(lock);
            }, 2000);
        }
        

        function generatePosition() {
            const x = Math.round(Math.random() * 100 - 10) + '%';
            const y = Math.round(Math.random() * 100) + '%';
            return [x, y];
        }

        const intervalId = setInterval(generateLocks, interval);
        generateLocks();

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="container">
            <h1>
                4
                <div className="lock">
                    <div className="top"></div>
                    <div className="bottom"></div>
                </div>
                3
            </h1>
            <p>Acesso negado</p>
            <Link href={'/'}><p>Página Inicial</p></Link>
        </div>
    );
}
