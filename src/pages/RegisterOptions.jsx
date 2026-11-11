import { Button, Card, CardContent, Grid, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

function RegisterOptions() {
  const navigate = useNavigate()

  return (
    <>
      <Typography align='center' variant="h4">
        Registrasi
      </Typography>

      <Grid>
        <Card variant="" style={{ maxWidth: 650, padding: "0 5px", margin: "0 auto" }}>
          <CardContent>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Button
                  onClick={() => navigate('/c/register/generus')}
                  size="large"
                  style={{ margin: "10px auto", textTransform: 'none' }}
                  type="submit"
                  variant="contained"
                  color="info"
                  fullWidth
                >Sebagai Generus
                </Button>
                <Button
                  onClick={() => navigate('/c/register/muballigh')}
                  size="large"
                  style={{ margin: "10px auto", textTransform: 'none' }}
                  type="submit"
                  variant="contained"
                  color="info"
                  fullWidth
                >Sebagai Pengajar
                </Button>
              </Grid>
            </Grid>
              <Typography pt={3}>Catatan:</Typography>
            <Grid container>
              <Grid item xs={1}>
                <Typography variant='subtitle2'>1.</Typography>
              </Grid>
              <Grid item xs={11}>
                <Typography variant='subtitle2'>Generus registrasi "Sebagai Generus".</Typography>
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={1}>
                <Typography variant='subtitle2'>2.</Typography>
              </Grid>
              <Grid item xs={11}>
                <Typography variant='subtitle2'>Muballigh/muballighot registrasi "Sebagai Pengajar".</Typography>
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={1}>
                <Typography variant='subtitle2'>3.</Typography>
              </Grid>
              <Grid item xs={11}>
                <Typography variant='subtitle2'>Generus yang sudah lulus tes muballigh registrasi "Sebagai Generus" dan "Sebagai Pengajar".</Typography>
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={1}>
                <Typography variant='subtitle2'>4.</Typography>
              </Grid>
              <Grid item xs={11}>
                <Typography variant='subtitle2'>Orang tua registrasi "Sebagai Generus", lalu pilih posisi "ORANGTUA".</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </>
  )
}

export default RegisterOptions