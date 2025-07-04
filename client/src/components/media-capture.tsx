import { useState, useRef, useEffect } from "react";
import { Camera, Video, X, Upload, Play, Pause, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";

interface MediaCaptureProps {
  onCapture: (mediaData: any) => void;
  onClose: () => void;
  inspectionId: number | null;
  itemId: string;
  existingMedia?: any[];
}

export function MediaCapture({ onCapture, onClose, inspectionId, itemId, existingMedia = [] }: MediaCaptureProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Media validation constants
  const MAX_PHOTOS = 5;
  const MAX_VIDEO_DURATION = 120; // 2 minutes in seconds
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  // Count existing media
  const existingPhotos = existingMedia.filter(m => m.mediaType === 'photo').length;
  const existingVideos = existingMedia.filter(m => m.mediaType === 'video').length;
  const canAddPhoto = existingPhotos < MAX_PHOTOS;
  const canAddVideo = existingVideos === 0; // Only one video per item

  const uploadMediaMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!inspectionId) throw new Error('No inspection ID');
      
      const formData = new FormData();
      formData.append('media', file);
      formData.append('itemId', itemId);
      formData.append('mediaType', file.type.startsWith('image/') ? 'photo' : 'video');

      return apiRequest(`/api/inspections/${inspectionId}/media`, {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Media Uploaded",
        description: "Evidence has been successfully uploaded.",
      });
      onCapture(data);
      queryClient.invalidateQueries({ queryKey: ['/api/inspections', inspectionId, 'media'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload media. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: mode === 'video',
      });
      
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: `Please allow camera access to capture ${mode === 'video' ? 'videos' : 'photos'}.`,
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
            uploadMediaMutation.mutate(file);
          }
        }, 'image/jpeg', 0.8);
      }
    }
    stopCamera();
  };

  const startVideoRecording = () => {
    if (!mediaStream) return;

    try {
      const recorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm;codecs=vp9',
      });
      
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        if (blob.size > MAX_FILE_SIZE) {
          toast({
            title: "File Too Large",
            description: "Video file exceeds 50MB limit. Please record a shorter video.",
            variant: "destructive",
          });
          return;
        }
        
        const file = new File([blob], `video_${Date.now()}.webm`, { type: 'video/webm' });
        uploadMediaMutation.mutate(file);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= MAX_VIDEO_DURATION) {
            stopVideoRecording();
          }
          return newTime;
        });
      }, 1000);

    } catch (error) {
      toast({
        title: "Recording Failed",
        description: "Unable to start video recording. Please try again.",
        variant: "destructive",
      });
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      stopCamera();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isPhoto = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isPhoto && !isVideo) {
      toast({
        title: "Invalid File Type",
        description: "Please select a photo or video file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File Too Large",
        description: "File exceeds 50MB limit. Please choose a smaller file.",
        variant: "destructive",
      });
      return;
    }

    // Validate media limits
    if (isPhoto && !canAddPhoto) {
      toast({
        title: "Photo Limit Reached",
        description: `Maximum ${MAX_PHOTOS} photos allowed per inspection item.`,
        variant: "destructive",
      });
      return;
    }

    if (isVideo && !canAddVideo) {
      toast({
        title: "Video Limit Reached",
        description: "Only one video allowed per inspection item.",
        variant: "destructive",
      });
      return;
    }

    // For videos, check duration if possible
    if (isVideo) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        if (video.duration > MAX_VIDEO_DURATION) {
          toast({
            title: "Video Too Long",
            description: `Videos must be under ${MAX_VIDEO_DURATION / 60} minutes.`,
            variant: "destructive",
          });
          return;
        }
        uploadMediaMutation.mutate(file);
      };
      
      video.onerror = () => {
        // If we can't read metadata, proceed with upload
        uploadMediaMutation.mutate(file);
      };
      
      video.src = URL.createObjectURL(file);
    } else {
      uploadMediaMutation.mutate(file);
    }
    
    // Reset file input
    event.target.value = '';
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // Reset camera when mode changes
  useEffect(() => {
    if (mediaStream) {
      stopCamera();
    }
  }, [mode]);

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Add Evidence
            <div className="text-xs text-gray-500">
              {existingPhotos}/{MAX_PHOTOS} photos • {existingVideos}/1 video
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mode Selection */}
          <div className="flex gap-2">
            <Button
              onClick={() => setMode('photo')}
              variant={mode === 'photo' ? 'default' : 'outline'}
              size="sm"
              disabled={!canAddPhoto}
              className="flex-1"
            >
              <Camera className="w-4 h-4 mr-2" />
              Photo {!canAddPhoto && `(${MAX_PHOTOS} max)`}
            </Button>
            <Button
              onClick={() => setMode('video')}
              variant={mode === 'video' ? 'default' : 'outline'}
              size="sm"
              disabled={!canAddVideo}
              className="flex-1"
            >
              <Video className="w-4 h-4 mr-2" />
              Video {!canAddVideo && '(limit reached)'}
            </Button>
          </div>

          {/* Camera View */}
          {mediaStream && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-lg bg-black"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Recording Indicator */}
              {isRecording && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                  {formatTime(recordingTime)} / {formatTime(MAX_VIDEO_DURATION)}
                </div>
              )}

              {/* Recording Progress */}
              {isRecording && (
                <div className="absolute bottom-2 left-2 right-2">
                  <Progress 
                    value={(recordingTime / MAX_VIDEO_DURATION) * 100} 
                    className="h-1 bg-white/20"
                  />
                </div>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            {mode === 'photo' ? (
              <Button
                onClick={mediaStream ? takePhoto : startCamera}
                disabled={uploadMediaMutation.isPending || !canAddPhoto}
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-2" />
                {mediaStream ? "Take Photo" : "Camera"}
              </Button>
            ) : (
              <Button
                onClick={isRecording ? stopVideoRecording : (mediaStream ? startVideoRecording : startCamera)}
                disabled={uploadMediaMutation.isPending || (!canAddVideo && !isRecording)}
                className="flex-1"
                variant={isRecording ? "destructive" : "default"}
              >
                {isRecording ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    {mediaStream ? "Start Recording" : "Camera"}
                  </>
                )}
              </Button>
            )}

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMediaMutation.isPending || (mode === 'photo' ? !canAddPhoto : !canAddVideo)}
              variant="outline"
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>

            {mediaStream && !isRecording && (
              <Button onClick={stopCamera} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={mode === 'photo' ? 'image/*' : 'video/*'}
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Upload Status */}
          {uploadMediaMutation.isPending && (
            <div className="text-center text-sm text-gray-600 flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
              Uploading media...
            </div>
          )}

          {/* Existing Media Summary */}
          {existingMedia.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Existing Evidence ({existingMedia.length})
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                {existingMedia.map((media, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{media.fileName}</span>
                    <span className="capitalize">{media.mediaType}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
            <div className="font-medium mb-1">Evidence Guidelines:</div>
            <ul className="space-y-1">
              <li>• Up to {MAX_PHOTOS} photos per failed item</li>
              <li>• One video up to {MAX_VIDEO_DURATION / 60} minutes per failed item</li>
              <li>• Maximum file size: {MAX_FILE_SIZE / (1024 * 1024)}MB</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}