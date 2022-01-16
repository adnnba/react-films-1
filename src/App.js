import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import "./App.css"
import { Route, Routes, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import FilmsContext from "./utils/FilmsContext"
import OneFilm from "./pages/OneFilm"
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import Profile from "./pages/Profile"
import { toast, ToastContainer } from "react-toastify"
import OneCast from "./pages/OneCast"
import AllFilms from "./pages/AllFilms"
import AllActors from "./pages/AllActors"
import AllDirectors from "./pages/AllDirectors"
import EmailVerified from "./pages/EmailVerified"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import { Form } from "react-bootstrap"

function App() {
  const [films, setFilms] = useState([])
  const [actors, setActors] = useState([])
  const [directors, setDirectors] = useState([])
  const [profile, setProfile] = useState(null)
  const navigate = useNavigate()

  const getFilms = async () => {
    const response = await axios.get("https://films-api-1.herokuapp.com/api/films")
    setFilms(response.data)
  }

  const getProfile = async () => {
    const response = await axios.get("https://films-api-1.herokuapp.com/api/auth/profile", {
      headers: {
        Authorization: localStorage.tokenFilms,
      },
    })
    setProfile(response.data)
  }

  const getCasts = async () => {
    const response = await axios.get("https://films-api-1.herokuapp.com/api/casts")
    setActors(response.data.filter(cast => cast.type === "Actor"))
    setDirectors(response.data.filter(cast => cast.type === "Director"))
  }

  useEffect(() => {
    getFilms()
    if (localStorage.tokenFilms) getProfile()
    getCasts()
  }, [])

  const signup = async e => {
    e.preventDefault()
    try {
      const form = e.target
      const userBody = {
        firstName: form.elements.firstName.value,
        lastName: form.elements.lastName.value,
        email: form.elements.email.value,
        password: form.elements.password.value,
        avatar: form.elements.avatar.value,
      }

      await axios.post("https://films-api-1.herokuapp.com/api/auth/signup", userBody)
      console.log("signup success")
      toast.success("user created, please check your email for verification link")
    } catch (error) {
      if (error.response) toast.error(error.response.data)
      else console.log(error)
    }
  }

  const login = async e => {
    e.preventDefault()
    try {
      const form = e.target
      const userBody = {
        email: form.elements.email.value,
        password: form.elements.password.value,
      }

      const response = await axios.post("https://films-api-1.herokuapp.com/api/auth/login", userBody)

      const token = response.data
      localStorage.tokenFilms = token

      getProfile()
      console.log("login success")

      navigate("/")
    } catch (error) {
      if (error.response) toast.error(error.response.data)
      else console.log(error)
    }
  }

  const logout = () => {
    localStorage.removeItem("tokenFilms")
    console.log("logout success")
  }

  const addRating = async (filmId, rating) => {
    try {
      const ratingBody = {
        rating,
      }
      await axios.post(`https://films-api-1.herokuapp.com/api/films/${filmId}/ratings`, ratingBody, {
        headers: {
          Authorization: localStorage.tokenFilms,
        },
      })
      getFilms()
      toast.success("Your rate is added")
    } catch (error) {
      if (error.response) toast.error(error.response.data)
      else console.log(error)
    }
  }

  const filmSearch = e => {
    e.preventDefault()
    const form = e.target
    const searchText = form.elements.filmSearch.value

    const filmFound = films.find(film => film.title === searchText)
    if (filmFound) return navigate(`/film/${filmFound._id}`)

    const actorFound = actors.find(actor => `${actor.firstName} ${actor.lastName}` === searchText)
    if (actorFound) return navigate(`/actor/${actorFound._id}`)

    const directorFound = directors.find(director => `${director.firstName} ${director.lastName}` === searchText)
    if (directorFound) return navigate(`/director/${directorFound._id}`)

    toast.error("not found")
  }

  const likeFilm = async filmId => {
    try {
      const response = await axios.get(`https://films-api-1.herokuapp.com/api/films/${filmId}/likes`, {
        headers: {
          Authorization: localStorage.tokenFilms,
        },
      })
      getFilms()
      toast.success(response.data)
    } catch (error) {
      if (error.response) toast.error(error.response.data)
      else console.log(error)
    }
  }

  const addComment = async (e, filmId) => {
    e.preventDefault()
    try {
      const form = e.target
      const commentBody = {
        comment: form.elements.comment.value,
      }

      form.reset()
      await axios.post(`https://films-api-1.herokuapp.com/api/films/${filmId}/comments`, commentBody, {
        headers: {
          Authorization: localStorage.tokenFilms,
        },
      })
      getFilms()
      toast.success("Comment added")
    } catch (error) {
      if (error.response) toast.error(error.response.data)
      else console.log(error)
    }
  }

  const forgotPassword = async e => {
    e.preventDefault()
    try {
      const form = e.target
      const userBody = {
        email: form.elements.email.value,
      }
      await axios.post("https://films-api-1.herokuapp.com/api/auth/forgot-password", userBody)
      toast.success("password resent link is sent, go check your email")
    } catch (error) {
      if (error.response) toast.error(error.response.data)
      else console.log(error)
    }
  }

  const resetPassword = async (e, token) => {
    e.preventDefault()
    try {
      const form = e.target
      const password = form.elements.password.value
      const passwordConfirmation = form.elements.passwordConfirmation.value
      if (password !== passwordConfirmation) return toast.error("password is not matching")

      const userBody = {
        password,
      }
      await axios.post(`https://films-api-1.herokuapp.com/api/auth/reset-password/${token}`, userBody)
      toast.success("password reset")
      navigate("/login")
    } catch (error) {
      if (error.response) toast.error(error.response.data)
      else console.log(error)
    }
  }

  const store = {
    films,
    signup,
    login,
    logout,
    profile,
    addRating,
    filmSearch,
    likeFilm,
    addComment,
    actors,
    directors,
    forgotPassword,
    resetPassword,
  }

  return (
    <FilmsContext.Provider value={store}>
      <ToastContainer />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/film/:filmId" element={<OneFilm />} />
        <Route path="/actor/:actorId" element={<OneCast />} />
        <Route path="/director/:directorId" element={<OneCast />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/films" element={<AllFilms />} />
        <Route path="/actors" element={<AllActors />} />
        <Route path="/directors" element={<AllDirectors />} />
        <Route path="/email_verified/:token" element={<EmailVerified />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </FilmsContext.Provider>
  )
}

export default App
