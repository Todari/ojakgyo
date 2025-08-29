import { z } from 'zod';

export const requestDetailsSchema = z.object({
  categories: z.array(z.string()).min(1, '최소 1개 선택'),
  details: z.string().min(1, '추가 요청사항을 입력하세요').max(800),
});

export type RequestDetailsForm = z.infer<typeof requestDetailsSchema>;


