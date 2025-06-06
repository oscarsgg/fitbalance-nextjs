import React from "react";
import styled from "styled-components";
import Navbar from "../../components/layout/Navbar"
import HeroSection from "../../components/sections/HeroSection"

function Header(){
    return(
        <HeaderStyled>
            <Navbar />
            <HeroSection />
        </HeaderStyled>
    )
}

const HeaderStyled = styled.header`
    width: 100%;
    background-image: url(/bg.png);
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
`

export default Header;