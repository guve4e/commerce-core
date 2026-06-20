export class CreateRecommendationDto {
  sourceProductId: string;
  targetProductId: string;
  reason?: string;
  weight?: number;
}
