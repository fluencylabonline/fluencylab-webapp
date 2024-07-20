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
import { CSSProperties } from "react";

interface ComprovanteProps{
  studentName?: string;
  userName?: string;
}

export const Welcome = ({
  studentName, userName
}: ComprovanteProps ) => (
  
  <Html>
      <Head />
      <Preview>Seja bem-vindo!</Preview>
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
          <Heading style={heading}>Olá {userName}, seja bem-vindo à FluencyLab!</Heading>
          <Section style={buttonContainer}>
          <Text style={paragraph}>
          Queremos te receber e passar algumas informações importantes.
          </Text>
          <Text style={paragraph}>
            Primeiro, seu login e senha para acessar a plataforma em www.fluencylab.me <br/> A senha você pode mudar depois. 
          </Text>
            <code style={code}>Login: {studentName}</code>
            <br/><code style={code}>Senha: seu telefone, 8 últimos dígitos sem o -</code>

            <Hr style={hr} />

          <Text style={subtitle}>Contrato</Text>
          <Text style={paragraphTwo}>
          Informações de pagamento e o contrato vão ser encontrados assim que fizer seu primeiro login. Qualquer outra dúvida pode entrar em contato com a gente (86) 9 9953-5791.
          </Text>

          <Text style={subtitle}>Remarcações</Text>
          <Text style={paragraphTwo}>
          As remarcações também serão feitas pela plataforma, os horários disponíveis do seu professor vão aparecer lá. <br/> Cada aluno tem direito a uma remarcação por mês, que não é cumulativa. <br/> 
          </Text>
          <Text style={paragraphTwo}>Além disso, os pagamentos são feitos sempre no começo de cada mês. <br /> Para mais informações, acesse o seu contrato ou tire suas dúvidas pelo WhatsApp.
          </Text>
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

export default Welcome;


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

const subtitle = {
  fontSize: "17px",
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

const paragraphTwo: CSSProperties = {
  margin: "0 0 15px",
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#3c4149",
  textAlign: "justify",
  marginLeft: "5px",
  marginRight: "5px",
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
  fontSize: "10px",
  borderRadius: "4px",
  color: "#3c4149",
};