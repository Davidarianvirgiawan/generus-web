import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { Box, Grid, Typography } from "@mui/material"
import BarIcon from "@mui/icons-material/EqualizerRounded"
import PeopleListIcon from "@mui/icons-material/PersonSearchOutlined"
import EventIcon from "@mui/icons-material/EventRounded"
import RestPasswordIcon from "@mui/icons-material/LockResetRounded"
import QueryStatsIcon from "@mui/icons-material/QueryStatsRounded"
import BookIcon from "@mui/icons-material/BookOutlined"
import ChecklistIcon from "@mui/icons-material/ChecklistRounded"
import GroupsIcon from "@mui/icons-material/GroupsOutlined"
import HomeWorkIcon from "@mui/icons-material/HomeWorkOutlined"

function Menu() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    if (!user || !user.exp) navigate("/login")
    if (user?.currentPosition?.type === "GENERUS") navigate("/user-completion")
    if (user?.currentPosition?.type === "ORANGTUA") navigate("/parent-activities")
  }, [user, navigate, dispatch])

  if (!user) return null

  const isAdmin = user?.currentPosition?.type === "ADMIN"
  const menuItems = [
    {
      to: "/events",
      icon: <EventIcon fontSize='large' color='info' />,
      text: "Kegiatan",
    },
    {
      to: "/users",
      icon: <PeopleListIcon fontSize='large' color='info' />,
      text: "Users",
    },
    {
      to: "/group-completion",
      icon: <BarIcon fontSize='large' color='info' />,
      text: "Capaian Materi",
    },
    {
      to: "/references",
      icon: <BookIcon fontSize='large' color='info' />,
      text: "Pustaka",
    },
    {
      to: "/reset-passwords",
      icon: <RestPasswordIcon fontSize='large' color='info' />,
      text: "Reset Password",
    },
    {
      to: "/activities-logs",
      icon: <QueryStatsIcon fontSize='large' color='info' />,
      text: "Dashboard",
    },
    ...(isAdmin
      ? [{
          to: "/manage-home-activities",
          icon: <HomeWorkIcon fontSize='large' color='info' />,
          text: "Kegiatan Rumah",
        },
        {
          to: "/home-activity-report",
          icon: <ChecklistIcon fontSize='large' color='info' />,
          text: "Rekap Centang",
        }]
      : []),
    ...(isAdmin && user?.currentPosition?.organizationLevel === 0
      ? [{
          to: "/musda-attendance",
          icon: <GroupsIcon fontSize='large' color='info' />,
          text: "Absen Musppg",
        }]
      : []),
  ]

  return (
    <>
      <Typography variant='body2' align='center'>
        <b>Hi, {user?.name}</b>
      </Typography>
      <Box sx={{ flexGrow: 1 }} paddingTop={5}>
        <Grid container spacing={2}>
          {menuItems.map((item, index) => (
            <Grid
              item
              xs={4}
              textAlign='center'
              component={Link}
              to={item.to}
              key={index}
            >
              {item.icon}
              <Typography sx={{ fontSize: "12px" }}>{item.text}</Typography>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  )
}

export default Menu
