import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

interface EmailProps {
  emailContent: {
    subject: string;
    heading: string;
    buttonName: string;
    buttonLink: string;
    content: string;
  };
}

export const TestingEmail = ({
  emailContent,
}: EmailProps): React.ReactElement => (
  <Html>
    <Body style={body}>
      <Container style={container}>
        {emailContent.heading !== "" && (
          <Heading style={h1}>{emailContent.heading}</Heading>
        )}
        <Text style={text}>
          <div dangerouslySetInnerHTML={{ __html: emailContent.content }} />
        </Text>
        {emailContent.buttonName !== "" && (
          <Button style={button} href={emailContent.buttonLink}>
            {emailContent.buttonName}
          </Button>
        )}
      </Container>
    </Body>
  </Html>
);

const body = {
  backgroundColor: "#fff",
  margin: "20px auto",
  color: "#000",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
  margin: "auto",
  padding: "50px 25px",
  textAlign: "center",
};

const h1 = {
  color: "#000",
  fontSize: "20px",
  lineHeight: "28px",
  fontWeight: "600",
};

const text = {
  color: "#aaaaaa",
  fontSize: "20px",
  lineHeight: "28px",
};

const button = {
  backgroundColor: "#000",
  color: "#fff",
  fontSize: "14px",
  lineHeight: "20px",
  fontWeight: "600",
  padding: "14px 32px 16px 32px",
  borderRadius: "8px",
  marginTop: "25px",
  display: "inline-block",
  textDecoration: "none",
};
