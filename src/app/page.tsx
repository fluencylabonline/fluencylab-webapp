//Pages Import
import Header from '@/app/Landing/Header/page'
import About from '@/app/Landing/About/page';
import Team from '@/app/Landing/Team/page';
import Questions from '@/app/Landing/Questions/page';
import Footer from '@/app/Landing/Footer/page';

export default function Home() {
  return (
    <div className='bg-fluency-bg-light dark:bg-fluency-bg-dark pt-1'>
        <Header />
        <About />
        <Team />
        <Questions />
        <Footer /> 
    </div>
  );
}
