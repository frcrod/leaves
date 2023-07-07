import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";
import Form from "~/components/form";

export default function Home() {
  const { data } = api.leaveForms.findWithinTargetDate.useQuery();

  return (
    <>
      <Head>
        <title>Leaves</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Form />
        {JSON.stringify(data)}
      </main>
    </>
  );
}
