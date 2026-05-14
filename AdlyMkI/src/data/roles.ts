import genitoriImg from "../assets/family_tutor/papavero (1).png"
import ospiteImg from "../assets/student/ospite.png"
import educatoreImg from "../assets/educator/educatore.png"

export interface RoleData {
  id: string
  images: string[]
  label: string
  bg: string
}

export const roles: RoleData[] = [
  {
    id: "ospite",
    images: [ospiteImg],
    label: "Ospite",
    bg: "white",
  },
  {
    id: "educatore",
    images: [educatoreImg],
    label: "Educatore",
    // bg: "rgb(212, 240, 212)",
    bg: "white",
  },
  {
    id: "genitore",
    images: [genitoriImg],
    label: "Tutor/genitore",
    // bg: "rgb(255, 243, 204)",
    bg: "white",
  },
]
