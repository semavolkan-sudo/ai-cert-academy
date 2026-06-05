import { createFileRoute } from "@tanstack/react-router";
import App from "../AppPage";

export const Route = createFileRoute("/")({ component: App, ssr: false });
