import { Outlet } from "react-router-dom";

const Root = () => {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  );
};

export default Root;