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

            <Image
              src={IconLogoDark}
              alt="IconLogoDark"
              width={100}
              height={100}
              priority
            /> 

            <Image
              src={IconLogoLight}
              alt="IconLogoDark"
              width={100}
              height={100}
              priority
            /> 

            <Image
              src={LandingHeader}
              alt="IconLogoDark"
              width={100}
              height={100}
              priority
            /> 
        </div>
    );
}