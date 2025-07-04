import { useState } from "react";
import { ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { InspectionItem } from "./inspection-item";
import { Badge } from "@/components/ui/badge";

interface InspectionSectionProps {
  section: any;
  sectionIndex: number;
  onItemUpdate: (sectionIndex: number, itemIndex: number, updates: any) => void;
  inspectionId: number | null;
}

export function InspectionSection({ 
  section, 
  sectionIndex, 
  onItemUpdate, 
  inspectionId 
}: InspectionSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const completedItems = section.items.filter((item: any) => 
    item.status === "passed" || item.status === "failed"
  ).length;
  
  const failedItems = section.items.filter((item: any) => 
    item.status === "failed"
  ).length;

  const getSectionStatus = () => {
    if (completedItems === section.items.length) {
      return failedItems > 0 ? "warning" : "success";
    }
    return "pending";
  };

  const getSectionIcon = () => {
    const status = getSectionStatus();
    switch (status) {
      case "success":
        return <Check className="w-4 h-4 text-white" />;
      case "warning":
        return <X className="w-4 h-4 text-white" />;
      default:
        return <div className="w-2 h-2 bg-white rounded-full" />;
    }
  };

  const getSectionBadgeColor = () => {
    const status = getSectionStatus();
    switch (status) {
      case "success":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4">
      <div 
        className="p-4 border-b border-gray-100 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-black">{section.name}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {completedItems}/{section.items.length}
            </span>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getSectionBadgeColor()}`}>
              {getSectionIcon()}
            </div>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="divide-y divide-gray-100">
          {section.items.map((item: any, itemIndex: number) => (
            <InspectionItem
              key={itemIndex}
              item={item}
              sectionIndex={sectionIndex}
              itemIndex={itemIndex}
              onItemUpdate={onItemUpdate}
              inspectionId={inspectionId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
