import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { runScreenSync, type ScreenResult } from "./screen-engine";

const ScreenInput = z.object({
  mutation: z.string().min(1),
  generateCount: z.number().int().min(4).max(400).default(60),
  alpha: z.number().min(0).max(1).default(0.45),
  beta: z.number().min(0).max(1).default(0.55),
  includeReference: z.boolean().default(true),
});

export const runScreen = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ScreenInput.parse(input))
  .handler(async ({ data }): Promise<ScreenResult> => {
    return runScreenSync({
      mutation: data.mutation,
      generateCount: data.generateCount,
      weights: { alpha: data.alpha, beta: data.beta },
      includeReference: data.includeReference,
    });
  });
