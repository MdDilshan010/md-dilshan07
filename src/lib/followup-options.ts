import { z } from "zod";

export const followupInputSchema = z.object({
  explanationId: z.string().uuid(),
  question: z.string().trim().min(1, "Enter a question.").max(2000, "Keep your question under 2,000 characters."),
});

export function ownsExplanation(ownerId: string, userId: string) {
  return ownerId === userId;
}