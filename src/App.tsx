import { createBrowserRouter } from "react-router-dom";
import { Root } from "./Root";
import { ErrorPage } from "./ErrorPage";
import { Index } from "./Index";
import { Login } from "./pages/Login";
import { ProfileSetup } from "./pages/ProfileSetup";
import { Session } from "./pages/Session";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Index />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/profile/setup",
        element: <ProfileSetup />,
      },
      {
        path: "/session/:id",
        element: <Session />,
      },
    ],
  },
]);

export default router;
