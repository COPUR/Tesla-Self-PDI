import { Car } from "lucide-react";

interface InspectionHeaderProps {
  orderNumber: string;
  vehicleInfo?: any;
}

export function InspectionHeader({ orderNumber, vehicleInfo }: InspectionHeaderProps) {
  return (
    <header className="bg-black text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Car className="w-8 h-8" />
            <div>
              <h1 className="text-lg font-bold">Tesla Delivery</h1>
              <p className="text-xs text-gray-300">Pre-Delivery Inspection</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-300">Order #</p>
            <p className="text-sm font-semibold">{orderNumber}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
