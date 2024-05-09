'use client';

//NextImports
import Link from 'next/link'
import Image from "next/image"

//Images
import IconLogoDark from '../../../../public/images/brand/icon-logodark.png'
import IconLogoLight from '../../../../public/images/brand/icon-logolight.png'
import LandingHeader from '../../../../public/images/landing/landing-header-image.png'

export default function HeaderLanding(){
    return(
        <div>

            <Link href={'/signin'} >Login Page</Link>

            <Image
              src={IconLogoDark}
              alt="IconLogoDark"
              priority
            /> 

            <Image
              src={IconLogoLight}
              alt="IconLogoDark"
              priority
            /> 

            <Image
              src={LandingHeader}
              alt="IconLogoDark"
              priority
            /> 
        </div>
    );
}