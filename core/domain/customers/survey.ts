/**
 * Domain: Customer Satisfaction Survey
 *
 * NPS (Net Promoter Score) and CSAT (Customer Satisfaction) surveys
 */

export type SurveyType = "nps" | "csat" | "ces" | "custom";

export type SurveyStatus = "draft" | "active" | "paused" | "completed";

export type TriggerEvent =
  | "order_delivered"
  | "ticket_resolved"
  | "campaign_completed"
  | "manual"
  | "scheduled";

export interface SurveyQuestion {
  id: string;
  type: "rating" | "text" | "choice" | "scale";
  question: string;
  required: boolean;

  // For rating/scale questions
  minValue?: number;
  maxValue?: number;
  minLabel?: string;
  maxLabel?: string;

  // For choice questions
  choices?: string[];
  allowMultiple?: boolean;

  // Order in survey
  order: number;
}

export interface Survey {
  id: string;
  name: string;
  type: SurveyType;
  status: SurveyStatus;

  // Questions
  questions: SurveyQuestion[];

  // Trigger configuration
  triggerEvent: TriggerEvent;
  triggerDelay?: number; // Minutes after event to send survey

  // Targeting
  targetCustomerTier?: string[]; // Only send to specific tiers
  maxResponsesPerCustomer?: number; // Limit survey frequency

  // Statistics
  totalSent: number;
  totalResponses: number;
  responseRate: number; // Percentage

  // For NPS
  npsScore?: number; // -100 to 100
  promoters?: number;
  passives?: number;
  detractors?: number;

  // For CSAT
  csatScore?: number; // Average rating
  csatDistribution?: Record<number, number>; // Count per rating

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastSentAt?: Date;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  surveyName: string;

  // Respondent
  customerId: string;
  customerName: string;
  customerEmail?: string;

  // Answers
  answers: SurveyAnswer[];

  // Calculated scores
  npsScore?: number; // 0-10 for NPS
  csatScore?: number; // Rating for CSAT
  cesScore?: number; // 1-7 for CES (Customer Effort Score)

  // Metadata
  triggeredBy?: string; // Order ID, Ticket ID, etc.
  responseTime?: number; // Seconds to complete
  sentiment?: "positive" | "neutral" | "negative";

  // Timestamps
  sentAt: Date;
  respondedAt?: Date;
  createdAt: Date;
}

export interface SurveyAnswer {
  questionId: string;
  question: string;
  type: "rating" | "text" | "choice" | "scale";

  // Answer values
  ratingValue?: number;
  textValue?: string;
  choiceValues?: string[];
  scaleValue?: number;
}

/**
 * Calculate NPS score from responses
 * NPS = (% Promoters - % Detractors)
 * Promoters: 9-10
 * Passives: 7-8
 * Detractors: 0-6
 */
export function calculateNPS(scores: number[]): {
  npsScore: number;
  promoters: number;
  passives: number;
  detractors: number;
} {
  if (scores.length === 0) {
    return { npsScore: 0, promoters: 0, passives: 0, detractors: 0 };
  }

  let promoters = 0;
  let passives = 0;
  let detractors = 0;

  scores.forEach((score) => {
    if (score >= 9) {
      promoters++;
    } else if (score >= 7) {
      passives++;
    } else {
      detractors++;
    }
  });

  const total = scores.length;
  const npsScore = ((promoters - detractors) / total) * 100;

  return {
    npsScore: Math.round(npsScore),
    promoters,
    passives,
    detractors,
  };
}

/**
 * Calculate CSAT score (average rating)
 */
export function calculateCSAT(ratings: number[]): {
  csatScore: number;
  distribution: Record<number, number>;
} {
  if (ratings.length === 0) {
    return { csatScore: 0, distribution: {} };
  }

  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  const csatScore = sum / ratings.length;

  // Calculate distribution
  const distribution: Record<number, number> = {};
  ratings.forEach((rating) => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });

  return {
    csatScore: Math.round(csatScore * 100) / 100, // Round to 2 decimals
    distribution,
  };
}

/**
 * Calculate CES score (Customer Effort Score)
 * Scale 1-7, lower is better
 */
export function calculateCES(scores: number[]): {
  cesScore: number;
  lowEffort: number; // 1-3
  mediumEffort: number; // 4-5
  highEffort: number; // 6-7
} {
  if (scores.length === 0) {
    return { cesScore: 0, lowEffort: 0, mediumEffort: 0, highEffort: 0 };
  }

  let lowEffort = 0;
  let mediumEffort = 0;
  let highEffort = 0;

  scores.forEach((score) => {
    if (score <= 3) {
      lowEffort++;
    } else if (score <= 5) {
      mediumEffort++;
    } else {
      highEffort++;
    }
  });

  const sum = scores.reduce((acc, score) => acc + score, 0);
  const cesScore = sum / scores.length;

  return {
    cesScore: Math.round(cesScore * 100) / 100,
    lowEffort,
    mediumEffort,
    highEffort,
  };
}

/**
 * Validate survey structure
 */
export function validateSurvey(survey: Partial<Survey>): string[] {
  const errors: string[] = [];

  if (!survey.name || survey.name.trim().length === 0) {
    errors.push("Survey name is required");
  }

  if (!survey.type) {
    errors.push("Survey type is required");
  }

  if (!survey.questions || survey.questions.length === 0) {
    errors.push("Survey must have at least one question");
  }

  if (survey.questions) {
    survey.questions.forEach((q, index) => {
      if (!q.question || q.question.trim().length === 0) {
        errors.push(`Question ${index + 1}: Question text is required`);
      }

      if (q.type === "choice" && (!q.choices || q.choices.length < 2)) {
        errors.push(`Question ${index + 1}: Choice questions need at least 2 options`);
      }

      if (
        (q.type === "rating" || q.type === "scale") &&
        (q.minValue === undefined || q.maxValue === undefined)
      ) {
        errors.push(`Question ${index + 1}: Rating/scale questions need min and max values`);
      }
    });
  }

  if (!survey.triggerEvent) {
    errors.push("Trigger event is required");
  }

  return errors;
}

/**
 * Validate survey response
 */
export function validateSurveyResponse(
  response: Partial<SurveyResponse>,
  survey: Survey
): string[] {
  const errors: string[] = [];

  if (!response.customerId) {
    errors.push("Customer ID is required");
  }

  if (!response.answers || response.answers.length === 0) {
    errors.push("Survey response must have at least one answer");
  }

  // Check all required questions are answered
  const requiredQuestions = survey.questions.filter((q) => q.required);
  const answeredQuestionIds = new Set(
    response.answers?.map((a) => a.questionId) || []
  );

  requiredQuestions.forEach((q) => {
    if (!answeredQuestionIds.has(q.id)) {
      errors.push(`Required question not answered: ${q.question}`);
    }
  });

  return errors;
}

/**
 * Extract score from survey response based on type
 */
export function extractScore(
  response: SurveyResponse,
  surveyType: SurveyType
): number | undefined {
  if (surveyType === "nps") {
    return response.npsScore;
  } else if (surveyType === "csat") {
    return response.csatScore;
  } else if (surveyType === "ces") {
    return response.cesScore;
  }
  return undefined;
}
