import { useCallback, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import {
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/DeleteOutlineRounded"
import EditIcon from "@mui/icons-material/EditOutlined"
import homeActivityService from "../features/homeActivities/homeActivityService"

const errorMessage = (error) => error.response?.data?.message || error.message
const emptyForm = { id: null, type: "CORE", groupName: "", name: "" }

function ManageHomeActivities() {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const token = user?.token
  const isAdmin = user?.currentPosition?.type === "ADMIN"

  const [activities, setActivities] = useState([])
  const [form, setForm] = useState(emptyForm)

  const loadActivities = useCallback(() => {
    homeActivityService
      .list(token)
      .then((res) => setActivities(res.data))
      .catch((error) => toast.error(errorMessage(error)))
  }, [token])

  useEffect(() => {
    if (!user) return navigate("/login")
    if (!isAdmin) return navigate("/")
    loadActivities()
  }, [user, isAdmin, navigate, loadActivities])

  const run = async (action, successMessage) => {
    try {
      await action()
      toast.success(successMessage)
      return true
    } catch (error) {
      toast.error(errorMessage(error))
      return false
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      type: form.type,
      groupName: form.groupName,
      name: form.type === "CORE" ? form.name : undefined,
    }
    const ok = await run(
      () =>
        form.id
          ? homeActivityService.update(token, form.id, payload)
          : homeActivityService.create(token, payload),
      "berhasil."
    )
    if (ok) {
      setForm(emptyForm)
      loadActivities()
    }
  }

  const onEdit = (activity) =>
    setForm({
      id: activity.id,
      type: activity.type,
      groupName: activity.groupName,
      name: activity.name || "",
    })

  const onToggleActive = async (activity) => {
    const ok = await run(
      () => homeActivityService.update(token, activity.id, { isActive: !activity.isActive }),
      "berhasil."
    )
    if (ok) loadActivities()
  }

  const onDelete = async (activity) => {
    if (!window.confirm("Hapus kegiatan ini? Riwayat centang ikut terhapus.")) return
    const ok = await run(() => homeActivityService.remove(token, activity.id), "terhapus.")
    if (ok) loadActivities()
  }

  if (!isAdmin) return null

  return (
    <>
      <Typography variant='h6' align='center' sx={{ mb: 2 }}>
        Kegiatan di Rumah
      </Typography>

      <Card variant='outlined' sx={{ mb: 3 }}>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  size='small'
                  label='Jenis'
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <MenuItem value='CORE'>Materi Inti</MenuItem>
                  <MenuItem value='ADDITIONAL'>Materi Tambahan</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  size='small'
                  label='Kelompok (cth: TATA KRAMA MAKAN)'
                  value={form.groupName}
                  onChange={(e) => setForm({ ...form, groupName: e.target.value })}
                />
              </Grid>
              {form.type === "CORE" && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    multiline
                    size='small'
                    label='Kegiatan yang dicentang'
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <Button type='submit' variant='contained' size='small' sx={{ mr: 1 }}>
                  {form.id ? "Simpan" : "Tambah"}
                </Button>
                {form.id && (
                  <Button size='small' onClick={() => setForm(emptyForm)}>
                    Batal
                  </Button>
                )}
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {activities.map((activity) => (
        <Grid
          container
          key={activity.id}
          alignItems='center'
          wrap='nowrap'
          sx={{ mb: 1, opacity: activity.isActive ? 1 : 0.5 }}
        >
          <Grid item xs>
            <Typography variant='caption' color='text.secondary'>
              {activity.type === "CORE" ? "Inti" : "Tambahan"} · {activity.groupName}
            </Typography>
            {activity.name && <Typography variant='body2'>{activity.name}</Typography>}
          </Grid>
          <Switch
            size='small'
            checked={activity.isActive}
            onChange={() => onToggleActive(activity)}
          />
          <IconButton size='small' onClick={() => onEdit(activity)}>
            <EditIcon fontSize='small' />
          </IconButton>
          <IconButton size='small' onClick={() => onDelete(activity)}>
            <DeleteIcon fontSize='small' />
          </IconButton>
        </Grid>
      ))}

      <div style={{ height: 80 }} />
    </>
  )
}

export default ManageHomeActivities
