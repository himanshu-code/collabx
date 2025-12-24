"use client";

import { Box, Button, Typography, Paper } from "@mui/material";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  async function login() {
    await signInWithPopup(auth, new GoogleAuthProvider());
    router.push("/");
  }

  return (
    <Box height="100vh" display="flex" alignItems="center" justifyContent="center">
      <Paper sx={{ width: 420, p: 3 }}>
        <Typography variant="h6" mb={2}>
          Sign in to Syncboard
        </Typography>

        <Button fullWidth variant="contained" onClick={login}>
          Continue with Google
        </Button>
      </Paper>
    </Box>
  );
}
