import React, { Suspense } from 'react';
import TicTacToe from './TicTacToe'; // Adjust the import path as necessary

const Page = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <TicTacToe />
  </Suspense>
);

export default Page;
