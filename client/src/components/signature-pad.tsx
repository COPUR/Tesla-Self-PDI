import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PenTool } from "lucide-react";

interface SignaturePadProps {
  onSignatureUpdate: (signature: string) => void;
  signature: string | null;
}

export function SignaturePad({ onSignatureUpdate, signature }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(!!signature);

  useEffect(() => {
    if (signature && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = signature;
      }
    }
  }, [signature]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#000";
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setHasSigned(true);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setHasSigned(false);
    onSignatureUpdate("");
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL();
      onSignatureUpdate(dataURL);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold text-black">Digital Signature</h3>
        <p className="text-xs text-gray-500 mt-1">Sign to confirm inspection completion</p>
      </div>
      
      <div className="p-4">
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
          <canvas
            ref={canvasRef}
            width={300}
            height={120}
            className="w-full h-32 cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          
          {!hasSigned && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <PenTool className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Tap to sign</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            onClick={clearSignature}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            Clear
          </Button>
          <Button
            onClick={saveSignature}
            disabled={!hasSigned}
            className="bg-black hover:bg-gray-800 text-white"
          >
            Save Signature
          </Button>
        </div>
      </div>
    </div>
  );
}
