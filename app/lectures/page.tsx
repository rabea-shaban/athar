import { redirect } from "next/navigation";

export default function LecturesRedirectPage() {
  redirect("/programs?tab=lectures");
}
