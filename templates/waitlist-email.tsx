import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";
import * as React from "react";

interface WaitlistEmailProps {
  name: string;
}

export const WaitlistEmail = ({ name }: WaitlistEmailProps) => (
  <Html>
    <Head />
    <Preview>
      ¡Gracias por unirte a nuestra lista de espera y por tu paciencia!✨
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Próximamente en Skrapy.io 🚀 </Heading>
        <Text style={text}>
         Gracias {name} por unirte a nuestra lista de espera y por tu paciencia. Te enviaremos un mensaje cuando tengamos novedades que compartir. ¡Estamos emocionados de tenerte a bordo! 🚀✉️
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#000000",
  margin: "0 auto",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
  margin: "auto",
  padding: "96px 20px 64px",
};

const h1 = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "40px",
  margin: "0 0 20px",
};

const text = {
  color: "#aaaaaa",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0 0 40px",
};
