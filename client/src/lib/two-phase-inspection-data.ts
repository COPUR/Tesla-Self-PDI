// Two-phase inspection data structure based on Tesla PDI checklist
// Phase 1: "On Delivery" (static) - Visual inspection while vehicle is stationary
// Phase 2: "Test Drive" (<100km) - Dynamic testing during short drive

export interface InspectionItem {
  id: string;
  name: string;
  description: string;
  category: string;
  discoveryStage: 'On Delivery (static)' | 'Test Drive (<100 km)';
  evidenceRequired: string;
  status: 'pending' | 'passed' | 'failed';
  notes: string;
  media: any[];
  suggestedSolutions: string;
  additionalLinks: string[];
}

export interface InspectionSection {
  id: string;
  name: string;
  items: InspectionItem[];
  discoveryStage: 'On Delivery (static)' | 'Test Drive (<100 km)';
}

export const twoPhaseInspectionData = {
  // Phase 1: On Delivery (Static Inspection)
  onDeliveryPhase: {
    title: "Phase 1: On Delivery Inspection",
    description: "Visual inspection items that can be checked while the vehicle is stationary in the showroom",
    sections: [
      {
        id: "documentation",
        name: "Documentation & Identity",
        discoveryStage: "On Delivery (static)" as const,
        items: [
          {
            id: "vin-match",
            name: "VIN & Document Verification",
            description: "VIN, documents and windshield/door pillar numbers match",
            category: "Documentation & Identity",
            discoveryStage: "On Delivery (static)" as const,
            evidenceRequired: "Up to 5 photos + ≤2‑min video",
            status: "pending" as const,
            notes: "",
            media: [],
            suggestedSolutions: "If there's a discrepancy, verify VIN with Tesla support.",
            additionalLinks: [
              "https://service.tesla.com/docs/Public/diy/modely/en_us/GUID-D1B313C0-1FE6-4841-AEE2-661ACBDF3838.html"
            ]
          },
          {
            id: "delivery-documents",
            name: "Complete Delivery Documents",
            description: "Invoice, warranty and delivery documents are complete",
            category: "Documentation & Identity",
            discoveryStage: "On Delivery (static)" as const,
            evidenceRequired: "Up to 5 photos + ≤2‑min video",
            status: "pending" as const,
            notes: "",
            media: [],
            suggestedSolutions: "Request missing documents from delivery center.",
            additionalLinks: [
              "https://www.tesla.com/support/after-taking-delivery"
            ]
          },
          {
            id: "production-specs",
            name: "Production Date & Specifications",
            description: "Production date, equipment codes and options match the order",
            category: "Documentation & Identity",
            discoveryStage: "On Delivery (static)" as const,
            evidenceRequired: "Up to 5 photos + ≤2‑min video",
            status: "pending" as const,
            notes: "",
            media: [],
            suggestedSolutions: "Ensure any discrepancies are noted on delivery form.",
            additionalLinks: [
              "https://www.tesla.com/support/ordering-new-vehicle"
            ]
          },
          {
            id: "accessories-complete",
            name: "Complete Accessories",
            description: "Accessories complete: Type-2 AC cable, floor mats, etc.",
            category: "Documentation & Identity",
            discoveryStage: "On Delivery (static)" as const,
            evidenceRequired: "Up to 5 photos + ≤2‑min video",
            status: "pending" as const,
            notes: "",
            media: [],
            suggestedSolutions: "Check accessories are complete; request missing items from delivery center.",
            additionalLinks: [
              "https://www.tesla.com/support/taking-delivery"
            ]
          }
        ]
      },
      {
        id: "exterior-panels",
        name: "Exterior Panels & Paint",
        discoveryStage: "On Delivery (static)" as const,
        items: [
          {
            id: "panel-gaps",
            name: "Panel Gap Alignment",
            description: "Panel gaps ≤ 5 mm and even on both sides",
            category: "Exterior Panels & Paint",
            discoveryStage: "On Delivery (static)" as const,
            evidenceRequired: "Up to 5 photos + ≤2‑min video",
            status: "pending" as const,
            notes: "",
            media: [],
            suggestedSolutions: "Request adjustment or panel replacement for excessive gaps.",
            additionalLinks: [
              "https://teslamotorsclub.com/tmc/threads/model-y-delivery-panel-gaps.341657/"
            ]
          },
          {
            id: "paint-quality",
            name: "Paint Quality",
            description: "No paint imperfections, rock chips, sanding marks, or orange peel",
            category: "Exterior Panels & Paint",
            discoveryStage: "On Delivery (static)" as const,
            evidenceRequired: "Up to 5 photos + ≤2‑min video",
            status: "pending" as const,
            notes: "",
            media: [],
            suggestedSolutions: "Schedule local paint correction or repainting with Tesla service.",
            additionalLinks: [
              "https://www.autoevolution.com/news/tesla-model-y-quality-problems-include-scratches-panel-gaps-saggy-sun-visors-142182.html"
            ]
          },
          {
            id: "door-handles-trim",
            name: "Door Handles & Trim",
            description: "Door handles and trim flush with body",
            category: "Exterior Panels & Paint",
            discoveryStage: "On Delivery (static)" as const,
            evidenceRequired: "Up to 5 photos + ≤2‑min video",
            status: "pending" as const,
            notes: "",
            media: [],
            suggestedSolutions: "Request alignment adjustment if misaligned.",
            additionalLinks: [
              "https://teslamotorsclub.com/tmc/threads/door-handle-alignment.189143/"
            ]
          },
          {
            id: "underbody-covers",
            name: "Underbody Covers",
            description: "Fender liners and underbody aero covers complete",
            category: "Exterior Panels & Paint",
            discoveryStage: "On Delivery (static)" as const,
            evidenceRequired: "Up to 5 photos + ≤2‑min video",
            status: "pending" as const,
            notes: "",
            media: [],
            suggestedSolutions: "Request installation of missing parts.",
            additionalLinks: [
              "https://teslamotorsclub.com/tmc/threads/model-y-checklist.194960/"
            ]
          }
        ]
      },
      {
        id: "glass-seals",
        name: "Glass & Seals",
        discoveryStage: "On Delivery (static)" as const,
        items: [
          {
            id: "window-calibration",
            name: "Window Calibration",
            description: "Window calibration error resolved",
            category: "Glass & Seals",
            discoveryStage: "On Delivery (static)" as const,
            evidenceRequired: "Up to 5 photos + ≤2‑min video",
            status: "pending" as const,
            notes: "",
            media: [],
            suggestedSolutions: "Close door and driver door, sit in driver seat. Calibrate faulty window by bringing it fully up, fully down, and fully up again using driver door button.",
            additionalLinks: [
              "https://service.tesla.com/docs/Public/diy/modely/tr_tr/GUID-B6C81FC2-A37C-462B-8A71-FDE0F7B0734E.html"
            ]
          },
          {
            id: "roof-glass",
            name: "Roof Glass Installation",
            description: "Roof glass properly seated, rubber seals intact/continuous",
            category: "Glass & Seals",
            discoveryStage: "On Delivery (static)" as const,
            evidenceRequired: "Up to 5 photos + ≤2‑min video",
            status: "pending" as const,
            notes: "",
            media: [],
            suggestedSolutions: "Re-glue or replace seal gaps.",
            additionalLinks: [
              "https://www.reddit.com/r/ModelY/comments/1lc3gny/yay_i_found_water_inside_my_juniper/"
            ]
          },
          {
            id: "glass-quality",
            name: "Glass Quality",
            description: "Rear roof and side glass wave-free, no stone marks or cracks",
            category: "Glass & Seals",
            discoveryStage: "On Delivery (static)" as const,
            evidenceRequired: "Up to 5 photos + ≤2‑min video",
            status: "pending" as const,
            notes: "",
            media: [],
            suggestedSolutions: "Request replacement of damaged glass.",
            additionalLinks: [
              "https://www.modelyforum.net/threads/model-y-juniper-delivery-checklist.71/"
            ]
          }
        ]
      },
      {
        id: "interior-trim",
        name: "Interior Trim",
        discoveryStage: "On Delivery (static)" as const,
        items: [
          {
            id: "seat-quality",
            name: "Seat Quality",
            description: "Seat upholstery, stitching, and seams intact",
            category: "Interior Trim",
            discoveryStage: "On Delivery (static)" as const,
            evidenceRequired: "Up to 5 photos + ≤2‑min video",
            status: "pending" as const,
            notes: "",
            media: [],
            suggestedSolutions: "Request seat cover replacement if stitching is loose.",
            additionalLinks: [
              "https://www.autoevolution.com/news/tesla-model-y-quality-problems-include-scratches-panel-gaps-saggy-sun-visors-142182.html"
            ]
          },
          {
            id: "center-console",
            name: "Center Console",
            description: "Center console trim scratch-free and aligned",
            category: "Interior Trim",
            discoveryStage: "On Delivery (static)" as const,
            evidenceRequired: "Up to 5 photos + ≤2‑min video",
            status: "pending" as const,
            notes: "",
            media: [],
            suggestedSolutions: "Re-seat or replace trim.",
            additionalLinks: [
              "https://teslamotorsclub.com/tmc/threads/model-y-checklist.194960/"
            ]
          },
          {
            id: "ac-vents",
            name: "AC Vents",
            description: "AC vents intact, directional controls functional",
            category: "Interior Trim",
            discoveryStage: "On Delivery (static)" as const,
            evidenceRequired: "Up to 5 photos + ≤2‑min video",
            status: "pending" as const,
            notes: "",
            media: [],
            suggestedSolutions: "Replace broken grilles through service.",
            additionalLinks: [
              "https://teslamotorsclub.com/tmc/threads/model-y-checklist.194960/"
            ]
          }
        ]
      },
      {
        id: "electronics-static",
        name: "Electronics & Software (Static)",
        discoveryStage: "On Delivery (static)" as const,
        items: [
          {
            id: "center-screen-boot",
            name: "Center Screen Boot",
            description: "Center screen boots in <30s, no freezing",
            category: "Electronics & Software",
            discoveryStage: "On Delivery (static)" as const,
            evidenceRequired: "Up to 5 photos + ≤2‑min video",
            status: "pending" as const,
            notes: "",
            media: [],
            suggestedSolutions: "Open diagnostic report for long reboot times.",
            additionalLinks: [
              "https://service.tesla.com/en-US/correctioncode?modelCode=M36"
            ]
          },
          {
            id: "phone-key-nfc",
            name: "Phone Key & NFC",
            description: "Bluetooth phone key and NFC card functional",
            category: "Electronics & Software",
            discoveryStage: "On Delivery (static)" as const,
            evidenceRequired: "Up to 5 photos + ≤2‑min video",
            status: "pending" as const,
            notes: "",
            media: [],
            suggestedSolutions: "Re-pair card; update Bluetooth firmware.",
            additionalLinks: [
              "https://www.reddit.com/r/TeslaLounge/comments/1j5p8s6/key_is_not_working_after_update_202528/"
            ]
          },
          {
            id: "wireless-charging",
            name: "Wireless Charging",
            description: "Wireless phone charging pad outputs up to 15W",
            category: "Electronics & Software",
            discoveryStage: "On Delivery (static)" as const,
            evidenceRequired: "Up to 5 photos + ≤2‑min video",
            status: "pending" as const,
            notes: "",
            media: [],
            suggestedSolutions: "Request charging coil replacement if faulty.",
            additionalLinks: [
              "https://www.reddit.com/r/TeslaModelY/comments/1gozd8y/wireless_charging_help/"
            ]
          }
        ]
      },
      {
        id: "charging-battery",
        name: "Charging & Battery",
        discoveryStage: "On Delivery (static)" as const,
        items: [
          {
            id: "charge-port",
            name: "Charge Port",
            description: "Charge port lid aligned, light ring illuminates",
            category: "Charging & Battery",
            discoveryStage: "On Delivery (static)" as const,
            evidenceRequired: "Up to 5 photos + ≤2‑min video",
            status: "pending" as const,
            notes: "",
            media: [],
            suggestedSolutions: "Adjust lid or replace motor.",
            additionalLinks: [
              "https://teslamotorsclub.com/tmc/threads/door-handle-alignment.189143/"
            ]
          },
          {
            id: "battery-soc",
            name: "Battery State of Charge",
            description: "SOC ≥ 80% and battery temperatures normal",
            category: "Charging & Battery",
            discoveryStage: "On Delivery (static)" as const,
            evidenceRequired: "Up to 5 photos + ≤2‑min video",
            status: "pending" as const,
            notes: "",
            media: [],
            suggestedSolutions: "Request charging if SOC is low at delivery.",
            additionalLinks: [
              "https://www.tesla.com/support/taking-delivery"
            ]
          },
          {
            id: "supercharger-test",
            name: "Supercharger Test",
            description: "Locks and charges when connected to Supercharger",
            category: "Charging & Battery",
            discoveryStage: "On Delivery (static)" as const,
            evidenceRequired: "Up to 5 photos + ≤2‑min video",
            status: "pending" as const,
            notes: "",
            media: [],
            suggestedSolutions: "Request connector or software inspection if charging fails.",
            additionalLinks: [
              "https://www.tesla.com/support/taking-delivery"
            ]
          }
        ]
      }
    ]
  },

  // Phase 2: Test Drive (Dynamic Testing)
  testDrivePhase: {
    title: "Phase 2: Test Drive Inspection (<100km)",
    description: "Dynamic testing issues that only reveal themselves during vehicle operation",
    sections: [
      {
        id: "driving-dynamics",
        name: "Driving Dynamics",
        discoveryStage: "Test Drive (<100 km)" as const,
        items: [
          {
            id: "steering-alignment",
            name: "Steering Alignment",
            description: "No pulling during straight driving; steering centered",
            category: "Driving Dynamics",
            discoveryStage: "Test Drive (<100 km)" as const,
            evidenceRequired: "Up to 5 photos + ≤2‑min video",
            status: "pending" as const,
            notes: "",
            media: [],
            suggestedSolutions: "Perform wheel alignment or balancing.",
            additionalLinks: [
              "https://teslamotorsclub.com/tmc/threads/2023-model-y-panel-gap-comparison.292591/"
            ]
          },
          {
            id: "brake-performance",
            name: "Brake Performance",
            description: "Regenerative and mechanical brakes vibration-free",
            category: "Driving Dynamics",
            discoveryStage: "Test Drive (<100 km)" as const,
            evidenceRequired: "Up to 5 photos + ≤2‑min video",
            status: "pending" as const,
            notes: "",
            media: [],
            suggestedSolutions: "Is regenerative working properly? Mechanical brake -> Open service record for disc or caliper issues.",
            additionalLinks: [
              "https://service.tesla.com/docs/Public/diy/modely/tr_tr/GUID-1D888517-65DF-4501-9F8A-90A7E879068F.html"
            ]
          },
          {
            id: "brake-bedding",
            name: "Brake Bedding Process",
            description: "Brake bedding, brake fluid sufficient? 6 times (80-10km/h) hard braking with 30-second intervals",
            category: "Driving Dynamics",
            discoveryStage: "Test Drive (<100 km)" as const,
            evidenceRequired: "Up to 5 photos + ≤2‑min video",
            status: "pending" as const,
            notes: "",
            media: [],
            suggestedSolutions: "Insufficient brake fluid warning -> Open service record.",
            additionalLinks: [
              "https://service.tesla.com/docs/Public/diy/modely/tr_tr/GUID-D49F81B4-8E10-4A24-871E-5EF2F30C8285.html"
            ]
          },
          {
            id: "nvh-quality",
            name: "NVH Quality",
            description: "Suspension and chassis quiet; wind/road noise normal",
            category: "Driving Dynamics",
            discoveryStage: "Test Drive (<100 km)" as const,
            evidenceRequired: "Up to 5 photos + ≤2‑min video",
            status: "pending" as const,
            notes: "",
            media: [],
            suggestedSolutions: "Identify noise sources and have them repaired.",
            additionalLinks: [
              "https://teslamotorsclub.com/tmc/threads/2023-model-y-panel-gap-comparison.292591/"
            ]
          }
        ]
      },
      {
        id: "adas-systems",
        name: "ADAS Systems",
        discoveryStage: "Test Drive (<100 km)" as const,
        items: [
          {
            id: "autopilot-calibration",
            name: "Autopilot Calibration",
            description: "All cameras live; Autopilot calibration complete",
            category: "ADAS Systems",
            discoveryStage: "Test Drive (<100 km)" as const,
            evidenceRequired: "Up to 5 photos + ≤2‑min video",
            status: "pending" as const,
            notes: "",
            media: [],
            suggestedSolutions: "Request software reset if calibration stalls.",
            additionalLinks: [
              "https://teslamotorsclub.com/tmc/threads/camera-calibration-failing-my-2025-2025-2-8.342447/"
            ]
          },
          {
            id: "autopilot-stability",
            name: "Autopilot Stability",
            description: "Autopilot & ACC stable in short test",
            category: "ADAS Systems",
            discoveryStage: "Test Drive (<100 km)" as const,
            evidenceRequired: "Up to 5 photos + ≤2‑min video",
            status: "pending" as const,
            notes: "",
            media: [],
            suggestedSolutions: "Check camera/radar alignment if error codes present.",
            additionalLinks: [
              "https://teslamotorsclub.com/tmc/threads/camera-calibration-failing-my-2025-2025-2-8.342447/"
            ]
          }
        ]
      },
      {
        id: "connectivity-dynamic",
        name: "Connectivity (Dynamic)",
        discoveryStage: "Test Drive (<100 km)" as const,
        items: [
          {
            id: "connectivity-test",
            name: "Connectivity Test",
            description: "Test Wi-Fi connection and cellular signal strength",
            category: "Connectivity",
            discoveryStage: "Test Drive (<100 km)" as const,
            evidenceRequired: "Up to 5 photos + ≤2‑min video",
            status: "pending" as const,
            notes: "",
            media: [],
            suggestedSolutions: "Vehicle can connect to Wi-Fi and cellular signal is strong.",
            additionalLinks: [
              "https://service.tesla.com/docs/Public/diy/modely/en_us/GUID-D1B313C0-1FE6-4841-AEE2-661ACBDF3838.html"
            ]
          }
        ]
      },
      {
        id: "power-steering",
        name: "Power Steering",
        discoveryStage: "Test Drive (<100 km)" as const,
        items: [
          {
            id: "power-steering-test",
            name: "Power Steering Test",
            description: "Verify power steering functions during stops and acceleration",
            category: "Power Steering",
            discoveryStage: "Test Drive (<100 km)" as const,
            evidenceRequired: "Up to 5 photos + ≤2‑min video",
            status: "pending" as const,
            notes: "",
            media: [],
            suggestedSolutions: "Steering should turn easily while vehicle is stopped and while moving.",
            additionalLinks: [
              "https://teslamotorsclub.com/tmc/threads/2023-model-y-panel-gap-comparison.292591/"
            ]
          }
        ]
      }
    ]
  }
};

// Helper function to get all items for a specific phase
export function getPhaseItems(phase: 'onDelivery' | 'testDrive'): InspectionItem[] {
  const phaseData = phase === 'onDelivery' ? twoPhaseInspectionData.onDeliveryPhase : twoPhaseInspectionData.testDrivePhase;
  return phaseData.sections.flatMap(section => section.items);
}

// Helper function to get section by discovery stage
export function getSectionsByStage(stage: 'On Delivery (static)' | 'Test Drive (<100 km)'): InspectionSection[] {
  const allSections = [
    ...twoPhaseInspectionData.onDeliveryPhase.sections,
    ...twoPhaseInspectionData.testDrivePhase.sections
  ];
  return allSections.filter(section => section.discoveryStage === stage);
}

// Helper function to count items by status and stage
export function getPhaseStats(phase: 'onDelivery' | 'testDrive', items: InspectionItem[]) {
  const phaseItems = getPhaseItems(phase);
  const total = phaseItems.length;
  const completed = items.filter(item => 
    phaseItems.some(pi => pi.id === item.id) && 
    (item.status === 'passed' || item.status === 'failed')
  ).length;
  const failed = items.filter(item => 
    phaseItems.some(pi => pi.id === item.id) && 
    item.status === 'failed'
  ).length;
  
  return { total, completed, failed };
}