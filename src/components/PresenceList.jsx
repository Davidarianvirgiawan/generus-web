import {
  AppBar,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Drawer,
  Fab,
  Grid,
  IconButton,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/CloseRounded"
import FilterIcon from "@mui/icons-material/FilterListRounded"
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined"
import moment from "moment"
import { useEffect, useState } from "react"
import InfiniteScroll from "react-infinite-scroll-component"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-toastify"
import DeleteIcon from "@mui/icons-material/CloseOutlined"
import {
  createPresenceByAdmin,
  downloadPresenceData,
  getPresencesByEventId,
  removeAttender,
  reset,
  updatePresence,
} from "../features/presences/presenceSlice"
import translate from "../utils/translate"
import {
  getUsersPaginate,
  reset as resetSearch,
} from "../features/users/userSlice"
import PopDialog from "./PopDialog"
import { getppd, getppk } from "../features/organizations/organizationSlice"
import capitalize from "capitalize"
import gradeShortEnum from "../enums/gradeShortEnum"
import gradeEnum from "../enums/gradeEnum"

function PresenceList(props) {
  const { event, user } = props
  const dispatch = useDispatch()
  const { users } = useSelector((state) => state.users)
  const [search, setSearch] = useState("")
  const [searchValue, setSearchValue] = useState(null)
  const [openPopup, setOpenPopup] = useState(false)
  const [removeId, setRemoveId] = useState("")
  const [stateDrawer, setStateDrawer] = useState(false)
  const { ppd: ppdList, ppk: ppkList } = useSelector(
    (state) => state.organizations
  )

  const isPPG = user.currentPosition.organizationLevel === 0
  const isPPDOrTeacher =
    user.currentPosition.organizationLevel === 1 ||
    user.currentPosition.type === "PENGAJAR"
  const isPPK = user.currentPosition.organizationLevel === 2

  const isPPGevent = event.organizationLevel === 0
  const isPPDevent = event.organizationLevel === 1

  let initAncestorOrganizationId = isPPDevent ? event.organizationId : ""
  if (isPPDOrTeacher)
    initAncestorOrganizationId = user.currentPosition.organizationId

  const [drawerFilters, setDrawerFilters] = useState({
    ancestorOrganizationId: initAncestorOrganizationId,
    grade: [],
  })
  const [filters, setFilters] = useState({
    page: 1,
    positionType: "GENERUS",
    ancestorOrganizationId: initAncestorOrganizationId,
    organizationId: "",
    sex: "",
    grade: [],
    eventId: event.id,
  })

  const {
    isError,
    message,
    attenders,
    statusCount,
    isSuccess,
    isLoading,
    hasNextPage,
    isSuccessAttenders,
    isSuccessCreatePresence,
    isLoadingUpdate,
  } = useSelector((state) => state.presences)

  useEffect(() => {
    if (isError) toast.error(message)
    if (isSuccess) toast.success("behasil.")
    if (!ppdList && isPPGevent) dispatch(getppd())
  }, [dispatch, isError, isPPGevent, isSuccess, message, ppdList])

  useEffect(() => {
    if (isSuccessCreatePresence) {
      toast.success("kehadiran behasil ditambah.")
      setFilters((prevState) => ({
        ...prevState,
        page: 1,
      }))
    }
    return () => {
      dispatch(reset())
      dispatch(resetSearch())
    }
  }, [dispatch, isSuccessCreatePresence])

  useEffect(() => {
    dispatch(getPresencesByEventId(filters))
  }, [dispatch, filters])

  useEffect(() => {
    if (drawerFilters.ancestorOrganizationId)
      dispatch(getppk(drawerFilters.ancestorOrganizationId))
  }, [dispatch, drawerFilters.ancestorOrganizationId])

  const fetchMoreAttenders = () => {
    setFilters((prevState) => ({
      ...prevState,
      page: prevState.page + 1,
    }))
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search) {
        dispatch(
          getUsersPaginate({
            search,
            positionType: "GENERUS",
            ancestorId: event.organizationId,
          })
        )
        dispatch(resetSearch())
      } else {
        setSearch([])
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [dispatch, event.organizationId, search])

  const toggleDrawer = (open) => (event) => {
    setFilters((prevState) => ({
      ...prevState,
      ...drawerFilters,
    }))
    dispatch(reset())
    setStateDrawer(open)
  }

  const eventTime = () => {
    const startDateObject = moment(new Date(Number(event.startDate)))
    const startDate = startDateObject.format("DD MMM YYYY")
    const startTime = startDateObject.format("HH.mm")
    const startDayName = translate.days(startDateObject.format("dddd"))
    return `${startDayName}, ${startDate} pkl. ${startTime}`
  }

  const presenceTime = (time) => {
    const createdDateObject = moment(new Date(Number(time)))
    const startTime = createdDateObject.format("HH:mm")
    const startDayName = translate.days(createdDateObject.format("dddd"))
    return `${startDayName}, ${startTime}`
  }

  const onSubmit = (e) => {
    e.preventDefault()

    setSearch("")
    const data = {
      eventId: event.id,
      userId: searchValue?.id,
    }
    dispatch(createPresenceByAdmin(data))
    setSearchValue(null)
  }

  const onClickRemove = () => {
    const data = {
      eventId: event.id,
      userId: removeId,
    }
    dispatch(removeAttender(data)).then(() => {
      setOpenPopup(false)
    })
  }

  const handleFilterObject = (key, value) => (event) => {
    // reset the organizationId filter regarding to the ancestorid
    if (key === "ancestorOrganizationId") {
      setDrawerFilters((prevState) => ({
        ...prevState,
        organizationId: "",
      }))
    }

    if (key === "grade") {
      if (drawerFilters.grade.includes(value)) {
        const grades = drawerFilters.grade.filter((grade) => grade !== value)
        setDrawerFilters((prevState) => ({
          ...prevState,
          grade: grades,
        }))
      } else {
        setDrawerFilters((prevState) => ({
          ...prevState,
          grade: [...prevState.grade, value],
        }))
      }
    } else {
      setDrawerFilters((prevState) => ({
        ...prevState,
        [key]: value === prevState[key] ? "" : value,
      }))
    }
  }

  const updateStatus = (attender, status) => () => {
    if (!isLoadingUpdate)
      dispatch(
        updatePresence({ eventId: event.id, userId: attender.userId, status })
      )
  }

  const onClickDownload = () => {
    dispatch(downloadPresenceData({ eventId: event.id, params: filters }))
      .unwrap()
      .then((blob) => {
        // Create a Blob from the response
        const file = new Blob([blob], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })

        // Build a URL from the file
        const fileURL = URL.createObjectURL(file)

        // Create a temp <a> tag to download file
        const link = document.createElement("a")
        link.href = fileURL
        link.setAttribute(
          "download",
          `presensi-${event.name}-${Date.now()}.xlsx`
        ) // Name the file
        document.body.appendChild(link)
        link.click()

        // Cleanup
        link.parentNode.removeChild(link)
        URL.revokeObjectURL(fileURL)
      })
      .catch((error) => {
        // Handle error here
        console.error("Error downloading the file: ", error)
      })
  }

  const filterList = () => (
    <>
      <Grid pt={3} sx={{ width: "100vw" }}>
        <IconButton aria-label='delete' onClick={toggleDrawer(false)}>
          <CloseIcon />
        </IconButton>
      </Grid>

      <Grid item xs={12} pb={4}>
        <Typography textAlign='center'>
          <b>Filters</b>
        </Typography>
      </Grid>

      <Grid container spacing={1} pb={3} pl={1}>
        <Grid item>
          <Chip
            label='Laki-laki'
            color='info'
            variant={drawerFilters.sex === 1 ? "solid" : "outlined"}
            onClick={handleFilterObject("sex", 1)}
          />
        </Grid>
        <Grid item>
          <Chip
            label='Perempuan'
            color='info'
            variant={drawerFilters.sex === 0 ? "solid" : "outlined"}
            onClick={handleFilterObject("sex", 0)}
          />
        </Grid>
      </Grid>

      <Grid container spacing={1} pb={3} pl={1}>
        {Object.keys(gradeEnum).map((key) => (
          <Grid item key={key}>
            <Chip
              label={gradeEnum[key]}
              color='info'
              variant={drawerFilters.grade.includes(key) ? "solid" : "outlined"}
              onClick={handleFilterObject("grade", key)}
            />
          </Grid>
        ))}
      </Grid>

      {isPPGevent && isPPG && (
        <Grid container spacing={1} pb={3} pl={1}>
          {ppdList?.data.map((ppd) => (
            <Grid item key={ppd.id}>
              <Chip
                label={ppd.name}
                color='info'
                variant={
                  drawerFilters.ancestorOrganizationId === ppd.id
                    ? "solid"
                    : "outlined"
                }
                onClick={handleFilterObject("ancestorOrganizationId", ppd.id)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {drawerFilters.ancestorOrganizationId &&
        (isPPGevent || isPPDevent) &&
        !isPPK && (
          <Grid container spacing={1} pb={3} pl={1}>
            {ppkList?.data.map((ppk) => (
              <Grid item key={ppk.id}>
                <Chip
                  label={ppk.name}
                  color='info'
                  variant={
                    drawerFilters.organizationId === ppk.id
                      ? "solid"
                      : "outlined"
                  }
                  onClick={handleFilterObject("organizationId", ppk.id)}
                />
              </Grid>
            ))}
          </Grid>
        )}

      <Grid pb={10} />

      <AppBar position='fixed' color='inherit' sx={{ top: "auto", bottom: 0 }}>
        <Toolbar>
          <Grid container justifyContent='center' style={{ width: "100%" }}>
            <Grid item xs={12}>
              <Button
                variant='contained'
                color='info'
                fullWidth
                onClick={toggleDrawer(false)}
              >
                Lihat
              </Button>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </>
  )

  return (
    <>
      <Card sx={{ mb: 0.5 }} align='center'>
        <CardContent
          sx={{
            padding: 2,
            "&:last-child": {
              paddingBottom: 2,
            },
          }}
        >
          <Typography variant='h5'>{event.name}</Typography>
          <Typography variant='body2'>{eventTime()}</Typography>

          <Box sx={{ display: "flex", justifyContent: "space-around", mt: 2 }}>
            <Box textAlign='center'>
              <Typography variant='h5'>{statusCount?.izin}</Typography>
              <Typography variant='body2'>Izin</Typography>
            </Box>
            <Box textAlign='center'>
              <Typography
                variant='h5'
                sx={{ fontWeight: "bold", fontSize: "1.5rem" }}
              >
                {statusCount?.hadir}
              </Typography>
              <Typography
                variant='body2'
                sx={{ fontWeight: "bold", fontSize: "1.2rem" }}
              >
                Hadir
              </Typography>
            </Box>
            <Box textAlign='center'>
              <Typography variant='h5'>{statusCount?.alpa}</Typography>
              <Typography variant='body2'>Alpa</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container paddingBottom={2} paddingTop={5} spacing={2}>
        <Grid item xs={8}>
          <Autocomplete
            clearOnBlur
            freeSolo
            disablePortal
            disableClearable
            id='combo-box-demo'
            fullWidth
            options={users}
            getOptionLabel={(user) => user.name} // Adjust this to match your API response
            value={searchValue}
            onChange={(event, newValue) => setSearchValue(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                size='small'
                label='Tambah kehadiran generus...'
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value ? e.target.value : "")
                }
              />
            )}
            renderOption={(props, user) => (
              <li {...props} key={user.id}>
                {user.name}
              </li>
            )}
          />
        </Grid>
        <Grid item xs={4}>
          <Button
            disabled={searchValue ? false : true}
            size='small'
            type='submit'
            variant='contained'
            color='info'
            fullWidth
            style={{ paddingTop: "9px", paddingBottom: "8px" }}
            onClick={onSubmit}
          >
            Tambah
          </Button>
        </Grid>
      </Grid>

      <Grid pb={1}>
        <Button
          variant='text'
          startIcon={<FilterIcon />}
          onClick={toggleDrawer(true)}
          size='small'
          color='info'
        >
          FILTERS
        </Button>
      </Grid>

      <InfiniteScroll
        dataLength={attenders?.length || 0}
        next={fetchMoreAttenders}
        hasMore={hasNextPage}
        loader={
          <Grid align='center' sx={{ pt: 1.5 }}>
            <CircularProgress size={20} />
          </Grid>
        }
        endMessage={
          <Typography
            align='center'
            p={3}
            color='text.secondary'
            variant='body2'
          >
            {attenders.length === 0 && "Tidak ditemukan"}
          </Typography>
        }
      >
        {isSuccessAttenders &&
          attenders.map((attender) => (
            <Card
              variant='outlined'
              key={attender.userId}
              sx={{ mb: 0.5 }}
              align='left'
            >
              <Grid
                container
                alignItems='center'
                justifyContent='space-between'
              >
                <Grid item xs={6}>
                  <CardContent
                    sx={{
                      paddingTop: 0.5,
                      paddingBottom: 0.5,
                      paddingLeft: 2,
                      paddingRight: 2,
                      "&:last-child": { paddingBottom: 0.5 },
                    }}
                  >
                    <Typography fontSize={14} variant='body1'>
                      {attender.userName}
                    </Typography>
                    <Typography
                      fontSize={10}
                      component='p'
                      color='text.secondary'
                    >
                      PPK{" "}
                      {capitalize.words(
                        attender.organizationName.replace("PPK ", "")
                      )}{" "}
                      · {attender.userSex ? "Lk" : "Pr"} ·{" "}
                      {attender.grade || attender.grade === 0 ? gradeShortEnum[attender.grade] : ""}
                      {attender.status === "ALPA" || attender.status === "IZIN"
                        ? ""
                        : " · " + presenceTime(attender.createdAt)}
                    </Typography>
                  </CardContent>
                </Grid>

                <Grid
                  item
                  md={6}
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
                  <Chip
                    size='small'
                    label='izin'
                    color='info'
                    variant={attender.status === "IZIN" ? "solid" : "outlined"}
                    onClick={updateStatus(attender, "IZIN")}
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    size='small'
                    label='hadir'
                    color='success'
                    variant={attender.status === "HADIR" ? "solid" : "outlined"}
                    onClick={updateStatus(attender, "HADIR")}
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    size='small'
                    label='alpa'
                    color='error'
                    variant={attender.status === "ALPA" ? "solid" : "outlined"}
                    onClick={updateStatus(attender, "ALPA")}
                    sx={{ mr: 1 }}
                  />
                  {event.organizationId ===
                    user.currentPosition.organizationId.toString() && (
                    <IconButton
                      onClick={() => {
                        setOpenPopup(true)
                        setRemoveId(attender.userId)
                      }}
                    >
                      <DeleteIcon fontSize='small' />
                    </IconButton>
                  )}
                </Grid>
              </Grid>
            </Card>
          ))}
      </InfiniteScroll>
      <PopDialog title={"Hilangkan dari list?"} openPopup={openPopup}>
        <Box sx={{ display: "flex", justifyContent: "center", height: 45 }}>
          {isLoading ? (
            <Grid align='center' sx={{ pt: 1.5 }}>
              <CircularProgress size={20} />
            </Grid>
          ) : (
            <Stack spacing={1} direction='row'>
              <Button variant='outlined' color='error' onClick={onClickRemove}>
                Ya
              </Button>
              <Button variant='contained' onClick={() => setOpenPopup(false)}>
                Batal
              </Button>
            </Stack>
          )}
        </Box>
      </PopDialog>

      <Drawer anchor='left' open={stateDrawer} onClose={toggleDrawer(false)}>
        <Container>{filterList()}</Container>
      </Drawer>

      <Fab
        size='medium'
        color='success'
        aria-label='download excel'
        onClick={onClickDownload}
        sx={{ position: "fixed", bottom: 16, right: 16 }}
      >
        <FileDownloadOutlinedIcon />
      </Fab>
    </>
  )
}

export default PresenceList
