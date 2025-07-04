import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { InspectionHeader } from "@/components/inspection-header";
import { ProgressBar } from "@/components/progress-bar";
import { VehicleInfo } from "@/components/vehicle-info";
import { InspectionSection } from "@/components/inspection-section";
import { SignaturePad } from "@/components/signature-pad";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { inspectionData } from "@/lib/inspection-data";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/offline-storage";
import type { Inspection } from "@shared/schema";

interface InspectionState {
  orderNumber: string;
  vehicleInfo: any;
  sections: any[];
  signature: string | null;
  totalItems: number;
  completedItems: number;
  failedItems: number;
}

export default function InspectionPage() {
  const params = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [inspectionState, setInspectionState] = useState<InspectionState>({
    orderNumber: params.orderNumber || "RN123456",
    vehicleInfo: null,
    sections: inspectionData.sections,
    signature: null,
    totalItems: 0,
    completedItems: 0,
    failedItems: 0,
  });

  const [currentInspectionId, setCurrentInspectionId] = useState<number | null>(null);

  // Load Tesla order data
  const { data: orderData } = useQuery({
    queryKey: [`/api/tesla/order/${inspectionState.orderNumber}`],
    enabled: !!inspectionState.orderNumber,
  });

  // Load existing inspection or create new one
  const { data: existingInspection } = useQuery({
    queryKey: [`/api/inspections`, inspectionState.orderNumber],
    queryFn: async () => {
      const response = await fetch(`/api/inspections/${inspectionState.orderNumber}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error("Failed to fetch inspection");
      return response.json();
    },
  });

  // Create inspection mutation
  const createInspectionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/inspections", data);
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentInspectionId(data.id);
      toast({
        title: "Inspection Created",
        description: "Your inspection has been started.",
      });
    },
  });

  // Update inspection mutation
  const updateInspectionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/inspections/${currentInspectionId}`, data);
      return response.json();
    },
    onSuccess: () => {
      saveToLocalStorage(inspectionState);
    },
  });

  // Complete inspection mutation
  const completeInspectionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/inspections/${currentInspectionId}/complete`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Inspection Completed",
        description: `PDF report generated and email sent. Report ID: ${data.reportId}`,
      });
      // Clear local storage after successful completion
      localStorage.removeItem("tesla-inspection-data");
    },
  });

  // Initialize inspection
  useEffect(() => {
    if (orderData && !existingInspection && !currentInspectionId) {
      const newInspection = {
        orderNumber: inspectionState.orderNumber,
        vin: orderData.vehicleVIN,
        vehicleModel: orderData.vehicleModel,
        vehicleColor: orderData.vehicleColor,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        salesRepEmail: orderData.salesRepEmail,
        inspectionData: inspectionState,
        totalItems: inspectionState.totalItems,
        completedItems: 0,
        failedItems: 0,
      };
      
      createInspectionMutation.mutate(newInspection);
    } else if (existingInspection) {
      setCurrentInspectionId(existingInspection.id);
      setInspectionState(existingInspection.inspectionData);
    }
  }, [orderData, existingInspection]);

  // Load from local storage on mount
  useEffect(() => {
    const savedData = loadFromLocalStorage();
    if (savedData) {
      setInspectionState(savedData);
    }
  }, []);

  // Calculate totals
  useEffect(() => {
    let totalItems = 0;
    let completedItems = 0;
    let failedItems = 0;

    inspectionState.sections.forEach((section) => {
      section.items.forEach((item: any) => {
        totalItems++;
        if (item.status === "passed" || item.status === "failed") {
          completedItems++;
        }
        if (item.status === "failed") {
          failedItems++;
        }
      });
    });

    setInspectionState((prev) => ({
      ...prev,
      totalItems,
      completedItems,
      failedItems,
    }));
  }, [inspectionState.sections]);

  const handleItemUpdate = (sectionIndex: number, itemIndex: number, updates: any) => {
    setInspectionState((prev) => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].items[itemIndex] = {
        ...newSections[sectionIndex].items[itemIndex],
        ...updates,
      };
      
      const newState = {
        ...prev,
        sections: newSections,
      };
      
      // Save to local storage
      saveToLocalStorage(newState);
      
      // Update server if we have an inspection ID
      if (currentInspectionId) {
        updateInspectionMutation.mutate({
          inspectionData: newState,
          completedItems: newState.completedItems,
          failedItems: newState.failedItems,
        });
      }
      
      return newState;
    });
  };

  const handleSignatureUpdate = (signatureData: string) => {
    setInspectionState((prev) => {
      const newState = {
        ...prev,
        signature: signatureData,
      };
      
      saveToLocalStorage(newState);
      
      if (currentInspectionId) {
        updateInspectionMutation.mutate({
          signatureData: signatureData,
        });
      }
      
      return newState;
    });
  };

  const handleCompleteInspection = () => {
    if (!currentInspectionId) {
      toast({
        title: "Error",
        description: "No inspection found to complete",
        variant: "destructive",
      });
      return;
    }

    if (!inspectionState.signature) {
      toast({
        title: "Signature Required",
        description: "Please provide your digital signature before completing the inspection",
        variant: "destructive",
      });
      return;
    }

    completeInspectionMutation.mutate();
  };

  const progressPercentage = inspectionState.totalItems > 0 
    ? (inspectionState.completedItems / inspectionState.totalItems) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <InspectionHeader 
        orderNumber={inspectionState.orderNumber}
        vehicleInfo={orderData}
      />
      
      <ProgressBar 
        completed={inspectionState.completedItems}
        total={inspectionState.totalItems}
        percentage={progressPercentage}
      />
      
      <div className="max-w-md mx-auto px-4 py-4">
        <VehicleInfo vehicleInfo={orderData} />
        
        <div className="space-y-4">
          {inspectionState.sections.map((section, sectionIndex) => (
            <InspectionSection
              key={sectionIndex}
              section={section}
              sectionIndex={sectionIndex}
              onItemUpdate={handleItemUpdate}
              inspectionId={currentInspectionId}
            />
          ))}
        </div>
        
        <div className="mt-6">
          <SignaturePad
            onSignatureUpdate={handleSignatureUpdate}
            signature={inspectionState.signature}
          />
        </div>
        
        <div className="mt-6 space-y-3">
          <Button 
            onClick={handleCompleteInspection}
            disabled={completeInspectionMutation.isPending || !inspectionState.signature}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 text-lg font-semibold"
          >
            {completeInspectionMutation.isPending ? "Processing..." : "Complete Inspection"}
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={() => saveToLocalStorage(inspectionState)}
              className="py-3"
            >
              Save Draft
            </Button>
            <Button 
              variant="secondary" 
              className="py-3"
              disabled={!currentInspectionId}
            >
              View Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
