import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, XCircle, Car, TestTube, FileText, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { InspectionHeader } from "@/components/inspection-header";
import { InspectionSection } from "@/components/inspection-section";
import { SignaturePad } from "@/components/signature-pad";
import { twoPhaseInspectionData, getPhaseItems, getPhaseStats } from "@/lib/two-phase-inspection-data";

interface TwoPhaseInspectionState {
  orderNumber: string;
  vehicleInfo: any;
  sections: any[];
  signature: string | null;
  totalItems: number;
  completedItems: number;
  failedItems: number;
  // Two-phase specific
  currentPhase: 'onDelivery' | 'testDrive';
  onDeliveryStatus: 'pending' | 'completed' | 'approved';
  onDeliveryApprovalSignature: string | null;
  testDriveStatus: 'pending' | 'completed' | 'approved';
  testDriveApprovalSignature: string | null;
  testDriveKilometers: number;
}

export default function TwoPhaseInspectionPage() {
  const [location, setLocation] = useLocation();
  const [, params] = useRoute("/two-phase-inspection/:orderNumber");
  const queryClient = useQueryClient();
  
  const [inspectionState, setInspectionState] = useState<TwoPhaseInspectionState>({
    orderNumber: params?.orderNumber || "",
    vehicleInfo: null,
    sections: [],
    signature: null,
    totalItems: 0,
    completedItems: 0,
    failedItems: 0,
    currentPhase: 'onDelivery',
    onDeliveryStatus: 'pending',
    onDeliveryApprovalSignature: null,
    testDriveStatus: 'pending',
    testDriveApprovalSignature: null,
    testDriveKilometers: 0,
  });

  const [activeTab, setActiveTab] = useState("onDelivery");

  // Load existing inspection data
  const { data: existingInspection, isLoading: isLoadingInspection } = useQuery({
    queryKey: ["/api/inspections", params?.orderNumber],
    queryFn: () => apiRequest(`/api/inspections/${params?.orderNumber}`),
    enabled: !!params?.orderNumber,
    retry: false,
  });

  // Load Tesla order data
  const { data: teslaOrderData, isLoading: isLoadingTesla } = useQuery({
    queryKey: ["/api/tesla/order", params?.orderNumber],
    queryFn: () => apiRequest(`/api/tesla/order/${params?.orderNumber}`),
    enabled: !!params?.orderNumber,
    retry: false,
  });

  // Update state when data changes
  useEffect(() => {
    if (existingInspection) {
      setInspectionState(prev => ({
        ...prev,
        ...existingInspection,
        sections: existingInspection.inspectionData?.sections || [],
        signature: existingInspection.signatureData || null,
        onDeliveryStatus: existingInspection.onDeliveryStatus || 'pending',
        onDeliveryApprovalSignature: existingInspection.onDeliveryApprovalSignature || null,
        testDriveStatus: existingInspection.testDriveStatus || 'pending',
        testDriveApprovalSignature: existingInspection.testDriveApprovalSignature || null,
        testDriveKilometers: existingInspection.testDriveKilometers || 0,
      }));
    }
  }, [existingInspection]);

  useEffect(() => {
    if (teslaOrderData) {
      setInspectionState(prev => ({
        ...prev,
        vehicleInfo: teslaOrderData,
      }));
    }
  }, [teslaOrderData]);

  // Initialize inspection with two-phase data
  const createInspectionMutation = useMutation({
    mutationFn: async () => {
      const combinedSections = [
        ...twoPhaseInspectionData.onDeliveryPhase.sections,
        ...twoPhaseInspectionData.testDrivePhase.sections
      ];

      const totalItems = combinedSections.reduce((acc, section) => acc + section.items.length, 0);

      return apiRequest("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: params?.orderNumber,
          vin: teslaOrderData?.vehicleVIN || "UNKNOWN",
          vehicleModel: teslaOrderData?.vehicleModel || "Model Y",
          vehicleColor: teslaOrderData?.vehicleColor || "Unknown",
          customerName: teslaOrderData?.customerName,
          customerEmail: teslaOrderData?.customerEmail,
          salesRepEmail: teslaOrderData?.salesRepEmail,
          inspectionData: { sections: combinedSections },
          totalItems,
          status: "on_delivery_pending"
        }),
      });
    },
    onSuccess: (data) => {
      setInspectionState(prev => ({
        ...prev,
        ...data,
        sections: data.inspectionData?.sections || [],
      }));
      toast({
        title: "Inspection Created",
        description: "Two-phase inspection workflow initialized successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create inspection. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update inspection data
  const updateInspectionMutation = useMutation({
    mutationFn: async (updates: any) => {
      return apiRequest(`/api/inspections/${existingInspection.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspections", params?.orderNumber] });
    },
  });

  // Complete phase
  const completePhase = async (phase: 'onDelivery' | 'testDrive', signature: string) => {
    const updates: any = {
      inspectionData: { sections: inspectionState.sections },
      completedItems: inspectionState.completedItems,
      failedItems: inspectionState.failedItems,
    };

    if (phase === 'onDelivery') {
      updates.onDeliveryStatus = 'completed';
      updates.onDeliveryCompletedAt = new Date().toISOString();
      updates.onDeliveryApprovalSignature = signature;
      updates.status = 'test_drive_pending';
    } else {
      updates.testDriveStatus = 'completed';
      updates.testDriveCompletedAt = new Date().toISOString();
      updates.testDriveApprovalSignature = signature;
      updates.status = 'final_completed';
    }

    await updateInspectionMutation.mutateAsync(updates);
    
    setInspectionState(prev => ({
      ...prev,
      ...updates,
      [phase === 'onDelivery' ? 'onDeliveryApprovalSignature' : 'testDriveApprovalSignature']: signature,
      [phase === 'onDelivery' ? 'onDeliveryStatus' : 'testDriveStatus']: 'completed',
    }));

    toast({
      title: `${phase === 'onDelivery' ? 'On Delivery' : 'Test Drive'} Phase Completed`,
      description: phase === 'onDelivery' 
        ? "Ready to proceed to test drive phase."
        : "Inspection complete. Generating final report...",
    });

    if (phase === 'testDrive') {
      // Generate final report
      handleCompleteInspection();
    }
  };

  const handleCompleteInspection = async () => {
    try {
      const result = await apiRequest(`/api/inspections/${existingInspection.id}/complete`, {
        method: "POST",
      });
      
      toast({
        title: "Inspection Completed",
        description: `PDF report generated and ${result.emailSent ? 'emailed successfully' : 'email pending'}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete inspection. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleItemUpdate = (sectionIndex: number, itemIndex: number, updates: any) => {
    const newSections = [...inspectionState.sections];
    const section = newSections[sectionIndex];
    if (section?.items?.[itemIndex]) {
      section.items[itemIndex] = { ...section.items[itemIndex], ...updates };
      
      // Calculate stats
      const allItems = newSections.flatMap(s => s.items || []);
      const completedItems = allItems.filter(item => item.status === 'passed' || item.status === 'failed').length;
      const failedItems = allItems.filter(item => item.status === 'failed').length;
      
      setInspectionState(prev => ({
        ...prev,
        sections: newSections,
        completedItems,
        failedItems,
      }));

      // Auto-save
      updateInspectionMutation.mutate({
        inspectionData: { sections: newSections },
        completedItems,
        failedItems,
      });
    }
  };

  // Initialize inspection if none exists
  useEffect(() => {
    if (teslaOrderData && !existingInspection && !isLoadingInspection) {
      createInspectionMutation.mutate();
    }
  }, [teslaOrderData, existingInspection, isLoadingInspection]);

  // Calculate phase statistics
  const onDeliveryStats = getPhaseStats('onDelivery', inspectionState.sections.flatMap(s => s.items || []));
  const testDriveStats = getPhaseStats('testDrive', inspectionState.sections.flatMap(s => s.items || []));

  const currentPhaseData = activeTab === 'onDelivery' 
    ? twoPhaseInspectionData.onDeliveryPhase 
    : twoPhaseInspectionData.testDrivePhase;

  const currentPhaseStats = activeTab === 'onDelivery' ? onDeliveryStats : testDriveStats;
  const currentPhaseStatus = activeTab === 'onDelivery' 
    ? inspectionState.onDeliveryStatus 
    : inspectionState.testDriveStatus;

  const canCompletePhase = currentPhaseStats.completed === currentPhaseStats.total && currentPhaseStatus === 'pending';
  const isPhaseCompleted = currentPhaseStatus === 'completed';

  if (isLoadingInspection || isLoadingTesla) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading inspection data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <InspectionHeader 
        orderNumber={inspectionState.orderNumber} 
        vehicleInfo={inspectionState.vehicleInfo} 
      />

      {/* Phase Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className={`border-2 ${inspectionState.onDeliveryStatus === 'completed' ? 'border-green-500' : 'border-blue-500'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              Phase 1: On Delivery
              {inspectionState.onDeliveryStatus === 'completed' && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Visual inspection - Items that can be checked while vehicle is stationary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress: {onDeliveryStats.completed}/{onDeliveryStats.total}</span>
                <span>Failed: {onDeliveryStats.failed}</span>
              </div>
              <Progress value={(onDeliveryStats.completed / onDeliveryStats.total) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className={`border-2 ${
          inspectionState.testDriveStatus === 'completed' 
            ? 'border-green-500' 
            : inspectionState.onDeliveryStatus === 'completed' 
              ? 'border-blue-500' 
              : 'border-gray-300'
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              Phase 2: Test Drive
              {inspectionState.testDriveStatus === 'completed' && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              )}
              {inspectionState.onDeliveryStatus !== 'completed' && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                  <Clock className="w-3 h-3 mr-1" />
                  Waiting
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Dynamic testing - Issues that appear during driving (&lt;100km)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress: {testDriveStats.completed}/{testDriveStats.total}</span>
                <span>Failed: {testDriveStats.failed}</span>
              </div>
              <Progress value={(testDriveStats.completed / testDriveStats.total) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Phase Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="onDelivery" className="flex items-center gap-2">
            <Car className="w-4 h-4" />
            On Delivery
            {inspectionState.onDeliveryStatus === 'completed' && <CheckCircle className="w-4 h-4 text-green-600" />}
          </TabsTrigger>
          <TabsTrigger 
            value="testDrive" 
            disabled={inspectionState.onDeliveryStatus !== 'completed'}
            className="flex items-center gap-2"
          >
            <TestTube className="w-4 h-4" />
            Test Drive
            {inspectionState.testDriveStatus === 'completed' && <CheckCircle className="w-4 h-4 text-green-600" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="onDelivery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{currentPhaseData.title}</CardTitle>
              <CardDescription>{currentPhaseData.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {currentPhaseData.sections.map((section, sectionIndex) => (
                  <InspectionSection
                    key={section.id}
                    section={section}
                    sectionIndex={sectionIndex}
                    onItemUpdate={handleItemUpdate}
                    inspectionId={existingInspection?.id || null}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {canCompletePhase && (
            <Card>
              <CardHeader>
                <CardTitle>Complete On Delivery Phase</CardTitle>
                <CardDescription>
                  Sign to approve the on delivery inspection and proceed to test drive phase.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SignaturePad
                  onSignatureUpdate={(signature) => completePhase('onDelivery', signature)}
                  signature={inspectionState.onDeliveryApprovalSignature}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="testDrive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{currentPhaseData.title}</CardTitle>
              <CardDescription>{currentPhaseData.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {currentPhaseData.sections.map((section, sectionIndex) => {
                  // Find the correct section index in the combined sections array
                  const combinedSectionIndex = inspectionState.sections.findIndex(s => s.id === section.id);
                  return (
                    <InspectionSection
                      key={section.id}
                      section={section}
                      sectionIndex={combinedSectionIndex}
                      onItemUpdate={handleItemUpdate}
                      inspectionId={existingInspection?.id || null}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {canCompletePhase && (
            <Card>
              <CardHeader>
                <CardTitle>Complete Test Drive Phase</CardTitle>
                <CardDescription>
                  Sign to approve the test drive inspection and generate final report.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SignaturePad
                  onSignatureUpdate={(signature) => completePhase('testDrive', signature)}
                  signature={inspectionState.testDriveApprovalSignature}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Final completion status */}
      {inspectionState.testDriveStatus === 'completed' && (
        <Card className="border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              Inspection Complete
            </CardTitle>
            <CardDescription>
              Both inspection phases have been completed successfully. PDF report has been generated and emailed.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}