import { useCallback, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import {
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from "@mui/material"
import homeActivityService from "../features/homeActivities/homeActivityService"

const errorMessage = (error) => error.response?.data?.message || error.message

function MyParents() {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const token = user?.token

  const [parents, setParents] = useState([])
  const [search, setSearch] = useState("")
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setParents((await homeActivityService.getMyParents(token)).data)
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!user) return navigate("/login")
    load()
  }, [user, navigate, load])

  useEffect(() => {
    if (search.trim().length < 2) return setResults([])
    const timer = setTimeout(() => {
      homeActivityService
        .searchParents(token, search.trim())
        .then((res) => setResults(res.data))
        .catch((error) => toast.error(errorMessage(error)))
    }, 400)
    return () => clearTimeout(timer)
  }, [token, search])

  const onRequest = async (parentId) => {
    try {
      await homeActivityService.requestParent(token, parentId)
      toast.success("Permintaan dikirim, menunggu persetujuan orang tua")
      setSearch("")
      load()
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  const onRemove = async (parentId) => {
    try {
      await homeActivityService.removeParent(token, parentId)
      load()
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  if (isLoading) {
    return (
      <Grid align='center' sx={{ pt: 5 }}>
        <CircularProgress />
      </Grid>
    )
  }

  const linkedIds = parents.map((p) => String(p.parentId))

  return (
    <>
      <Typography variant='h6' align='center' sx={{ mb: 2 }}>
        Orang Tua
      </Typography>
      <Typography variant='caption' color='text.secondary'>
        Orang tua yang terhubung dan disetujui yang bisa mencentang kegiatan rumahmu.
      </Typography>

      {parents.map((parent) => (
        <Card key={parent.parentId} variant='outlined' sx={{ mt: 1 }}>
          <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
            <Grid container alignItems='center' wrap='nowrap'>
              <Grid item xs>
                <Typography variant='body2'>
                  <b>{parent.name}</b>
                </Typography>
                <Chip
                  size='small'
                  label={parent.status === "APPROVED" ? "Terhubung" : "Menunggu persetujuan"}
                  color={parent.status === "APPROVED" ? "success" : "default"}
                />
              </Grid>
              <Button size='small' color='error' onClick={() => onRemove(parent.parentId)}>
                {parent.status === "APPROVED" ? "Putuskan" : "Batalkan"}
              </Button>
            </Grid>
          </CardContent>
        </Card>
      ))}

      <Typography variant='subtitle2' sx={{ mt: 3, mb: 1 }}>
        <b>Hubungkan ke orang tua</b>
      </Typography>
      <TextField
        fullWidth
        size='small'
        label='Cari nama orang tua (min. 2 huruf)'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {results
        .filter((r) => !linkedIds.includes(String(r.id)))
        .map((result) => (
          <Grid container alignItems='center' key={result.id} sx={{ mt: 0.5 }}>
            <Grid item xs>
              <Typography variant='body2'>{result.name}</Typography>
            </Grid>
            <Button size='small' onClick={() => onRequest(result.id)}>Ajukan</Button>
          </Grid>
        ))}
      <div style={{ height: 80 }} />
    </>
  )
}

export default MyParents
