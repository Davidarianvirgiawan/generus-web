import { useCallback, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import {
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import CheckIcon from "@mui/icons-material/CheckRounded"
import CloseIcon from "@mui/icons-material/CloseRounded"
import homeActivityService from "../features/homeActivities/homeActivityService"

const errorMessage = (error) => error.response?.data?.message || error.message
const currentMonth = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}
const formatDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })

function HomeActivityReport() {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const token = user?.token
  const isAdmin = user?.currentPosition?.type === "ADMIN"

  const [month, setMonth] = useState(currentMonth())
  const [search, setSearch] = useState("")
  const [period, setPeriod] = useState(null)
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    if (!user) return navigate("/login")
    if (!isAdmin) return navigate("/")
  }, [user, isAdmin, navigate])

  const load = useCallback(
    async (nextPage) => {
      if (!month) return
      setIsLoading(true)
      try {
        const res = await homeActivityService.getReport(token, { month, search, page: nextPage, pageSize: 20 })
        setRows((prev) => (nextPage === 1 ? res.data : [...prev, ...res.data]))
        setTotal(res.total)
        setPeriod({ from: res.from, to: res.to })
        setHasNextPage(res.hasNextPage)
        setPage(nextPage)
      } catch (error) {
        toast.error(errorMessage(error))
      } finally {
        setIsLoading(false)
      }
    },
    [token, month, search]
  )

  useEffect(() => {
    if (isAdmin) load(1)
  }, [isAdmin, load])

  const onSelect = async (row) => {
    setSelected(row)
    setDetail(null)
    try {
      const [activitiesRes, reportRes] = await Promise.all([
        homeActivityService.list(token, { studentId: row.studentId }),
        homeActivityService.getStudentReport(token, row.studentId, month),
      ])
      const checked = new Set(reportRes.data.logs.map((log) => `${log.activityId}|${log.date}`))
      const days = Number(reportRes.data.to.slice(8, 10))
      setDetail({
        activities: activitiesRes.data,
        checked,
        days,
        from: reportRes.data.from,
        to: reportRes.data.to,
      })
    } catch (error) {
      toast.error(errorMessage(error))
      setSelected(null)
    }
  }

  const onDownload = async () => {
    try {
      const blob = await homeActivityService.downloadStudentReport(token, selected.studentId, month, selected.studentName)
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `rekap-kegiatan-rumah-${selected.studentName}-${month}.xlsx`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(link.href)
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  const now = new Date()
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  const dateKey = (day) => `${month}-${String(day).padStart(2, "0")}`

  return (
    <div style={{ maxWidth: 650, margin: "0 auto", padding: "0 10px" }}>
      <Typography variant='h6' align='center' sx={{ mb: 2 }}>
        Rekap Kegiatan Rumah
      </Typography>
      <Grid container spacing={1} sx={{ mb: 1 }}>
        <Grid item xs={5}>
          <TextField
            type='month' fullWidth size='small' label='Bulan' value={month}
            onChange={(e) => e.target.value && setMonth(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={7}>
          <TextField
            fullWidth size='small' label='Cari nama siswa' value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Grid>
      </Grid>

      {period && (
        <Typography variant='caption' color='text.secondary'>
          Periode {formatDate(period.from)} s/d {formatDate(period.to)} · {total} siswa
        </Typography>
      )}

      {rows.map((row) => (
        <Card key={row.studentId} variant='outlined' sx={{ mt: 1 }}>
          <CardActionArea onClick={() => onSelect(row)}>
            <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
              <Grid container alignItems='center' wrap='nowrap'>
                <Grid item xs>
                  <Typography variant='body2'>
                    <b>{row.studentName}</b>
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {row.organizationName} · {row.totalDays} hari terisi
                  </Typography>
                </Grid>
                <Typography variant='body2'>
                  <b>{row.totalChecks}</b> centang
                </Typography>
              </Grid>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}

      {isLoading && (
        <Grid align='center' sx={{ pt: 2 }}>
          <CircularProgress size={24} />
        </Grid>
      )}
      {!isLoading && rows.length === 0 && (
        <Typography variant='body2' align='center' sx={{ mt: 3 }}>
          Belum ada centangan pada bulan ini.
        </Typography>
      )}
      {hasNextPage && !isLoading && (
        <Button fullWidth sx={{ mt: 2 }} onClick={() => load(page + 1)}>
          Muat lebih banyak
        </Button>
      )}

      <Dialog open={!!selected} onClose={() => setSelected(null)} fullWidth maxWidth='lg' scroll='paper'>
        {selected && (
          <>
            <DialogTitle>
              <Typography variant='body1'>
                <b>{selected.studentName}</b>
              </Typography>
              {detail && (
                <Typography variant='caption' color='text.secondary'>
                  {formatDate(detail.from)} s/d {formatDate(detail.to)}
                </Typography>
              )}
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
              {!detail ? (
                <Grid align='center' sx={{ p: 3 }}>
                  <CircularProgress size={24} />
                </Grid>
              ) : (
                <Table
                  size='small'
                  stickyHeader
                  sx={{
                    borderCollapse: "separate",
                    "& th, & td": { borderRight: "1px solid", borderBottom: "1px solid", borderColor: "divider" },
                    "& thead th": { borderTop: "1px solid", borderColor: "divider" },
                    "& th:first-of-type, & td:first-of-type": { borderLeft: "1px solid", borderColor: "divider" },
                    "& th": { fontWeight: 700, bgcolor: "grey.100" },
                    "& tbody tr:hover td": { bgcolor: "action.hover" },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ minWidth: 180, position: "sticky", left: 0, zIndex: 3, bgcolor: "background.paper" }}>
                        Kegiatan
                      </TableCell>
                      {Array.from({ length: detail.days }, (_, i) => (
                        <TableCell key={i} align='center' sx={{ px: 0.5, minWidth: 28 }}>
                          {i + 1}
                        </TableCell>
                      ))}
                      <TableCell align='center'>Jml</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detail.activities.map((activity) => {
                      let count = 0
                      const cells = Array.from({ length: detail.days }, (_, i) => {
                        const checked = detail.checked.has(`${activity.id}|${dateKey(i + 1)}`)
                        if (checked) count += 1
                        return (
                          <TableCell key={i} align='center' sx={{ px: 0.5 }}>
                            {checked ? (
                              <CheckIcon fontSize='small' color='success' />
                            ) : (
                              dateKey(i + 1) < todayKey && <CloseIcon fontSize='small' color='error' />
                            )}
                          </TableCell>
                        )
                      })
                      return (
                        <TableRow key={activity.id}>
                          <TableCell sx={{ position: "sticky", left: 0, bgcolor: "background.paper" }}>
                            <Typography variant='body2'>
                              {activity.name ? `${activity.groupName} - ${activity.name}` : activity.groupName}
                            </Typography>
                          </TableCell>
                          {cells}
                          <TableCell align='center'>
                            <b>{count}</b>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={onDownload} disabled={!detail}>Unduh Excel</Button>
              <Button onClick={() => setSelected(null)}>Tutup</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  )
}

export default HomeActivityReport
