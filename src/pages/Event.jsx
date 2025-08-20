import {
  Button,
  CircularProgress,
  Fab,
  Grid,
  TextField,
  Typography,
} from "@mui/material"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import EventCard from "../components/EventCard"
import { listEvents, reset } from "../features/listEvents/listEventsSlice"
import InfiniteScroll from "react-infinite-scroll-component"

function Event() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { events, hasNextPage, isSuccess } = useSelector(
    (state) => state.listEvents
  )
  const [page, setPage] = useState(1)
  const [searchBar, setSearchBar] = useState("")
  const [filters, setFilters] = useState({
    page: 1,
    search: "",
  })

  const onChange = (e) => {
    setSearchBar(e.target.value)
  }

  const onSubmit = (e) => {
    e.preventDefault()
    setFilters((prevState) => ({
      ...prevState,
      search: searchBar,
    }))
    dispatch(reset())
  }

  useEffect(() => {
    if (!user) navigate("/login")
    user.currentPosition.type === "ADMIN"
      ? dispatch(listEvents({ ...filters, page: 1, isGroupHead: "false" }))
      : dispatch(listEvents({ ...filters, page: 1, groupId: "null" }))
    return () => {
      dispatch(reset())
    }
  }, [user, navigate, dispatch, filters])

  const fetchMoreEvents = () => {
    if (hasNextPage) {
      setPage((prevPage) => prevPage + 1)
      user.currentPosition.type === "ADMIN"
        ? dispatch(
            listEvents({ ...filters, page: page + 1, isGroupHead: "false" })
          )
        : dispatch(listEvents({ ...filters, page: page + 1, groupId: "null" }))
    }
  }

  const onClick = () => {
    navigate("/c/create-event")
  }

  return (
    <>
      <Typography variant='h6' align='center' sx={{ mb: 3 }}>
        Jadwal Kegiatan
      </Typography>

      <form onSubmit={onSubmit}>
        <Grid container paddingBottom={2} spacing={2}>
          <Grid item xs={9}>
            <TextField
              name='search'
              placeholder={`Cari nama kegiatan, PPD atau PPK...`}
              size='small'
              value={searchBar}
              onChange={onChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={3}>
            <Button
              size='small'
              type='submit'
              variant='contained'
              color='info'
              fullWidth
              style={{ paddingTop: "9px", paddingBottom: "8px" }}
            >
              Cari
            </Button>
          </Grid>
        </Grid>
      </form>

      {!isSuccess && (
        <Grid align='center' sx={{ pt: 1.5 }}>
          <CircularProgress size={20} />
        </Grid>
      )}

      <InfiniteScroll
        dataLength={events?.length || 0}
        next={fetchMoreEvents}
        hasMore={hasNextPage}
        loader={
          <Grid align='center' sx={{ pt: 1.5 }}>
            <CircularProgress size={20} />
          </Grid>
        }
      >
        {isSuccess &&
          events.map((event) => (
            <EventCard key={event.id} event={event} user={user} />
          ))}
      </InfiniteScroll>

      {isSuccess && events.length === 0 && (
        <Typography
          textAlign='center'
          pt={3}
          color='text.secondary'
          variant='body2'
        >
          Belum ada kegiatan.
        </Typography>
      )}

      {user.currentPosition.type === "ADMIN" && (
        <Fab
          size='large'
          color='info'
          aria-label='create event'
          onClick={onClick}
          sx={{ position: "fixed", bottom: 76, right: 16 }}
        >
          <AddRoundedIcon fontSize='large' />
        </Fab>
      )}
    </>
  )
}

export default Event
