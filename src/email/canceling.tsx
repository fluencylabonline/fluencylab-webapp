import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Text,
    Img,
    Column
  } from "@react-email/components";
  import * as React from "react";
  
  interface ComprovanteProps{
    studentName?: string;
  }
  
  export const Canceling = ({
    studentName
  }: ComprovanteProps ) => (
    
    <Html>
        <Head />
        <Preview>Recibo</Preview>
        <Body style={main}>
        <Container style={container}>
            <Section className="mt-[32px]">
              <Img
                src={`https://firebasestorage.googleapis.com/v0/b/fluencylab-webapp.appspot.com/o/Brand%2FIconDark.png?alt=media&token=6d3b8b33-9e43-4c45-a9d0-74a51bb78b8d`}
                width="100"
                height="100"
                alt="FluencyLab"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading style={heading}>Olá {studentName}, nós recebemos seu pagamento da taxa de cancelamento!</Heading>
            <Section style={buttonContainer}>
            <Text style={paragraph}>
            Uma pena que você está deixando a gente por agora! Lembre que pode sempre contar com nossa ajuda no seu aprendizado. Obrigado por essa jornada.
            </Text>
            <code style={code}>Esperamos ver você de novo em breve.</code>
            </Section>
            <Hr style={hr} />
  
            <Section style={container}>
            <Text style={paragraph}>
            Grande Abraço, <br></br>
            Equipe FluencyLab. 
            </Text>
            <Text style={reportLink}>
            Por favor, pedimos que você não responda esse e-mail, pois se trata de uma mensagem automática e não é possível dar continuidade ao seu atendimento por aqui.
            </Text>
            </Section>
  
            <Section>
              Nossas redes sociais:
              <Column>
                <Link href="https://www.instagram.com/fluency.lab">
                  <Img
                    src={`https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/150px-Instagram_logo_2022.svg.png`}
                    width="32"
                    height="32"
                    alt="Slack"
                  />
                </Link>
              </Column>
            </Section>
  
            <Link href="https://fluencylab.online" style={reportLink}>
            FluencyLab
            </Link>
        </Container>
        </Body>
    </Html>
  )
  
  export default Canceling;
  
  
  const main = {
    backgroundColor: "#ffffff",
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  };
  
  const container = {
    margin: "0 auto",
    padding: "20px 0 48px",
    maxWidth: "560px",
  };
  
  const heading = {
    fontSize: "24px",
    letterSpacing: "-0.5px",
    lineHeight: "1.3",
    fontWeight: "400",
    color: "#484848",
    padding: "17px 0 0",
  };
  
  const paragraph = {
    margin: "0 0 15px",
    fontSize: "15px",
    lineHeight: "1.4",
    color: "#3c4149",
  };
  
  const buttonContainer = {
    padding: "27px 0 27px",
  };
  
  const reportLink = {
    fontSize: "14px",
    color: "#b4becc",
  };
  
  const hr = {
    borderColor: "#dfe1e4",
    margin: "42px 0 26px",
  };
  
  const code = {
    fontFamily: "monospace",
    fontWeight: "700",
    padding: "1px 4px",
    backgroundColor: "#dfe1e4",
    letterSpacing: "-0.3px",
    fontSize: "21px",
    borderRadius: "4px",
    color: "#3c4149",
  };