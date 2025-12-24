"use client"
import React from 'react'
import {Box,Typography} from '@mui/material'
import Protected from '@/components/Protected'

const page = () => {
  return (
    <Protected>
    <Box p={3}>
      <Typography variant="h5">Dashboard</Typography>
    </Box>
    </Protected>
  )
}

export default page