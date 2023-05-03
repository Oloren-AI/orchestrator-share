import { Button, Typography } from "antd";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Orchestrator Sharing</title>
        <meta
          name="description"
          content="Platform for quickly sharing apps built with Orchestrator."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="mx-auto flex w-full max-w-3xl flex-col space-y-2 p-4">
        <Typography.Text>
          Hello this is the sharing site for oloren orchestrator. Hit the share
          button to deploy here.
        </Typography.Text>
      </main>
    </>
  );
};

export default Home;
