"use client"

//Pages Import
import Header from '@/app/Landing/Header/page'
import About from '@/app/Landing/About/page';
import Team from '@/app/Landing/Team/page';
import Questions from '@/app/Landing/Questions/page';
import Footer from '@/app/Landing/Footer/page';

export default function Home() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <Header />
        <About />
        <Team />
        <Questions />
        <Footer />
    </main>
  );
}
