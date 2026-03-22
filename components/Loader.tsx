import { memo } from "react";

function Loader() {
  return (
    <div className="loader">
      <span className="bar"></span>
      <span className="bar"></span>
      <span className="bar"></span>
    </div>
  );
}

export default memo(Loader);
