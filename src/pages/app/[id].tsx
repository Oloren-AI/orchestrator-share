import { useRouter } from "next/router";
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { prisma } from "~/server/db";
import { Alert, Button, Typography } from "antd";
import { useSocket } from "../../util/general";
import { useState } from "react";
import RemoteComponent from "../../RemoteComponent";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const app = await prisma.app.findUnique({
    where: { id: context.params?.id as string },
  });

  if (!app) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  return {
    props: {
      app: {
        ...app,
        createdAt: app.createdAt.toISOString(),
      },
    },
  };
}

export default function App({
  app,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [nodes, setNodes] = useState<any[]>([]);

  const uuid = useSocket(app.dispatcherUrl, {
    node: (node: any) => {
      setNodes((nodes) => [...nodes, node]);
    },
  });

  return (
    <main className="mx-auto w-full max-w-3xl p-4">
      <Typography.Title>App</Typography.Title>
      <Button
        className="w-full"
        onClick={() => {
          fetch(app.dispatcherUrl + "/run_graph", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              graph: app.graph,
              uuid: uuid,
            }),
          });
        }}
      >
        Run App
      </Button>
      {nodes.map((node, idx) => {
        if ("data" in node && "remote" in node.data) {
          return (
            <div key={idx}>
              <pre>{JSON.stringify(node.data)}</pre>
              <RemoteComponent
                module={node.data.remote.module}
                scope={node.data.remote.scope}
                url={node.data.remote.url}
                params={{ node: node.data, setNode: () => {} }}
              />
            </div>
          );
        }
        return (
          <div key={idx}>
            <Typography.Text className="font-bold">
              Node Message
            </Typography.Text>
            <pre>{JSON.stringify(node, null, 2)}</pre>
          </div>
        );
      })}
    </main>
  );
}
