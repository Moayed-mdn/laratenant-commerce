'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAddressSettings, useUpdateAddressSettings } from '@/hooks/shipping/useAddressSettings';
import { COUNTRY_GROUPS, ADDRESS_FIELDS } from '@/types/shipping';
import type { UpdateStoreAddressSettingsPayload } from '@/types/shipping';

interface AddressSettingsFormProps {
  storeSlug: string;
}

export function AddressSettingsForm({ storeSlug }: AddressSettingsFormProps) {
  const t = useTranslations('shipping');
  const { data: settings, isLoading } = useAddressSettings(storeSlug);
  const updateMutation = useUpdateAddressSettings(storeSlug);

  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [requirePhone, setRequirePhone] = useState(false);
  const [requireCompany, setRequireCompany] = useState(false);
  const [allowPoBoxes, setAllowPoBoxes] = useState(true);

  useEffect(() => {
    if (settings) {
      setSelectedCountries(settings.allowed_countries || []);
      setSelectedFields(settings.required_fields || []);
      setRequirePhone(settings.require_phone || false);
      setRequireCompany(settings.require_company || false);
      setAllowPoBoxes(settings.allow_po_boxes ?? true);
    }
  }, [settings]);

  const toggleCountry = (countryCode: string) => {
    setSelectedCountries(prev => {
      if (prev.includes(countryCode)) {
        return prev.filter(c => c !== countryCode);
      } else {
        return [...prev, countryCode];
      }
    });
  };

  const selectAllCountries = () => {
    const allCountries = Object.values(COUNTRY_GROUPS).flat().map(c => c.code);
    const allSelected = allCountries.every(code => selectedCountries.includes(code));
    
    if (allSelected) {
      setSelectedCountries([]);
    } else {
      setSelectedCountries(allCountries);
    }
  };

  const toggleField = (fieldValue: string) => {
    setSelectedFields(prev => {
      if (prev.includes(fieldValue)) {
        return prev.filter(f => f !== fieldValue);
      } else {
        return [...prev, fieldValue];
      }
    });
  };

  const handleSubmit = () => {
    const payload: UpdateStoreAddressSettingsPayload = {
      allowed_countries: selectedCountries,
      required_fields: selectedFields,
      require_phone: requirePhone,
      require_company: requireCompany,
      allow_po_boxes: allowPoBoxes,
    };

    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">{t('common.loading')}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('addressSettings.title')}</CardTitle>
        <CardDescription>{t('addressSettings.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Allowed Countries */}
        <div className="space-y-3">
          <div>
            <Label className="text-base">{t('addressSettings.allowedCountries.label')}</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {t('addressSettings.allowedCountries.description')}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              {selectedCountries.length > 0 
                ? `${selectedCountries.length} ${t('zones.countryCount', { count: selectedCountries.length })}`
                : t('addressSettings.allowedCountries.placeholder')
              }
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={selectAllCountries}
            >
              {t('addressSettings.allowedCountries.all')}
            </Button>
          </div>

          <ScrollArea className="h-[250px] border rounded-md p-4">
            {Object.entries(COUNTRY_GROUPS).map(([region, countries]) => (
              <div key={region} className="mb-4">
                <div className="text-sm font-semibold mb-2">{region}</div>
                <div className="ml-4 space-y-2">
                  {countries.map((country) => (
                    <div key={country.code} className="flex items-center space-x-2">
                      <Checkbox
                        id={`allowed-${country.code}`}
                        checked={selectedCountries.includes(country.code)}
                        onCheckedChange={() => toggleCountry(country.code)}
                      />
                      <Label
                        htmlFor={`allowed-${country.code}`}
                        className="text-sm cursor-pointer"
                      >
                        <span className="mr-2">{country.code}</span>
                        <span>{country.name}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>

        <Separator />

        {/* Required Fields */}
        <div className="space-y-3">
          <div>
            <Label className="text-base">{t('addressSettings.requiredFields.label')}</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {t('addressSettings.requiredFields.description')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {ADDRESS_FIELDS.map((field) => {
              // Map snake_case field values to camelCase translation keys
              const fieldKeyMap: Record<string, string> = {
                'first_name': 'firstName',
                'last_name': 'lastName',
                'company': 'company',
                'address_line_1': 'addressLine1',
                'address_line_2': 'addressLine2',
                'city': 'city',
                'state': 'state',
                'postal_code': 'postalCode',
                'country': 'country',
                'phone': 'phone',
              };
              
              const translationKey = fieldKeyMap[field.value] || field.value;
              
              return (
                <div key={field.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`field-${field.value}`}
                    checked={selectedFields.includes(field.value)}
                    onCheckedChange={() => toggleField(field.value)}
                  />
                  <Label
                    htmlFor={`field-${field.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {t(`addressSettings.fields.${translationKey}`)}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Additional Options */}
        <div className="space-y-4">
          <Label className="text-base">{t('addressSettings.options.title')}</Label>

          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="require_phone">{t('addressSettings.options.requirePhone')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('addressSettings.options.requirePhoneDescription')}
                </p>
              </div>
              <Switch
                id="require_phone"
                checked={requirePhone}
                onCheckedChange={setRequirePhone}
              />
            </div>

            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="require_company">{t('addressSettings.options.requireCompany')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('addressSettings.options.requireCompanyDescription')}
                </p>
              </div>
              <Switch
                id="require_company"
                checked={requireCompany}
                onCheckedChange={setRequireCompany}
              />
            </div>

            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allow_po_boxes">{t('addressSettings.options.allowPoBoxes')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('addressSettings.options.allowPoBoxesDescription')}
                </p>
              </div>
              <Switch
                id="allow_po_boxes"
                checked={allowPoBoxes}
                onCheckedChange={setAllowPoBoxes}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
