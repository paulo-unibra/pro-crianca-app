import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./screens/Home";
import { DonationForm } from "./screens/DonationForm";
import { DonationPix } from "./screens/DonationPix";
import { Courses } from "./screens/Courses";
import { CourseDetail } from "./screens/CourseDetail";
import { About } from "./screens/About";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "doar", Component: DonationForm },
      { path: "doar/pagamento", Component: DonationPix },
      { path: "cursos", Component: Courses },
      { path: "cursos/:id", Component: CourseDetail },
      { path: "sobre", Component: About },
    ],
  },
]);
