import type { ReactNode } from "react";
import Typography from "@mui/material/Typography";
import Container from "$atoms/Container";

type Props = { title: ReactNode; children?: ReactNode };

export default function Problem(props: Props) {
  const { title, children } = props;
  return (
    <Container sx={{ mt: 4 }} maxWidth="md">
      <Typography variant="body1" component="section">
        <Typography variant="h4" gutterBottom={true}>
          {title}
        </Typography>
        {children}
      </Typography>
    </Container>
  );
}
