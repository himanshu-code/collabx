"use client";
import Link from "next/link";
import { Box, Button, Typography } from "@mui/material";
import { createDocument } from "@/lib/createDocument";
import { useRouter } from "next/navigation";

export default function DashboardHome() {
  const router = useRouter();
  const handleCreateDocument = async () => {
    const newDoc = await createDocument();
    console.log(newDoc);

    router.push(`/editor/${newDoc.documentId}`);
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      p={4}
    >
      <Box textAlign="center" maxWidth={600}>
        <Typography variant="h4" gutterBottom>
          No document selected
        </Typography>
        <Typography color="text.secondary" mb={3}>
          Select a document from the sidebar or create a new one to get started.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateDocument}
        >
          Create a new document
        </Button>
      </Box>
    </Box>
  );
}
