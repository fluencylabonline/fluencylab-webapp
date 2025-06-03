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
  Column,
} from "@react-email/components";
import * as React from "react";
import { CSSProperties } from "react";

interface ClassCanceledByStudentProps {
  professorEmail?: string;
  studentName?: any;
  studentMail?: string;
  selectedDate?: string;
  selectedTimeSlot?: {
    startTime: string;
  };
}

export const ClassCanceledByStudent = ({
  professorEmail,
  studentName,
  studentMail,
  selectedDate,
  selectedTimeSlot,
}: ClassCanceledByStudentProps) => (
  <Html>
    <Head />
    <Preview>O aluno {studentName} cancelou uma aula</Preview>
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

        <Heading style={heading}>Cancelamento de Aula</Heading>

        <Section style={buttonContainer}>
          <Text style={paragraph}>
            Olá, professor(a). O aluno <strong>{studentName}</strong> cancelou a aula que estava marcada para o dia <strong>{selectedDate}</strong> às <strong>{selectedTimeSlot?.startTime}</strong>.
          </Text>

          <Text style={paragraph}>
            E-mail do aluno: <code style={code}>{studentMail}</code>
          </Text>

          <Text style={paragraph}>
            Essa informação foi registrada e a equipe FluencyLab acompanhará o reagendamento.
          </Text>
        </Section>

        <Hr style={hr} />

        <Section style={container}>
          <Text style={paragraph}>
            Grande abraço, <br />
            Equipe FluencyLab.
          </Text>
          <Text style={reportLink}>
            Por favor, não responda esse e-mail, pois ele foi enviado automaticamente.
          </Text>
        </Section>

        <Section>
          <Text style={paragraph}>Nossas redes sociais:</Text>
          <Column>
            <Link href="https://www.instagram.com/fluency.lab">
              <Img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/150px-Instagram_logo_2022.svg.png"
                width="32"
                height="32"
                alt="Instagram"
              />
            </Link>
          </Column>
        </Section>

        <Link href="https://fluencylab.online" style={reportLink}>
          fluencylab.online
        </Link>
      </Container>
    </Body>
  </Html>
);

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
  fontSize: "13px",
  borderRadius: "4px",
  color: "#3c4149",
};
