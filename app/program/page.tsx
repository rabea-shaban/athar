import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{ id?: string }>;
}

export default async function ProgramRedirectPage({ searchParams }: Props) {
  const params = await searchParams;
  const programId = params.id;

  if (programId) {
    redirect(`/programs/${programId}`);
  }

  redirect("/programs");
}
