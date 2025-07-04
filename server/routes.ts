import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInspectionSchema, insertInspectionMediaSchema } from "@shared/schema";
import { teslaApiService } from "./services/tesla-api";
import { googleDriveService } from "./services/google-drive";
import { pdfGenerator } from "./services/pdf-generator";
import { emailService } from "./services/email";
import multer from "multer";
import { z } from "zod";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create new inspection
  app.post("/api/inspections", async (req, res) => {
    try {
      const validatedData = insertInspectionSchema.parse(req.body);
      const inspection = await storage.createInspection(validatedData);
      res.json(inspection);
    } catch (error) {
      console.error("Error creating inspection:", error);
      res.status(400).json({ error: "Invalid inspection data" });
    }
  });

  // Get inspection by ID
  app.get("/api/inspections/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const inspection = await storage.getInspection(id);
      if (!inspection) {
        return res.status(404).json({ error: "Inspection not found" });
      }
      res.json(inspection);
    } catch (error) {
      console.error("Error fetching inspection:", error);
      res.status(500).json({ error: "Failed to fetch inspection" });
    }
  });

  // Update inspection
  app.put("/api/inspections/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertInspectionSchema.partial().parse(req.body);
      const inspection = await storage.updateInspection(id, validatedData);
      res.json(inspection);
    } catch (error) {
      console.error("Error updating inspection:", error);
      res.status(400).json({ error: "Invalid inspection data" });
    }
  });

  // Get Tesla order status
  app.get("/api/tesla/order/:orderNumber", async (req, res) => {
    try {
      const orderNumber = req.params.orderNumber;
      const orderData = await teslaApiService.getOrderStatus(orderNumber);
      res.json(orderData);
    } catch (error) {
      console.error("Error fetching Tesla order:", error);
      res.status(500).json({ error: "Failed to fetch order status" });
    }
  });

  // Upload media for inspection item
  app.post("/api/inspections/:id/media", upload.single("media"), async (req, res) => {
    try {
      const inspectionId = parseInt(req.params.id);
      const { itemId, mediaType } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Validate file size (50MB limit)
      const MAX_FILE_SIZE = 50 * 1024 * 1024;
      if (req.file.size > MAX_FILE_SIZE) {
        return res.status(400).json({ error: "File size exceeds 50MB limit" });
      }

      // Validate file type
      const isPhoto = req.file.mimetype.startsWith('image/');
      const isVideo = req.file.mimetype.startsWith('video/');
      
      if (!isPhoto && !isVideo) {
        return res.status(400).json({ error: "Invalid file type. Only photos and videos are allowed." });
      }

      // Get existing media for this item to check limits
      const existingMedia = await storage.getInspectionMedia(inspectionId);
      const itemMedia = existingMedia.filter(m => m.itemId === itemId);
      const existingPhotos = itemMedia.filter(m => m.mediaType === 'photo').length;
      const existingVideos = itemMedia.filter(m => m.mediaType === 'video').length;

      // Validate media limits
      if (isPhoto && existingPhotos >= 5) {
        return res.status(400).json({ error: "Maximum 5 photos allowed per inspection item" });
      }

      if (isVideo && existingVideos >= 1) {
        return res.status(400).json({ error: "Only one video allowed per inspection item" });
      }

      // For videos, validate duration if possible (this is best effort, client-side validation is primary)
      if (isVideo) {
        // Note: Server-side video duration validation is complex and resource-intensive
        // The 2-minute limit is primarily enforced on the client side
        console.log(`Video upload: ${req.file.originalname}, size: ${req.file.size} bytes`);
      }

      // Upload to Google Drive (use resumable upload for videos over 10MB)
      let driveResult;
      if (isVideo && req.file.size > 10 * 1024 * 1024) {
        driveResult = await googleDriveService.resumableUpload(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype
        );
      } else {
        driveResult = await googleDriveService.uploadFile(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype
        );
      }

      // Save media record
      const mediaRecord = await storage.createInspectionMedia({
        inspectionId,
        itemId,
        mediaType: isPhoto ? 'photo' : 'video',
        fileName: req.file.originalname,
        driveFileId: driveResult.id,
        driveLink: driveResult.webViewLink,
        uploadStatus: "uploaded"
      });

      res.json(mediaRecord);
    } catch (error) {
      console.error("Error uploading media:", error);
      res.status(500).json({ error: "Failed to upload media" });
    }
  });

  // Get media for inspection
  app.get("/api/inspections/:id/media", async (req, res) => {
    try {
      const inspectionId = parseInt(req.params.id);
      const media = await storage.getInspectionMedia(inspectionId);
      res.json(media);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ error: "Failed to fetch media" });
    }
  });

  // Generate and send PDF report
  app.post("/api/inspections/:id/complete", async (req, res) => {
    try {
      const inspectionId = parseInt(req.params.id);
      const inspection = await storage.getInspection(inspectionId);
      
      if (!inspection) {
        return res.status(404).json({ error: "Inspection not found" });
      }

      // Get media for the inspection
      const media = await storage.getInspectionMedia(inspectionId);

      // Generate PDF
      const pdfBuffer = await pdfGenerator.generateInspectionReport(inspection, media);
      
      // Upload PDF to Google Drive
      const driveResult = await googleDriveService.uploadFile(
        pdfBuffer,
        `Tesla_Inspection_${inspection.orderNumber}.pdf`,
        "application/pdf"
      );

      // Save report record
      const report = await storage.createInspectionReport({
        inspectionId,
        pdfFileName: `Tesla_Inspection_${inspection.orderNumber}.pdf`,
        driveFileId: driveResult.id,
        driveLink: driveResult.webViewLink
      });

      // Send email
      const emailSent = await emailService.sendInspectionReport(inspection, driveResult.webViewLink);
      
      if (emailSent) {
        await storage.updateInspectionReport(report.id, { emailSent: true });
      }

      // Update inspection status
      await storage.updateInspection(inspectionId, { status: "completed" });

      res.json({ 
        success: true, 
        reportId: report.id,
        pdfLink: driveResult.webViewLink,
        emailSent 
      });
    } catch (error) {
      console.error("Error completing inspection:", error);
      res.status(500).json({ error: "Failed to complete inspection" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
