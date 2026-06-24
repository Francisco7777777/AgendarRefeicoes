import "./App.css";

import { Outlet } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./index.css";

function App() {
  return (
    <>
      <ToastContainer theme="colored" />
      <Outlet />
    </>
  );
}

export default App;
