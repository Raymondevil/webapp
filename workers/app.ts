import { createRequestHandler } from "react-router";
import serverApp from "../app/server/index";

declare module "react-router" {
	export interface AppLoadContext {
		cloudflare: {
			env: Env;
			ctx: ExecutionContext;
		};
	}
}

const requestHandler = createRequestHandler(
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		let response: Response;
		if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/media/")) {
			response = await serverApp.fetch(request, env, ctx);
		} else {
			response = await requestHandler(request, {
				cloudflare: { env, ctx },
			});
		}
		const headers = new Headers(response.headers);
		headers.set("X-Content-Type-Options", "nosniff");
		headers.set("X-Frame-Options", "DENY");
		headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
		headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
		if (url.protocol === "https:") {
			headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
		}
		return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
	},
} satisfies ExportedHandler<Env>;
