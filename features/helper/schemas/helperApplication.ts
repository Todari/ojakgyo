import { z } from 'zod';

export const helperIntroSchema = z.object({
  age: z.string().min(1, '나이를 입력하세요').regex(/^\d+$/, '숫자만 입력하세요'),
  introduction: z.string().min(1, '자기소개를 입력하세요').max(500),
  experience: z.string().max(300).optional(),
});

export type HelperIntroForm = z.infer<typeof helperIntroSchema>;


