import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const inspections = pgTable("inspections", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull(),
  vin: text("vin").notNull(),
  vehicleModel: text("vehicle_model").notNull(),
  vehicleColor: text("vehicle_color").notNull(),
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  salesRepEmail: text("sales_rep_email"),
  status: text("status").notNull().default("draft"), // draft, completed, submitted
  inspectionData: jsonb("inspection_data").notNull(),
  signatureData: text("signature_data"),
  totalItems: integer("total_items").notNull(),
  completedItems: integer("completed_items").notNull().default(0),
  failedItems: integer("failed_items").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const inspectionMedia = pgTable("inspection_media", {
  id: serial("id").primaryKey(),
  inspectionId: integer("inspection_id").references(() => inspections.id).notNull(),
  itemId: text("item_id").notNull(),
  mediaType: text("media_type").notNull(), // photo, video
  fileName: text("file_name").notNull(),
  driveFileId: text("drive_file_id"),
  driveLink: text("drive_link"),
  uploadStatus: text("upload_status").notNull().default("pending"), // pending, uploaded, failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inspectionReports = pgTable("inspection_reports", {
  id: serial("id").primaryKey(),
  inspectionId: integer("inspection_id").references(() => inspections.id).notNull(),
  pdfFileName: text("pdf_file_name").notNull(),
  driveFileId: text("drive_file_id"),
  driveLink: text("drive_link"),
  emailSent: boolean("email_sent").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inspectionRelations = relations(inspections, ({ many }) => ({
  media: many(inspectionMedia),
  reports: many(inspectionReports),
}));

export const inspectionMediaRelations = relations(inspectionMedia, ({ one }) => ({
  inspection: one(inspections, {
    fields: [inspectionMedia.inspectionId],
    references: [inspections.id],
  }),
}));

export const inspectionReportsRelations = relations(inspectionReports, ({ one }) => ({
  inspection: one(inspections, {
    fields: [inspectionReports.inspectionId],
    references: [inspections.id],
  }),
}));

export const insertInspectionSchema = createInsertSchema(inspections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInspectionMediaSchema = createInsertSchema(inspectionMedia).omit({
  id: true,
  createdAt: true,
});

export const insertInspectionReportSchema = createInsertSchema(inspectionReports).omit({
  id: true,
  createdAt: true,
});

export type Inspection = typeof inspections.$inferSelect;
export type InsertInspection = z.infer<typeof insertInspectionSchema>;
export type InspectionMedia = typeof inspectionMedia.$inferSelect;
export type InsertInspectionMedia = z.infer<typeof insertInspectionMediaSchema>;
export type InspectionReport = typeof inspectionReports.$inferSelect;
export type InsertInspectionReport = z.infer<typeof insertInspectionReportSchema>;
