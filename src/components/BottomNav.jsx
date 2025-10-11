import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from "@mui/material"

import LoginIcon from "@mui/icons-material/LoginRounded"
import PersonIcon from "@mui/icons-material/PersonRounded"
import ProfileIcon from "@mui/icons-material/FaceOutlined"
import PeopleListIcon from "@mui/icons-material/PersonSearchOutlined"
import EventIcon from "@mui/icons-material/EventRounded"
import HomeIcon from "@mui/icons-material/HomeMaxRounded"
import CompletionIcon from "@mui/icons-material/GradingOutlined"
import ArrowBackIcon from "@mui/icons-material/ArrowBackRounded"
import BookIcon from "@mui/icons-material/BookOutlined"

function BottomNav() {
  const { user, alreadyDecidedPosition } = useSelector((state) => state.auth)
  const [value, setValue] = useState(0)
  const { pathname } = useLocation()

  const isGenerus = user?.currentPosition?.type === "GENERUS"

  const navItems = (() => {
    if (user && alreadyDecidedPosition) {
      if (isGenerus) {
        return [
          { to: "/events", label: "Kegiatan", icon: <EventIcon fontSize="small" /> },
          { to: "/user-completion", label: "Capaian Materi", icon: <CompletionIcon fontSize="small" /> },
          { to: "/references", label: "Pustaka", icon: <BookIcon fontSize="small" /> },
          { to: "/profile", label: "Profile", icon: <ProfileIcon fontSize="small" /> },
        ]
      }

      return [
        {
          to: "/",
          label: "Menu",
          icon: pathname === "/" ? (
            <HomeIcon fontSize="small" />
          ) : (
            <ArrowBackIcon fontSize="small" />
          ),
        },
        { to: "/users", label: "Users", icon: <PeopleListIcon fontSize="small" /> },
        { to: "/events", label: "Kegiatan", icon: <EventIcon fontSize="small" /> },
        { to: "/profile", label: "Profile", icon: <ProfileIcon fontSize="small" /> },
      ]
    }

    if (!user) {
      return [
        { to: "/login", label: "Masuk", icon: <LoginIcon fontSize="small" /> },
        { to: "/register", label: "Registrasi", icon: <PersonIcon fontSize="small" /> },
      ]
    }

    return [] // user exists but position not decided
  })()

  return (
    <Paper sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }} elevation={3}>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => setValue(newValue)}
      >
        {navItems.map(({ to, label, icon }) => (
          <BottomNavigationAction
            key={to}
            component={Link}
            to={to}
            label={label}
            value={to}
            icon={icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  )
}

export default BottomNav
