import Image from "next/image";
import Logo from '../../public/images/brand/logo.png';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">

            <p>Hello World</p>
        
            <Image
              src={Logo}
              alt="Vercel Logo"
              className="dark:invert"
              width={100}
              height={24}
              priority
            />
            
    </main>
  );
}
