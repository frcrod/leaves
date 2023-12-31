import Head from "next/head";
import { api } from "~/utils/api";
import Form from "~/components/form";
import Stat from "~/components/stat";
import classNames from "classnames";
import { useEffect } from "react";
import Navbar from "~/components/navbar";
import { Montserrat } from "@next/font/google";

type MontserratTypes = ReturnType<typeof Montserrat>;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const montserrat: MontserratTypes = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export default function Home() {
  const { data: proRatedData, refetch: proRatedRefetch } =
    api.leaveForms.generateProRated.useQuery({});

  useEffect(() => {
    proRatedRefetch().catch((err: Error) => console.log(err));
  }, [proRatedRefetch]);

  return (
    <>
      <Head>
        <title>Leaves</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={classNames(montserrat.className)}>
        <Navbar className="mx-auto w-10/12 px-14" />
        <div className="mx-auto mt-8 flex w-9/12 flex-col justify-center gap-3">
          <div className="flex gap-3">
            <Stat
              title="Total Pro-rated Leave"
              value={proRatedData?.proRatedInDateRange}
              sub={`${proRatedData?.startMonth} - ${proRatedData?.endMonth}`}
            />
            <Stat
              title="Pro-rated (Used)"
              value={proRatedData?.accumulated}
              sub={`${proRatedData?.startMonth} - ${proRatedData?.endMonth}`}
            />
            <Stat
              title="Leave Balance"
              value={24 - proRatedData?.accumulated}
              sub={`Whole Year`}
            />
          </div>
          <Form className="w-full" />
        </div>
      </main>
    </>
  );
}
