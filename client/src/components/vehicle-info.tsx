interface VehicleInfoProps {
  vehicleInfo?: any;
}

export function VehicleInfo({ vehicleInfo }: VehicleInfoProps) {
  if (!vehicleInfo) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-300 rounded-lg mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <img 
        src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400" 
        alt="Tesla Model Y in delivery bay" 
        className="w-full h-32 object-cover rounded-lg mb-4"
      />
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Model</p>
          <p className="font-semibold">{vehicleInfo.vehicleModel}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">VIN</p>
          <p className="font-semibold">{vehicleInfo.vehicleVIN}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Color</p>
          <p className="font-semibold">{vehicleInfo.vehicleColor}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Delivery Date</p>
          <p className="font-semibold">{vehicleInfo.deliveryDate}</p>
        </div>
      </div>
    </div>
  );
}
