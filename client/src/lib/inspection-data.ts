// Tesla Pre-Delivery Inspection Data based on the provided CSV
export const inspectionData = {
  sections: [
    {
      name: "Documents & Identity",
      items: [
        {
          id: "doc-1",
          description: "VIN, documents and windshield/door post numbers match",
          recommendation: "Check consistency across all documentation",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "doc-2",
          description: "Invoice, warranty and delivery documents complete",
          recommendation: "Request missing documents from delivery center",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "doc-3",
          description: "Production date, hardware codes and options match order",
          recommendation: "Note any discrepancies on delivery form",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "doc-4",
          description: "Accessories complete: mobile connector, J1772 adapter, floor mats etc.",
          recommendation: "Check accessories are complete; request missing items from delivery center",
          status: null,
          notes: "",
          media: []
        }
      ]
    },
    {
      name: "Exterior Panels & Paint",
      items: [
        {
          id: "ext-1",
          description: "Panel gaps ≤ 5mm and equal on both sides",
          recommendation: "Request adjustment or panel replacement for excessive gaps",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "ext-2",
          description: "Paint defects, stone marks, sand scratches or orange peel effect",
          recommendation: "Schedule local paint correction or repaint with Tesla service",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "ext-3",
          description: "Door handles and trim flush with body",
          recommendation: "Request adjustment if misaligned",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "ext-4",
          description: "Fender liner and underbody aero covers complete",
          recommendation: "Request installation of missing parts",
          status: null,
          notes: "",
          media: []
        }
      ]
    },
    {
      name: "Lighting",
      items: [
        {
          id: "light-1",
          description: "Matrix headlights have no internal dust/film or blurry lenses",
          recommendation: "Request headlight cleaning or replacement",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "light-2",
          description: "Headlight height sensor working (automatic leveling)",
          recommendation: "Have sensor calibration performed at service",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "light-3",
          description: "Tail and signal lights have no moisture or cracks",
          recommendation: "Request seal check or replacement for moisture in tail lights",
          status: null,
          notes: "",
          media: []
        }
      ]
    },
    {
      name: "Doors & Glovebox",
      items: [
        {
          id: "door-1",
          description: "Magnetic glovebox opens; 16V battery sufficient",
          recommendation: "Test 16V battery; replace if weak",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "door-2",
          description: "Doors close smoothly; child locks working",
          recommendation: "Request adjustment for misaligned doors or lock check",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "door-3",
          description: "Windows go up and down without rubbing",
          recommendation: "Have glass channels adjusted or weatherstrip replaced",
          status: null,
          notes: "",
          media: []
        }
      ]
    },
    {
      name: "Glass & Seals",
      items: [
        {
          id: "glass-1",
          description: "Roof glass properly seated, rubber seals unbroken",
          recommendation: "Re-glue or replace gaps in seals",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "glass-2",
          description: "Windshield undistorted, no stone marks or cracks",
          recommendation: "Request replacement of damaged glass",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "glass-3",
          description: "Rear glass resistance working, heating engages",
          recommendation: "Request glass replacement if resistance faulty",
          status: null,
          notes: "",
          media: []
        }
      ]
    },
    {
      name: "Trunk & Frunk",
      items: [
        {
          id: "trunk-1",
          description: "Trunk lid aligned, electric open/close smooth",
          recommendation: "Motor adjustment or hinge adjustment may be needed",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "trunk-2",
          description: "Trunk lid seal prevents water ingress",
          recommendation: "Request seal replacement or additional weatherproofing",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "trunk-3",
          description: "Frunk interior dry, rubber seal properly seated",
          recommendation: "Request seal renewal",
          status: null,
          notes: "",
          media: []
        }
      ]
    },
    {
      name: "Wheels, Tires & Suspension",
      items: [
        {
          id: "wheel-1",
          description: "TPMS warning light flashing when required",
          recommendation: "Replace faulty sensor; update software",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "wheel-2",
          description: "Tire pressures (≈42 psi) and brand/spec correct",
          recommendation: "Replace wrong tire, adjust pressure",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "wheel-3",
          description: "Lug nuts at correct torque (175 Nm)",
          recommendation: "Have service check with torque wrench",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "wheel-4",
          description: "Upper control arm-tower connection silent",
          recommendation: "Have suspension bushings inspected if noise present",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "wheel-5",
          description: "Tire wear and alignment checked, especially inner wear",
          recommendation: "Inspect inner and outer tire wear; report to service if alignment needed",
          status: null,
          notes: "",
          media: []
        }
      ]
    },
    {
      name: "Charging & Battery",
      items: [
        {
          id: "charge-1",
          description: "Charge port lid aligned, light ring illuminated",
          recommendation: "Have lid adjusted or motor replaced",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "charge-2",
          description: "SOC ≥ 80% and battery temperatures normal",
          recommendation: "Request charge if SOC low at delivery",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "charge-3",
          description: "Supercharger connects, locks and charges",
          recommendation: "Request connector or software inspection for charging faults",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "charge-4",
          description: "Cooling/pump sounds normal, HV pyrofuse recall closed",
          recommendation: "Have pyrofuse campaign checked at service",
          status: null,
          notes: "",
          media: []
        }
      ]
    },
    {
      name: "Electronics & Software",
      items: [
        {
          id: "elec-1",
          description: "All cameras live; Autopilot calibration completed",
          recommendation: "Request software reset if calibration stuck",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "elec-2",
          description: "Center screen opens in <30s, no freezing",
          recommendation: "Request diagnostic report for long reboot times",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "elec-3",
          description: "Bluetooth phone key and NFC card working",
          recommendation: "Re-pair card; update Bluetooth FW",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "elec-4",
          description: "Wireless phone charging pad up to 15W",
          recommendation: "Request charging coil replacement if faulty",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "elec-5",
          description: "Speakers free of distortion or balance issues",
          recommendation: "Replace faulty speaker or reset software EQ",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "elec-6",
          description: "Wi-Fi connection and cellular signal strength tested",
          recommendation: "Vehicle can connect to Wi-Fi and has strong cellular signal",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "elec-7",
          description: "Software current and contains fixes for known bugs",
          recommendation: "Check software version and install latest updates",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "elec-8",
          description: "Rear view camera working properly",
          recommendation: "Ensure clear image when in reverse",
          status: null,
          notes: "",
          media: []
        }
      ]
    },
    {
      name: "Interior Trim",
      items: [
        {
          id: "int-1",
          description: "Seat upholstery, stitching and seam lines intact",
          recommendation: "Request seat cover replacement if stitching failed",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "int-2",
          description: "Center console trim scratch-free and aligned",
          recommendation: "Re-seat or replace trim",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "int-3",
          description: "Climate vents intact, direction control working",
          recommendation: "Replace broken vents with service",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "int-4",
          description: "Seat belt buckles smooth engage-disengage",
          recommendation: "Request mechanism replacement if buckles difficult to engage",
          status: null,
          notes: "",
          media: []
        }
      ]
    },
    {
      name: "Safety Systems",
      items: [
        {
          id: "safe-1",
          description: "Airbag warning light off (system ready)",
          recommendation: "Request airbag sensor diagnostic if warning persists",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "safe-2",
          description: "Collision warning, Sentry Mode and alarms active",
          recommendation: "Report sensor or camera faults to Tesla",
          status: null,
          notes: "",
          media: []
        },
        {
          id: "safe-3",
          description: "Seat belts and airbags functioning correctly",
          recommendation: "Test seat belt engage-disengage, airbag light off",
          status: null,
          notes: "",
          media: []
        }
      ]
    },
    {
      name: "Test Drive",
      items: [
        {
          id: "drive-1",
          description: "No pull during straight driving; steering wheel centered",
          recommendation: "Have wheel alignment or balancing performed",
          status: null,
          notes: "",
          media: []
        }
      ]
    }
  ]
};
