//Pages Import
import Team from '@/app/Landing/Team/page';
import Questions from '@/app/Landing/Questions/page';
import Footer from '@/app/Landing/Footer/page';

import NewHeader from './NewLanding/Header';
import NewAbout from './NewLanding/NewAbout';

export default function Home() {

  return (
    <div className='bg-fluency-bg-light dark:bg-fluency-bg-dark pt-1'>
        <NewHeader />
        <NewAbout />
        <Team />
        <Questions />
        <Footer />
    </div>
  );
}
