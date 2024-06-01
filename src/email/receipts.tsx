import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Text,
    Img
  } from "@react-email/components";
  import * as React from "react";
  import Logo from '../../public/images/brand/logo.png';
  
  interface ComprovanteProps{
    paymentKeyProp?: string;
    selectedMonth?: string;
    studentName?: string;
    selectedYear?: string;
    mensalidade?: string;
  }
  
  export const Receipts = ({
    paymentKeyProp, selectedMonth, studentName, mensalidade, selectedYear
  }: ComprovanteProps ) => (
    
    <Html>
        <Head />
        <Preview>Pagamento de mensalidade</Preview>
        <Body style={main}>
        <Container style={container}>
            <Section className="mt-[32px]">
              <Img
                src={`https://www.fluencylab.online/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ficon-logodark.556b50ff.png&w=640&q=75`}
                width="100"
                height="100"
                alt="FluencyLab"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading style={heading}>Olá {studentName}, nós recebemos seu pagamento!</Heading>
            <Section style={buttonContainer}>
            <Text style={paragraph}>
            Recebemos o pagamento no valor de R$ {mensalidade},00 referente à {selectedMonth} de {selectedYear} com o código de referência: 
            </Text>
            <code style={code}>{paymentKeyProp}</code>
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
            </Section>
  
            <Link href="https://fluencylab.online" style={reportLink}>
            FluencyLab
            </Link>
        </Container>
        </Body>
    </Html>
  )
  
  export default Receipts;
  
  
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