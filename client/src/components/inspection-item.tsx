import { useState } from "react";
import { Check, X, Camera, Plus, Video, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MediaCapture } from "./media-capture";

interface InspectionItemProps {
  item: any;
  sectionIndex: number;
  itemIndex: number;
  onItemUpdate: (sectionIndex: number, itemIndex: number, updates: any) => void;
  inspectionId: number | null;
}

export function InspectionItem({ 
  item, 
  sectionIndex, 
  itemIndex, 
  onItemUpdate, 
  inspectionId 
}: InspectionItemProps) {
  const [showMediaCapture, setShowMediaCapture] = useState(false);
  const [notes, setNotes] = useState(item.notes || "");

  const handleStatusChange = (status: "passed" | "failed") => {
    onItemUpdate(sectionIndex, itemIndex, { status });
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    onItemUpdate(sectionIndex, itemIndex, { notes: value });
  };

  const handleMediaAdd = (mediaData: any) => {
    const currentMedia = item.media || [];
    onItemUpdate(sectionIndex, itemIndex, { 
      media: [...currentMedia, mediaData] 
    });
    setShowMediaCapture(false);
  };

  const getItemBackground = () => {
    if (item.status === "failed") return "bg-red-50 border-l-4 border-red-500";
    if (item.status === "passed") return "bg-green-50 border-l-4 border-green-500";
    return "bg-white border-l-4 border-gray-200";
  };

  const getMediaCounts = () => {
    const media = item.media || [];
    const photos = media.filter((m: any) => m.mediaType === 'photo').length;
    const videos = media.filter((m: any) => m.mediaType === 'video').length;
    return { photos, videos };
  };

  const canAddEvidence = () => {
    if (item.status !== 'failed') return false;
    const { photos, videos } = getMediaCounts();
    return photos < 5 || videos === 0;
  };

  const isRequireEvidence = () => {
    return item.status === 'failed' && (!item.media || item.media.length === 0);
  };

  return (
    <div className={`p-4 ${getItemBackground()}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-black mb-1">{item.description}</p>
          {item.recommendation && (
            <p className="text-xs text-gray-500 mb-2">{item.recommendation}</p>
          )}
          
          {item.status === "failed" && (
            <div className="mt-3 space-y-3">
              {/* Evidence Required Warning */}
              {isRequireEvidence() && (
                <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-amber-800 font-medium">Evidence required for failed items</span>
                </div>
              )}

              <Textarea
                placeholder="Add notes about the issue..."
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                className="text-sm"
              />
              
              {/* Media Evidence Section */}
              <div className="space-y-2">
                {/* Media Counter and Add Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Evidence:</span>
                    {(() => {
                      const { photos, videos } = getMediaCounts();
                      return (
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            <Camera className="w-3 h-3 mr-1" />
                            {photos}/5 photos
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Video className="w-3 h-3 mr-1" />
                            {videos}/1 video
                          </Badge>
                        </div>
                      );
                    })()}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMediaCapture(true)}
                    disabled={!canAddEvidence()}
                    className="text-red-600 border-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Evidence
                  </Button>
                </div>

                {/* Media Thumbnails */}
                {item.media && item.media.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {item.media.map((media: any, index: number) => (
                      <div key={index} className="relative group">
                        <div className="w-full h-16 bg-gray-200 rounded border overflow-hidden">
                          {media.mediaType === 'photo' ? (
                            <img 
                              src={media.driveLink || media.url} 
                              alt={`Evidence ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                              <Video className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="absolute top-1 right-1">
                          <Badge 
                            variant="secondary" 
                            className="text-xs px-1 py-0 h-4 bg-black/70 text-white"
                          >
                            {media.mediaType === 'photo' ? 'P' : 'V'}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 truncate">
                          {media.fileName}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Evidence Guidelines */}
                {item.status === 'failed' && (!item.media || item.media.length === 0) && (
                  <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                    Failed items require evidence: up to 5 photos or 1 video (max 2 minutes)
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleStatusChange("passed")}
            className={`w-8 h-8 rounded-full ${
              item.status === "passed" 
                ? "bg-green-500 hover:bg-green-600" 
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            <Check className={`w-4 h-4 ${item.status === "passed" ? "text-white" : "text-gray-500"}`} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleStatusChange("failed")}
            className={`w-8 h-8 rounded-full ${
              item.status === "failed" 
                ? "bg-red-500 hover:bg-red-600" 
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            <X className={`w-4 h-4 ${item.status === "failed" ? "text-white" : "text-gray-500"}`} />
          </Button>
        </div>
      </div>
      
      {showMediaCapture && (
        <MediaCapture
          onCapture={handleMediaAdd}
          onClose={() => setShowMediaCapture(false)}
          inspectionId={inspectionId}
          itemId={`${sectionIndex}-${itemIndex}`}
          existingMedia={item.media || []}
        />
      )}
    </div>
  );
}
