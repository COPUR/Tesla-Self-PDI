import { useState } from "react";
import { Check, X, Camera, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
    if (item.status === "failed") return "bg-red-50";
    if (item.status === "passed") return "bg-green-50";
    return "bg-white";
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
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder="Add notes about the issue..."
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                className="text-sm"
              />
              
              <div className="flex items-center space-x-2">
                {item.media && item.media.length > 0 && (
                  <div className="flex space-x-2">
                    {item.media.map((media: any, index: number) => (
                      <div key={index} className="w-16 h-12 bg-gray-200 rounded border">
                        <img 
                          src={media.url} 
                          alt={`Media ${index + 1}`}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMediaCapture(true)}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Photo
                </Button>
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
        />
      )}
    </div>
  );
}
