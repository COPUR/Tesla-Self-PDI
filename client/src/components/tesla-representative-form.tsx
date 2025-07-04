import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "@/lib/multilingual";
import { useErrorHandler } from "@/lib/error-handling";

interface TeslaRepresentativeFormProps {
  onRepresentativeUpdate: (rep: TeslaRepresentative) => void;
  initialData?: TeslaRepresentative;
  language?: string;
  disabled?: boolean;
}

export interface TeslaRepresentative {
  name: string;
  email: string;
  isValid: boolean;
}

export function TeslaRepresentativeForm({ 
  onRepresentativeUpdate, 
  initialData, 
  language = 'en',
  disabled = false 
}: TeslaRepresentativeFormProps) {
  const { t } = useTranslation(language);
  const { handleValidationError } = useErrorHandler(language);
  
  const [representative, setRepresentative] = useState<TeslaRepresentative>({
    name: initialData?.name || "",
    email: initialData?.email || "",
    isValid: false
  });

  const [errors, setErrors] = useState<{name?: string; email?: string}>({});
  const [isValidating, setIsValidating] = useState(false);

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate Tesla email (should be @tesla.com domain)
  const validateTeslaEmail = (email: string): boolean => {
    return email.toLowerCase().endsWith('@tesla.com');
  };

  // Validate form
  const validateForm = () => {
    const newErrors: {name?: string; email?: string} = {};
    
    if (!representative.name.trim()) {
      newErrors.name = t('error.required');
    } else if (representative.name.trim().length < 2) {
      newErrors.name = t('error.nameLength');
    }

    if (!representative.email.trim()) {
      newErrors.email = t('error.required');
    } else if (!validateEmail(representative.email)) {
      newErrors.email = t('error.invalidEmail');
    } else if (!validateTeslaEmail(representative.email)) {
      newErrors.email = t('error.mustBeTeslaEmail');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleNameChange = (value: string) => {
    setRepresentative(prev => ({ ...prev, name: value }));
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
  };

  const handleEmailChange = (value: string) => {
    setRepresentative(prev => ({ ...prev, email: value }));
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  // Auto-validate and update parent
  useEffect(() => {
    const isValid = validateForm() && representative.name.trim() && representative.email.trim();
    const updatedRep = { ...representative, isValid };
    
    if (JSON.stringify(updatedRep) !== JSON.stringify(representative)) {
      setRepresentative(updatedRep);
      onRepresentativeUpdate(updatedRep);
    }
  }, [representative.name, representative.email]);

  // Validate on blur
  const handleBlur = () => {
    if (!disabled) {
      validateForm();
    }
  };

  const isFormValid = representative.isValid && !Object.keys(errors).length;

  return (
    <Card className={`transition-all duration-200 ${isFormValid ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          {t('form.teslaRepresentative')}
          {isFormValid && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              {t('status.verified')}
            </Badge>
          )}
          {Object.keys(errors).length > 0 && (
            <Badge variant="destructive">
              <AlertCircle className="w-3 h-3 mr-1" />
              {t('status.incomplete')}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {t('form.teslaRepresentativeDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="rep-name" className="text-sm font-medium">
            {t('form.repName')} *
          </Label>
          <Input
            id="rep-name"
            type="text"
            placeholder={t('placeholder.repName')}
            value={representative.name}
            onChange={(e) => handleNameChange(e.target.value)}
            onBlur={handleBlur}
            disabled={disabled}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="rep-email" className="text-sm font-medium">
            {t('form.repEmail')} *
          </Label>
          <Input
            id="rep-email"
            type="email"
            placeholder={t('placeholder.repEmail')}
            value={representative.email}
            onChange={(e) => handleEmailChange(e.target.value)}
            onBlur={handleBlur}
            disabled={disabled}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.email}
            </p>
          )}
          {validateEmail(representative.email) && !validateTeslaEmail(representative.email) && (
            <p className="text-sm text-orange-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {t('warning.externalEmail')}
            </p>
          )}
        </div>

        {isFormValid && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-sm text-green-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {t('success.repValidated')}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {t('info.repWillReceiveCopy')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}