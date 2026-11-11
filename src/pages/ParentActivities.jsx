import { useCallback, useEffect, useMemo, useState } from "react"
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
  MenuItem,
  TextField,
  Typography,
} from "@mui/material"
import homeActivityService from "../features/homeActivities/homeActivityService"

const today = () => {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const errorMessage = (error) => error.response?.data?.message || error.message

function ParentActivities() {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const token = user?.token

  const [children, setChildren] = useState([])
  const [requests, setRequests] = useState([])
  const [studentId, setStudentId] = useState("")
  const [activities, setActivities] = useState([])
  const [checkedIds, setCheckedIds] = useState([])
  const [date, setDate] = useState(today())
  const [isLoading, setIsLoading] = useState(true)

  const loadFamily = useCallback(async () => {
    try {
      const [childrenRes, requestsRes] = await Promise.all([
        homeActivityService.getChildren(token),
        homeActivityService.getRequests(token),
      ])
      setChildren(childrenRes.data)
      setRequests(requestsRes.data)
      setStudentId((current) =>
        childrenRes.data.some((c) => String(c.studentId) === String(current))
          ? current
          : childrenRes.data[0]?.studentId ?? ""
      )
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!user) return navigate("/login")
    loadFamily()
  }, [user, navigate, loadFamily])

  useEffect(() => {
    setActivities([])
    if (!studentId) return
    homeActivityService
      .getChildActivities(token, studentId)
      .then((res) => setActivities(res.data))
      .catch((error) => toast.error(errorMessage(error)))
  }, [token, studentId])

  const onAnswer = async (id, approve) => {
    try {
      await homeActivityService.answerRequest(token, id, approve)
      toast.success(approve ? "Permintaan disetujui" : "Permintaan ditolak")
      loadFamily()
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  const loadLogs = useCallback(() => {
    if (!date || !studentId) return
    homeActivityService
      .getLogs(token, studentId, date)
      .then((res) => setCheckedIds(res.data))
      .catch((error) => toast.error(errorMessage(error)))
  }, [token, studentId, date])

  useEffect(() => {
    setCheckedIds([])
    loadLogs()
  }, [loadLogs])

  const onToggle = async (activityId, checked) => {
    const previous = checkedIds
    setCheckedIds(
      checked ? [...previous, activityId] : previous.filter((id) => id !== activityId)
    )
    try {
      await homeActivityService.setChecked(token, { studentId, activityId, date, checked })
    } catch (error) {
      setCheckedIds(previous)
      toast.error(errorMessage(error))
    }
  }

  const sections = useMemo(() => {
    const result = []
    activities.forEach((activity) => {
      const key = `${activity.type}|${activity.groupName}`
      let section = result.find((s) => s.key === key)
      if (!section) {
        section = { key, type: activity.type, groupName: activity.groupName, items: [] }
        result.push(section)
      }
      section.items.push(activity)
    })
    return result
  }, [activities])

  if (isLoading) {
    return (
      <Grid align='center' sx={{ pt: 5 }}>
        <CircularProgress />
      </Grid>
    )
  }

  const renderSection = (section) => {
    const isGroupOnly = section.items.length === 1 && !section.items[0].name
    if (isGroupOnly) {
      const item = section.items[0]
      return (
        <FormControlLabel
          key={section.key}
          control={
            <Checkbox
              checked={checkedIds.includes(Number(item.id))}
              onChange={(e) => onToggle(Number(item.id), e.target.checked)}
            />
          }
          label={section.groupName}
          sx={{ display: "flex", mb: 1 }}
        />
      )
    }
    return (
      <div key={section.key} style={{ marginBottom: 12 }}>
        <Typography variant='subtitle2'>
          <b>{section.groupName}</b>
        </Typography>
        {section.items.map((item) => (
          <FormControlLabel
            key={item.id}
            control={
              <Checkbox
                size='small'
                checked={checkedIds.includes(Number(item.id))}
                onChange={(e) => onToggle(Number(item.id), e.target.checked)}
              />
            }
            label={<Typography variant='body2'>{item.name}</Typography>}
            sx={{ display: "flex", alignItems: "flex-start" }}
          />
        ))}
      </div>
    )
  }

  const core = sections.filter((s) => s.type === "CORE")
  const additional = sections.filter((s) => s.type === "ADDITIONAL")

  return (
    <>
      <Typography variant='h6' align='center' sx={{ mb: 2 }}>
        Instrumen Tindak Lanjut di Rumah
      </Typography>

      {requests.length > 0 && (
        <Card variant='outlined' sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant='subtitle2' sx={{ mb: 1 }}>
              <b>Permintaan terhubung dari anak</b>
            </Typography>
            {requests.map((request) => (
              <Grid container alignItems='center' key={request.studentId} sx={{ mb: 0.5 }}>
                <Grid item xs>
                  <Typography variant='body2'>{request.name}</Typography>
                </Grid>
                <Button size='small' onClick={() => onAnswer(request.studentId, true)}>Setujui</Button>
                <Button size='small' color='error' onClick={() => onAnswer(request.studentId, false)}>Tolak</Button>
              </Grid>
            ))}
          </CardContent>
        </Card>
      )}

      {children.length === 0 ? (
        <Typography variant='body2' align='center' sx={{ mt: 3 }}>
          Belum ada anak yang terhubung. Minta anak mengajukan hubungan dari akunnya, lalu setujui di sini.
        </Typography>
      ) : (
        <>
      <TextField
        select
        fullWidth
        size='small'
        label='Anak'
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        sx={{ mb: 2 }}
      >
        {children.map((child) => (
          <MenuItem key={child.studentId} value={child.studentId}>{child.name}</MenuItem>
        ))}
      </TextField>
      <TextField
        type='date'
        fullWidth
        size='small'
        label='Tanggal'
        value={date}
        onChange={(e) => e.target.value && setDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        inputProps={{ max: today() }}
        sx={{ mb: 2 }}
      />

      <Typography variant='caption' color='text.secondary'>
        Centang jika terlaksana, kosongkan jika tidak terlaksana.
      </Typography>

      <Typography variant='subtitle1' sx={{ mt: 2 }}>
        <b>Materi Inti</b>
      </Typography>
      {core.map(renderSection)}

      {additional.length > 0 && (
        <>
          <Typography variant='subtitle1' sx={{ mt: 2 }}>
            <b>Materi Tambahan</b>
          </Typography>
          {additional.map(renderSection)}
        </>
      )}
        </>
      )}
      <div style={{ height: 80 }} />
    </>
  )
}

export default ParentActivities
