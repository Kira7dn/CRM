import type {
  Survey,
  SurveyResponse,
  SurveyType,
} from "@/core/domain/customers/survey";
import {
  calculateNPS,
  calculateCSAT,
  calculateCES,
} from "@/core/domain/customers/survey";
import type {
  SurveyService,
  SurveyPayload,
  SurveyResponsePayload,
  SurveyFilters,
} from "@/core/application/interfaces/survey-service";
import { ObjectId } from "mongodb";
import { BaseRepository } from "@/infrastructure/db/base-repository";

interface SurveyDocument extends Omit<Survey, "id"> {
  _id: ObjectId;
}

interface SurveyResponseDocument extends Omit<SurveyResponse, "id"> {
  _id: ObjectId;
}

export class SurveyRepository
  extends BaseRepository<Survey, string>
  implements SurveyService {
  protected collectionName = "surveys";
  private responsesCollectionName = "survey_responses";

  private toResponseDomain(doc: SurveyResponseDocument): SurveyResponse {
    const { _id, ...data } = doc;
    return { ...data, id: _id.toString() };
  }

  private toResponseDocument(
    entity: Partial<SurveyResponse>
  ): Omit<SurveyResponseDocument, "_id"> {
    const { id, ...data } = entity;
    return data as Omit<SurveyResponseDocument, "_id">;
  }

  /**
   * Get responses collection
   */
  private async getResponsesCollection() {
    const client = await this.getClient();
    return client.db(process.env.MONGODB_DB).collection(this.responsesCollectionName);
  }

  /**
   * Create new survey
   */
  async create(payload: SurveyPayload): Promise<Survey> {
    const collection = await this.getCollection();
    const doc = this.toDocument(payload as any) as Omit<SurveyDocument, "_id">;

    const result = await collection.insertOne({
      ...doc,
      _id: new ObjectId(),
    } as SurveyDocument);

    const created = await collection.findOne({ _id: result.insertedId });
    if (!created) {
      throw new Error("Failed to create survey");
    }
    return this.toDomain(created as any);
  }

  /**
   * Get all surveys with filters
   */
  async getAll(filters?: SurveyFilters): Promise<Survey[]> {
    const collection = await this.getCollection();
    const query: any = {};

    if (filters?.type) {
      query.type = filters.type;
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    const docs = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(filters?.offset || 0)
      .limit(filters?.limit || 50)
      .toArray();

    return docs.map((doc) => this.toDomain(doc as any));
  }

  /**
   * Get survey by ID
   */
  async getById(id: string): Promise<Survey | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({ _id: new ObjectId(id) });
    return doc ? (this.toDomain(doc as any) as Survey) : null;
  }

  /**
   * Update survey
   */
  async update(
    id: string,
    payload: Partial<SurveyPayload>
  ): Promise<Survey | null> {
    const collection = await this.getCollection();
    const doc = this.toDocument(payload as any);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...doc, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    return result ? (this.toDomain(result as any) as Survey) : null;
  }

  /**
   * Delete survey
   */
  async delete(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }

  /**
   * Submit survey response
   */
  async submitResponse(payload: SurveyResponsePayload): Promise<SurveyResponse> {
    const collection = await this.getResponsesCollection();
    const doc = this.toResponseDocument(payload as any);

    const result = await collection.insertOne({
      ...doc,
      _id: new ObjectId(),
    } as SurveyResponseDocument);

    const created = await collection.findOne({ _id: result.insertedId });
    if (!created) {
      throw new Error("Failed to submit response");
    }
    return this.toResponseDomain(created as SurveyResponseDocument);
  }

  /**
   * Get responses for a survey
   */
  async getResponses(
    surveyId: string,
    limit?: number
  ): Promise<SurveyResponse[]> {
    const collection = await this.getResponsesCollection();

    const query = { surveyId };
    const docs = await collection
      .find(query)
      .sort({ respondedAt: -1 })
      .limit(limit || 1000)
      .toArray();

    return docs.map((doc) =>
      this.toResponseDomain(doc as SurveyResponseDocument)
    );
  }

  /**
   * Get response by ID
   */
  async getResponseById(responseId: string): Promise<SurveyResponse | null> {
    const collection = await this.getResponsesCollection();
    const doc = await collection.findOne({ _id: new ObjectId(responseId) });
    return doc
      ? this.toResponseDomain(doc as SurveyResponseDocument)
      : null;
  }

  /**
   * Update survey statistics
   */
  async updateSurveyStats(surveyId: string): Promise<Survey | null> {
    const survey = await this.getById(surveyId);
    if (!survey) {
      return null;
    }

    const responses = await this.getResponses(surveyId);

    // Calculate basic stats
    const totalResponses = responses.filter((r) => r.respondedAt).length;
    const totalSent = survey.totalSent || responses.length;
    const responseRate =
      totalSent > 0 ? Math.round((totalResponses / totalSent) * 100) : 0;

    const updateData: Partial<Survey> = {
      totalResponses,
      responseRate,
      lastSentAt: survey.lastSentAt || new Date(),
    };

    // Calculate type-specific metrics
    if (survey.type === "nps") {
      const npsScores = responses
        .map((r) => r.npsScore)
        .filter((s): s is number => s !== undefined);

      if (npsScores.length > 0) {
        const npsMetrics = calculateNPS(npsScores);
        updateData.npsScore = npsMetrics.npsScore;
        updateData.promoters = npsMetrics.promoters;
        updateData.passives = npsMetrics.passives;
        updateData.detractors = npsMetrics.detractors;
      }
    } else if (survey.type === "csat") {
      const csatScores = responses
        .map((r) => r.csatScore)
        .filter((s): s is number => s !== undefined);

      if (csatScores.length > 0) {
        const csatMetrics = calculateCSAT(csatScores);
        updateData.csatScore = csatMetrics.csatScore;
        updateData.csatDistribution = csatMetrics.distribution;
      }
    }

    return this.update(surveyId, updateData);
  }
}
