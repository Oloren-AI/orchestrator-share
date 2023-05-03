import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { z } from "zod";

const bodySchema = z.object({
  graph: z.any(),
  dispatcherUrl: z.string(),
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const body = bodySchema.parse(req.body);

  prisma.app
    .create({
      data: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        graph: body.graph,
        dispatcherUrl: body.dispatcherUrl,
      },
    })
    .then((app) => {
      res.status(200).json({ id: app.id });
    })
    .catch((e) => {
      res.status(500).json({ error: String(e) });
    });
}
