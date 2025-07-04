import { 
  inspections, 
  inspectionMedia, 
  inspectionReports,
  type Inspection, 
  type InsertInspection,
  type InspectionMedia,
  type InsertInspectionMedia,
  type InspectionReport,
  type InsertInspectionReport
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Inspection CRUD
  createInspection(inspection: InsertInspection): Promise<Inspection>;
  getInspection(id: number): Promise<Inspection | undefined>;
  getInspectionByOrderNumber(orderNumber: string): Promise<Inspection | undefined>;
  updateInspection(id: number, data: Partial<InsertInspection>): Promise<Inspection>;
  deleteInspection(id: number): Promise<void>;
  
  // Media CRUD
  createInspectionMedia(media: InsertInspectionMedia): Promise<InspectionMedia>;
  getInspectionMedia(inspectionId: number): Promise<InspectionMedia[]>;
  updateInspectionMedia(id: number, data: Partial<InsertInspectionMedia>): Promise<InspectionMedia>;
  
  // Report CRUD
  createInspectionReport(report: InsertInspectionReport): Promise<InspectionReport>;
  getInspectionReport(inspectionId: number): Promise<InspectionReport | undefined>;
  updateInspectionReport(id: number, data: Partial<InsertInspectionReport>): Promise<InspectionReport>;
}

export class DatabaseStorage implements IStorage {
  async createInspection(inspection: InsertInspection): Promise<Inspection> {
    const [result] = await db
      .insert(inspections)
      .values(inspection)
      .returning();
    return result;
  }

  async getInspection(id: number): Promise<Inspection | undefined> {
    const [result] = await db
      .select()
      .from(inspections)
      .where(eq(inspections.id, id));
    return result || undefined;
  }

  async getInspectionByOrderNumber(orderNumber: string): Promise<Inspection | undefined> {
    const [result] = await db
      .select()
      .from(inspections)
      .where(eq(inspections.orderNumber, orderNumber));
    return result || undefined;
  }

  async updateInspection(id: number, data: Partial<InsertInspection>): Promise<Inspection> {
    const [result] = await db
      .update(inspections)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(inspections.id, id))
      .returning();
    return result;
  }

  async deleteInspection(id: number): Promise<void> {
    await db.delete(inspections).where(eq(inspections.id, id));
  }

  async createInspectionMedia(media: InsertInspectionMedia): Promise<InspectionMedia> {
    const [result] = await db
      .insert(inspectionMedia)
      .values(media)
      .returning();
    return result;
  }

  async getInspectionMedia(inspectionId: number): Promise<InspectionMedia[]> {
    return await db
      .select()
      .from(inspectionMedia)
      .where(eq(inspectionMedia.inspectionId, inspectionId));
  }

  async updateInspectionMedia(id: number, data: Partial<InsertInspectionMedia>): Promise<InspectionMedia> {
    const [result] = await db
      .update(inspectionMedia)
      .set(data)
      .where(eq(inspectionMedia.id, id))
      .returning();
    return result;
  }

  async createInspectionReport(report: InsertInspectionReport): Promise<InspectionReport> {
    const [result] = await db
      .insert(inspectionReports)
      .values(report)
      .returning();
    return result;
  }

  async getInspectionReport(inspectionId: number): Promise<InspectionReport | undefined> {
    const [result] = await db
      .select()
      .from(inspectionReports)
      .where(eq(inspectionReports.inspectionId, inspectionId));
    return result || undefined;
  }

  async updateInspectionReport(id: number, data: Partial<InsertInspectionReport>): Promise<InspectionReport> {
    const [result] = await db
      .update(inspectionReports)
      .set(data)
      .where(eq(inspectionReports.id, id))
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
