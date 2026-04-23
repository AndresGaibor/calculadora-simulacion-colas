import { useEffect, useState } from "react";

export function useLocation() {
  const [location, setLocation] = useState(window.location.pathname);

  useEffect(() => {
    const handler = () => setLocation(window.location.pathname);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState(null, "", path);
    setLocation(path);
  };

  return { location, navigate };
}

export function navigate(path: string) {
  window.history.pushState(null, "", path);
  window.dispatchEvent(new Event("popstate"));
}