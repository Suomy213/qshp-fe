import { Box, Typography } from '@mui/material'

import chipColor from './color'

interface Props {
  text: string
  size?: 'small' | 'medium' | 'large'
  type?: string
  className?: string
}

const Chip = ({ text, size, type = 'threadType', className }: Props) => {
  const size2 = size || 'medium'
  const typographyFontSize = size == 'large' ? 13 : 11
  return (
    <Box
      mr={{ small: 0.5, medium: 0.5, large: 1 }[size2]}
      className={`rounded text-white ${className}`}
      sx={{
        display: 'inline-block',
        backgroundColor: chipColor('background', type),
      }}
    >
      <Typography
        px={{ small: 0.6, medium: 0.6, large: 1.25 }[size2]}
        py={{ small: 0.15, medium: 0.15, large: 0.5 }[size2]}
        variant="subtitle2"
        fontSize={typographyFontSize}
        sx={{ color: chipColor('text', type) }}
      >
        {text}
      </Typography>
    </Box>
  )
}

export default Chip
