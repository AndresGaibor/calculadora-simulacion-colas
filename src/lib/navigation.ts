import { useEffect, useState } from "react";

/**
 * Router basado en hash (#/ruta).
 *
 * Funciona en cualquier hosting estático sin configurar SPA fallback,
 * porque el servidor solo ve la ruta "/" y sirve index.html; el fragmento
 * hash se interpreta en el cliente.
 */

function readHashPath(): string {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return "/";
  // Acepta "#/new" y "#new"; normaliza a "/new"
  return hash.startsWith("/") ? hash : "/" + hash;
}

export function useLocation() {
  const [location, setLocation] = useState(readHashPath());

  useEffect(() => {
    const handler = () => setLocation(readHashPath());
    window.addEventListener("hashchange", handler);
    window.addEventListener("popstate", handler);
    return () => {
      window.removeEventListener("hashchange", handler);
      window.removeEventListener("popstate", handler);
    };
  }, []);

  const navigate = (path: string) => {
    const target = path.startsWith("/") ? path : "/" + path;
    if (readHashPath() === target) return;
    window.location.hash = "#" + target;
    setLocation(target);
  };

  return { location, navigate };
}

export function navigate(path: string) {
  const target = path.startsWith("/") ? path : "/" + path;
  if (readHashPath() === target) return;
  window.location.hash = "#" + target;
  window.dispatchEvent(new Event("hashchange"));
}
