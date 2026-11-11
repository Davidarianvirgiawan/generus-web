import { useCallback, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/DeleteOutline"
import EditIcon from "@mui/icons-material/EditOutlined"
import musdaAttendanceService from "../features/musdaAttendances/musdaAttendanceService"

const errorMessage = (error) => error.response?.data?.message || error.message
const currentMonth = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}
const emptyForm = { name: "", dapukan: "", isPresent: false }

function MusdaAttendance() {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const token = user?.token
  const isAdmin = user?.currentPosition?.type === "ADMIN" && user?.currentPosition?.organizationLevel === 0

  const [month, setMonth] = useState(currentMonth())
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [present, setPresent] = useState(0)
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!user) return navigate("/login")
    if (!isAdmin) return navigate("/")
  }, [user, isAdmin, navigate])

  const load = useCallback(
    async (nextPage) => {
      setIsLoading(true)
      try {
        const res = await musdaAttendanceService.list(token, { month, page: nextPage, pageSize: 50 })
        setRows((prev) => (nextPage === 1 ? res.data : [...prev, ...res.data]))
        setTotal(res.total)
        setPresent(res.present)
        setHasNextPage(res.hasNextPage)
        setPage(nextPage)
      } catch (error) {
        toast.error(errorMessage(error))
      } finally {
        setIsLoading(false)
      }
    },
    [token, month]
  )

  useEffect(() => {
    if (isAdmin) load(1)
  }, [isAdmin, load])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.dapukan.trim()) return toast.error("Nama dan Dapukan wajib diisi.")
    setIsSaving(true)
    try {
      if (editingId) await musdaAttendanceService.update(token, editingId, form)
      else await musdaAttendanceService.create(token, { ...form, month })
      resetForm()
      await load(1)
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  const onEdit = (row) => {
    setEditingId(row.id)
    setForm({ name: row.name, dapukan: row.dapukan, isPresent: row.isPresent })
  }

  const onDelete = async (row) => {
    if (!window.confirm(`Hapus ${row.name}?`)) return
    try {
      await musdaAttendanceService.remove(token, row.id)
      if (editingId === row.id) resetForm()
      await load(1)
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  const onDownload = async () => {
    try {
      const blob = await musdaAttendanceService.download(token, month)
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `absensi-musppg-${month}.xlsx`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(link.href)
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  return (
    <div style={{ maxWidth: 650, margin: "0 auto", padding: "0 10px" }}>
      <Typography variant='h6' align='center' sx={{ mb: 2 }}>
        Absensi Musppg
      </Typography>
      <Grid container spacing={1} alignItems='center' sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <TextField
            type='month' fullWidth size='small' label='Bulan' value={month}
            onChange={(e) => e.target.value && setMonth(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={6}>
          <Button fullWidth variant='outlined' onClick={onDownload} disabled={total === 0}>
            Unduh Excel
          </Button>
        </Grid>
      </Grid>

      <form onSubmit={onSubmit}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <TextField
              fullWidth size='small' label='Nama' value={form.name}
              inputProps={{ maxLength: 100 }}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth size='small' label='Dapukan' value={form.dapukan}
              inputProps={{ maxLength: 100 }}
              onChange={(e) => setForm({ ...form, dapukan: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              label='Hadir'
              control={
                <Checkbox
                  checked={form.isPresent}
                  onChange={(e) => setForm({ ...form, isPresent: e.target.checked })}
                />
              }
            />
          </Grid>
          <Grid item xs={editingId ? 6 : 12}>
            <Button fullWidth type='submit' variant='contained' disabled={isSaving}>
              {editingId ? "Simpan Perubahan" : "Tambah"}
            </Button>
          </Grid>
          {editingId && (
            <Grid item xs={6}>
              <Button fullWidth onClick={resetForm}>Batal</Button>
            </Grid>
          )}
        </Grid>
      </form>

      <Typography variant='caption' color='text.secondary' sx={{ display: "block", mt: 2 }}>
        Hadir {present} dari {total} peserta
      </Typography>

      {rows.map((row) => (
        <Card key={row.id} variant='outlined' sx={{ mt: 1 }}>
          <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
            <Grid container alignItems='center' wrap='nowrap'>
              <Grid item xs>
                <Typography variant='body2'><b>{row.name}</b></Typography>
                <Typography variant='caption' color='text.secondary'>
                  {row.dapukan} · {row.isPresent ? "Hadir" : "Tidak hadir"}
                </Typography>
              </Grid>
              <IconButton size='small' onClick={() => onEdit(row)}><EditIcon fontSize='small' /></IconButton>
              <IconButton size='small' onClick={() => onDelete(row)}><DeleteIcon fontSize='small' /></IconButton>
            </Grid>
          </CardContent>
        </Card>
      ))}

      {isLoading && (
        <Grid align='center' sx={{ pt: 2 }}>
          <CircularProgress size={24} />
        </Grid>
      )}
      {!isLoading && rows.length === 0 && (
        <Typography variant='body2' align='center' sx={{ mt: 3 }}>
          Belum ada absensi pada bulan ini.
        </Typography>
      )}
      {hasNextPage && !isLoading && (
        <Button fullWidth sx={{ mt: 2 }} onClick={() => load(page + 1)}>
          Muat lebih banyak
        </Button>
      )}
    </div>
  )
}

export default MusdaAttendance
