import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router";
import type { LinksFunction } from "react-router";

import "./index.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,800;0,900;1,600;1,800&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
    integrity: "sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==",
    crossOrigin: "anonymous",
    referrerPolicy: "no-referrer",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Fotografías El Tigre | Cobertura Oficial Fiestas Patrias San Pedro Lagunillas 2026</title>
        <meta
          name="description"
          content="Fotografía HD profesional y video completo de desfiles, Noche del Grito, la gran Topadera y bailes en San Pedro Lagunillas, Nayarit. ¡Cotiza y encarga tus fotos por número de dorsal!"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <Meta />
        <Links />
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950 min-h-screen">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: { error: unknown }) {
  let message = "Oops!";
  let details = "Ha ocurrido un error inesperado.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "La página solicitada no fue encontrada."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-950 text-white">
      <div className="bg-slate-900 border border-amber-500/30 p-8 rounded-3xl max-w-lg space-y-4 shadow-2xl">
        <span className="text-4xl text-amber-400 font-bold block">{message}</span>
        <h1 className="text-xl font-serif font-black">{details}</h1>
        {stack && (
          <pre className="text-left text-xs bg-slate-950 p-4 rounded-xl overflow-x-auto text-slate-400">
            {stack}
          </pre>
        )}
        <a
          href="/"
          className="inline-block bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all"
        >
          Volver al Inicio
        </a>
      </div>
    </main>
  );
}
