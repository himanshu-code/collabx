import React from 'react'
import {Box,Typography} from '@mui/material'

const page = ({params}:{params:{fileId:string}}) => {
  return (
    <Box height="100vh" display="flex" justifyContent="center" alignItems="center">
      <Typography >Editing File ID: {params.fileId}</Typography>
    </Box>
  )
}

export default page