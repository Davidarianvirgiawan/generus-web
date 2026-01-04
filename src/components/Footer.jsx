import styled from "@emotion/styled"
import { Button, Grid, Typography } from "@mui/material"
import ChatIcon from "@mui/icons-material/Chat" // Import the chat icon

const FeedbackButton = styled(Button)({
  backgroundColor: "#eff2ef", // Adjust the color to match the button background color in your image
  color: "#76859B",
  padding: "5px 10px",
  textTransform: "none",
  fontSize: 12, // Set your desired font size
  fontWeight: "none",
  boxShadow: "none",
  borderRadius: "100px", // Adds rounded corners. Adjust this value to increase or decrease the roundness
  "&:hover": {
    backgroundColor: "#eff2ef", // Darker shade for hover effect
    boxShadow: "none",
  },
})

const openInNewTab = (url) => {
  window.open(url, "_blank", "noreferrer")
}

function Footer() {
  return (
    <Grid
      container
      spacing={2}
      paddingTop={10}
      paddingBottom={10}
      textAlign='center'
    >
      <Grid item xs={12}>
        <Typography sx={{ color: "#76859B", fontSize: 12 }}>
          <b translate='no'>GENERUSKU</b> | Pusat Informasi Generus Belopa
          I
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <FeedbackButton
          variant='contained'
          startIcon={<ChatIcon />}
          size='small'
          onClick={() => openInNewTab("https://forms.gle/aKzq8NPP3nEeB8wQ6")}
        >
          Saran & Pertanyaan
        </FeedbackButton>
      </Grid>
    </Grid>
  )
}

export default Footer
