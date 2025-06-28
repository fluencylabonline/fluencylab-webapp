import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Column,
} from "@react-email/components";
import * as React from "react";

interface ContractConfirmationEmailProps {
  recipientName?: string;
  contractTitle?: string;
  companyName?: string;
  contactEmail?: string;
}

export const ContractConfirmationEmail = ({
  recipientName = "Cliente",
  contractTitle = "Contrato de Prestação de Serviços",
  companyName = "FluencyLab",
  contactEmail = "contato@fluencylab.online",
}: ContractConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>{contractTitle} anexado</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={{ textAlign: "center" }}>
          <Img
            src="https://firebasestorage.googleapis.com/v0/b/fluencylab-webapp.appspot.com/o/Brand%2FIconDark.png?alt=media&token=6d3b8b33-9e43-4c45-a9d0-74a51bb78b8d"
            width="100"
            height="100"
            alt={companyName}
          />
        </Section>

        <Heading style={heading}>Olá {recipientName},</Heading>

        <Text style={paragraph}>
          Esperamos que você esteja bem. Em anexo, você encontrará o documento{" "}
          <strong>{contractTitle}</strong> referente ao seu acordo com o{" "}
          <strong>{companyName}</strong>.
        </Text>

        <Text style={paragraph}>
          Por favor, leia atentamente o conteúdo do contrato. Se estiver de
          acordo, siga as instruções contidas no documento para assinatura
          (digital ou impressa, conforme indicado).
        </Text>

        <Text style={paragraph}>
          Caso tenha qualquer dúvida ou precise de suporte, entre em contato
          conosco pelo e-mail{" "}
          <Link href={`mailto:${contactEmail}`}>{contactEmail}</Link>.
        </Text>

        <Hr style={hr} />

        <Text style={paragraph}>
          Atenciosamente, <br />
          Equipe {companyName}
        </Text>

        <Section>
          <Text style={reportLink}>
            Esta é uma mensagem automática. Por favor, não responda diretamente
            a este e-mail.
          </Text>
        </Section>

        <Section>
          Siga-nos:
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
          {companyName}
        </Link>
      </Container>
    </Body>
  </Html>
);

export default ContractConfirmationEmail;

// Styles
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

const reportLink = {
  fontSize: "14px",
  color: "#b4becc",
};

const hr = {
  borderColor: "#dfe1e4",
  margin: "42px 0 26px",
};
