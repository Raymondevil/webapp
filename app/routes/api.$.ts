import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import serverApp from "../server/index";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = (context as any)?.cloudflare?.env || {};
  const ctx = (context as any)?.cloudflare?.ctx;
  return serverApp.fetch(request, env, ctx);
}

export async function action({ request, context }: ActionFunctionArgs) {
  const env = (context as any)?.cloudflare?.env || {};
  const ctx = (context as any)?.cloudflare?.ctx;
  return serverApp.fetch(request, env, ctx);
}
