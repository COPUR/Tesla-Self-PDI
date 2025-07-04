import { useState, useRef } from "react";
import { Camera, Video, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface MediaCaptureProps {
  onCapture: (mediaData: any) => void;
  onClose: () => void;
  inspectionId: number | null;
  itemId: string;
}

export function MediaCapture({ onCapture, onClose, inspectionId, itemId }: MediaCaptureProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMediaMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("media", file);
      formData.append("itemId", itemId);
      formData.append("mediaType", file.type.startsWith("video/") ? "video" : "photo");

      const response = await fetch(`/api/inspections/${inspectionId}/media`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      onCapture({
        id: data.id,
        url: data.driveLink,
        type: data.mediaType,
        fileName: data.fileName,
      });
      toast({
        title: "Media Uploaded",
        description: "Your photo/video has been uploaded successfully.",
      });
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
        audio: false,
      });
      
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to capture photos.",
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

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: "image/jpeg" });
        uploadMediaMutation.mutate(file);
      }
    }, "image/jpeg", 0.8);

    stopCamera();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMediaMutation.mutate(file);
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Media</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {mediaStream ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-48 bg-black rounded-lg"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                <Button
                  onClick={capturePhoto}
                  disabled={uploadMediaMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 text-white w-16 h-16 rounded-full"
                >
                  <Camera className="w-6 h-6" />
                </Button>
                
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="w-16 h-16 rounded-full"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                <Camera className="w-12 h-12 text-gray-400" />
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={startCamera}
                  className="bg-red-600 hover:bg-red-700 text-white w-16 h-16 rounded-full"
                >
                  <Camera className="w-6 h-6" />
                </Button>
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-black hover:bg-gray-800 text-white w-16 h-16 rounded-full"
                >
                  <Upload className="w-6 h-6" />
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}
          
          {uploadMediaMutation.isPending && (
            <div className="text-center text-sm text-gray-500">
              Uploading media...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
