import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { googleDriveService } from '../../server/services/google-drive';
import { google } from 'googleapis';

// Mock googleapis
jest.mock('googleapis');

const mockDriveService = {
  files: {
    create: jest.fn()
  },
  permissions: {
    create: jest.fn()
  }
};

const mockGoogleAuth = {
  GoogleAuth: jest.fn().mockImplementation(() => ({}))
};

const mockGoogle = {
  auth: mockGoogleAuth,
  drive: jest.fn().mockReturnValue(mockDriveService)
};

(google as any).auth = mockGoogleAuth;
(google as any).drive = mockGoogle.drive;

describe('GoogleDriveService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'test@service-account.com';
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY = 'test-private-key';
    process.env.GOOGLE_DRIVE_FOLDER_ID = 'test-folder-id';
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const mockUploadResponse = {
        data: {
          id: 'file123',
          webViewLink: 'https://drive.google.com/file/d/file123/view',
          webContentLink: 'https://drive.google.com/uc?id=file123'
        }
      };

      mockDriveService.files.create.mockResolvedValue(mockUploadResponse);
      mockDriveService.permissions.create.mockResolvedValue({});

      const buffer = Buffer.from('test file content');
      const result = await googleDriveService.uploadFile(
        buffer,
        'test-file.jpg',
        'image/jpeg'
      );

      expect(mockDriveService.files.create).toHaveBeenCalledWith({
        requestBody: {
          name: 'test-file.jpg',
          parents: ['test-folder-id']
        },
        media: {
          mimeType: 'image/jpeg',
          body: expect.any(Object)
        },
        fields: 'id,webViewLink,webContentLink'
      });

      expect(mockDriveService.permissions.create).toHaveBeenCalledWith({
        fileId: 'file123',
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });

      expect(result).toEqual({
        id: 'file123',
        webViewLink: 'https://drive.google.com/file/d/file123/view',
        webContentLink: 'https://drive.google.com/uc?id=file123'
      });
    });

    it('should handle upload failures with retry', async () => {
      const mockError = new Error('Network error');
      
      // First two calls fail, third succeeds
      mockDriveService.files.create
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce({
          data: {
            id: 'file123',
            webViewLink: 'https://drive.google.com/file/d/file123/view',
            webContentLink: 'https://drive.google.com/uc?id=file123'
          }
        });

      mockDriveService.permissions.create.mockResolvedValue({});

      const buffer = Buffer.from('test file content');
      const result = await googleDriveService.uploadFile(
        buffer,
        'test-file.jpg',
        'image/jpeg'
      );

      expect(mockDriveService.files.create).toHaveBeenCalledTimes(3);
      expect(result.id).toBe('file123');
    });

    it('should fail after maximum retries', async () => {
      const mockError = new Error('Persistent network error');
      mockDriveService.files.create.mockRejectedValue(mockError);

      const buffer = Buffer.from('test file content');
      
      await expect(
        googleDriveService.uploadFile(buffer, 'test-file.jpg', 'image/jpeg')
      ).rejects.toThrow('Failed to upload file after 4 attempts');

      expect(mockDriveService.files.create).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });

    it('should use exponential backoff for retries', async () => {
      const mockError = new Error('Network error');
      
      // Mock setTimeout to track delay times
      const originalSetTimeout = global.setTimeout;
      const setTimeoutSpy = jest.fn().mockImplementation((callback) => {
        callback();
        return {} as any;
      });
      global.setTimeout = setTimeoutSpy;

      mockDriveService.files.create
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce({
          data: {
            id: 'file123',
            webViewLink: 'https://drive.google.com/file/d/file123/view',
            webContentLink: 'https://drive.google.com/uc?id=file123'
          }
        });

      mockDriveService.permissions.create.mockResolvedValue({});

      const buffer = Buffer.from('test file content');
      await googleDriveService.uploadFile(buffer, 'test-file.jpg', 'image/jpeg');

      // Should have delays of 1000ms (2^0) and 2000ms (2^1)
      expect(setTimeoutSpy).toHaveBeenCalledTimes(2);

      global.setTimeout = originalSetTimeout;
    });

    it('should handle permission creation errors', async () => {
      const mockUploadResponse = {
        data: {
          id: 'file123',
          webViewLink: 'https://drive.google.com/file/d/file123/view',
          webContentLink: 'https://drive.google.com/uc?id=file123'
        }
      };

      mockDriveService.files.create.mockResolvedValue(mockUploadResponse);
      mockDriveService.permissions.create.mockRejectedValue(new Error('Permission error'));

      const buffer = Buffer.from('test file content');
      
      await expect(
        googleDriveService.uploadFile(buffer, 'test-file.jpg', 'image/jpeg')
      ).rejects.toThrow('Permission error');
    });

    it('should use default folder when GOOGLE_DRIVE_FOLDER_ID not set', async () => {
      delete process.env.GOOGLE_DRIVE_FOLDER_ID;

      const mockUploadResponse = {
        data: {
          id: 'file123',
          webViewLink: 'https://drive.google.com/file/d/file123/view',
          webContentLink: 'https://drive.google.com/uc?id=file123'
        }
      };

      mockDriveService.files.create.mockResolvedValue(mockUploadResponse);
      mockDriveService.permissions.create.mockResolvedValue({});

      const buffer = Buffer.from('test file content');
      await googleDriveService.uploadFile(buffer, 'test-file.jpg', 'image/jpeg');

      expect(mockDriveService.files.create).toHaveBeenCalledWith(
        expect.objectContaining({
          requestBody: expect.objectContaining({
            parents: ['root']
          })
        })
      );
    });
  });

  describe('resumableUpload', () => {
    it('should perform resumable upload for large files', async () => {
      const mockUploadResponse = {
        data: {
          id: 'file123',
          webViewLink: 'https://drive.google.com/file/d/file123/view',
          webContentLink: 'https://drive.google.com/uc?id=file123'
        }
      };

      mockDriveService.files.create.mockResolvedValue(mockUploadResponse);

      const buffer = Buffer.from('large file content');
      const result = await googleDriveService.resumableUpload(
        buffer,
        'large-file.mp4',
        'video/mp4'
      );

      expect(mockDriveService.files.create).toHaveBeenCalledWith({
        requestBody: {
          name: 'large-file.mp4',
          parents: ['test-folder-id']
        },
        media: {
          mimeType: 'video/mp4',
          body: expect.any(Object)
        },
        fields: 'id,webViewLink,webContentLink',
        uploadType: 'resumable'
      });

      expect(result).toEqual({
        id: 'file123',
        webViewLink: 'https://drive.google.com/file/d/file123/view',
        webContentLink: 'https://drive.google.com/uc?id=file123'
      });
    });

    it('should handle resumable upload errors', async () => {
      const mockError = new Error('Resumable upload failed');
      mockDriveService.files.create.mockRejectedValue(mockError);

      const buffer = Buffer.from('large file content');
      
      await expect(
        googleDriveService.resumableUpload(buffer, 'large-file.mp4', 'video/mp4')
      ).rejects.toThrow('Resumable upload failed');
    });
  });

  describe('constructor', () => {
    it('should initialize with correct authentication', () => {
      expect(mockGoogleAuth.GoogleAuth).toHaveBeenCalledWith({
        credentials: {
          client_email: 'test@service-account.com',
          private_key: 'test-private-key'
        },
        scopes: ['https://www.googleapis.com/auth/drive.file']
      });

      expect(mockGoogle.drive).toHaveBeenCalledWith({
        version: 'v3',
        auth: expect.any(Object)
      });
    });

    it('should handle newline characters in private key', () => {
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY = 'test\\nwith\\nnewlines';

      // Re-import to trigger constructor
      jest.resetModules();
      require('../../server/services/google-drive');

      expect(mockGoogleAuth.GoogleAuth).toHaveBeenCalledWith({
        credentials: {
          client_email: 'test@service-account.com',
          private_key: 'test\nwith\nnewlines'
        },
        scopes: ['https://www.googleapis.com/auth/drive.file']
      });
    });
  });
});