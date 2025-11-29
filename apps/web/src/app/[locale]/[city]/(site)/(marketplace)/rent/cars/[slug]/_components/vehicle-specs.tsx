'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatEnumValue, cn } from '@/lib/utils';
import {
  Car,
  Users,
  Cog,
  Fuel,
  DoorOpen,
  Gauge,
  Zap,
  Palette,
  Settings2,
  CircleDot,
  Activity,
  Boxes,
} from 'lucide-react';

interface VehicleData {
  year: number;
  class: string;
  bodyType: string;
  fuelType: string;
  transmissionType: string;
  driveType: string;
  doors: number;
  seats: number;
  engineLayout: string;
  engineDisplacement: number | null;
  cylinders: number | null;
  horsepower: number | null;
  torque: number | null;
  interiorColors: string[];
  exteriorColors: string[];
  model: {
    name: string;
    slug: string;
    brand: {
      name: string;
      slug: string;
      logo: string | null;
    };
  };
  features: {
    code: string;
    name: string;
    category: string;
    iconKey: string | null;
  }[];
}

interface VehicleSpecsProps {
  vehicle: VehicleData;
  title: string;
}

const getClassColor = (vehicleClass: string) => {
  switch (vehicleClass) {
    case 'LUXURY':
      return 'bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950';
    case 'SPORTS':
      return 'bg-gradient-to-r from-red-500 to-rose-500 text-white';
    case 'PREMIUM':
      return 'bg-gradient-to-r from-violet-500 to-purple-500 text-white';
    case 'SUV':
      return 'bg-gradient-to-r from-emerald-500 to-green-500 text-white';
    case 'ECONOMY':
      return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
    default:
      return 'bg-gradient-to-r from-slate-500 to-gray-500 text-white';
  }
};

export default function VehicleSpecs({ vehicle, title }: VehicleSpecsProps) {
  // Group features by category
  const featuresByCategory = vehicle.features.reduce(
    (acc, feature) => {
      if (!acc[feature.category]) {
        acc[feature.category] = [];
      }
      acc[feature.category].push(feature);
      return acc;
    },
    {} as Record<string, typeof vehicle.features>
  );

  return (
    <div className='space-y-6'>
      {/* Hero Section */}
      <div className='space-y-4'>
        <div className='flex items-center gap-4'>
          {vehicle.model.brand.logo && (
            <div className='size-16 rounded-xl bg-muted flex items-center justify-center p-2'>
              <img
                src={vehicle.model.brand.logo}
                alt={vehicle.model.brand.name}
                className='w-full h-full object-contain'
              />
            </div>
          )}
          <div>
            <h1 className='text-3xl font-bold'>{title}</h1>
            <p className='text-lg text-muted-foreground'>
              {vehicle.year} {vehicle.model.brand.name} {vehicle.model.name}
            </p>
          </div>
        </div>

        <div className='flex flex-wrap gap-2'>
          <Badge className={cn('px-3 py-1 text-sm border-0', getClassColor(vehicle.class))}>
            {formatEnumValue(vehicle.class)}
          </Badge>
          <Badge variant='outline' className='px-3 py-1 text-sm'>
            {formatEnumValue(vehicle.bodyType)}
          </Badge>
          <Badge variant='outline' className='px-3 py-1 text-sm'>
            {formatEnumValue(vehicle.fuelType)}
          </Badge>
          <Badge variant='outline' className='px-3 py-1 text-sm'>
            {formatEnumValue(vehicle.transmissionType)}
          </Badge>
        </div>
      </div>

      {/* Quick Specs Grid */}
      <Card>
        <CardContent className='py-6'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
            <SpecItem icon={Users} label='Seats' value={vehicle.seats.toString()} color='blue' />
            <SpecItem icon={DoorOpen} label='Doors' value={vehicle.doors.toString()} color='green' />
            <SpecItem icon={Cog} label='Transmission' value={formatEnumValue(vehicle.transmissionType)} color='purple' />
            <SpecItem icon={Fuel} label='Fuel Type' value={formatEnumValue(vehicle.fuelType)} color='amber' />
          </div>
        </CardContent>
      </Card>

      {/* Engine Specifications */}
      {(vehicle.horsepower || vehicle.torque || vehicle.engineDisplacement || vehicle.cylinders) && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Activity className='size-5' />
              Engine & Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
              {vehicle.horsepower && (
                <div className='space-y-1'>
                  <p className='text-sm text-muted-foreground'>Horsepower</p>
                  <p className='text-2xl font-bold text-primary'>{vehicle.horsepower} HP</p>
                </div>
              )}
              {vehicle.torque && (
                <div className='space-y-1'>
                  <p className='text-sm text-muted-foreground'>Torque</p>
                  <p className='text-2xl font-bold'>{vehicle.torque} Nm</p>
                </div>
              )}
              {vehicle.engineDisplacement && (
                <div className='space-y-1'>
                  <p className='text-sm text-muted-foreground'>Engine</p>
                  <p className='text-2xl font-bold'>{(vehicle.engineDisplacement / 1000).toFixed(1)}L</p>
                </div>
              )}
              {vehicle.cylinders && (
                <div className='space-y-1'>
                  <p className='text-sm text-muted-foreground'>Cylinders</p>
                  <p className='text-2xl font-bold'>{vehicle.cylinders}</p>
                </div>
              )}
            </div>

            <Separator className='my-4' />

            <div className='grid grid-cols-2 gap-4'>
              <div className='flex items-center gap-3'>
                <div className='size-10 rounded-lg bg-muted flex items-center justify-center'>
                  <Settings2 className='size-5 text-muted-foreground' />
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>Engine Layout</p>
                  <p className='font-medium'>{formatEnumValue(vehicle.engineLayout)}</p>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <div className='size-10 rounded-lg bg-muted flex items-center justify-center'>
                  <CircleDot className='size-5 text-muted-foreground' />
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>Drive Type</p>
                  <p className='font-medium'>{formatEnumValue(vehicle.driveType)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Colors */}
      {(vehicle.exteriorColors.length > 0 || vehicle.interiorColors.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Palette className='size-5' />
              Colors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {vehicle.exteriorColors.length > 0 && (
                <div>
                  <p className='text-sm text-muted-foreground mb-2'>Exterior</p>
                  <div className='flex flex-wrap gap-2'>
                    {vehicle.exteriorColors.map((color) => (
                      <Badge key={color} variant='secondary' className='px-3 py-1'>
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {vehicle.interiorColors.length > 0 && (
                <div>
                  <p className='text-sm text-muted-foreground mb-2'>Interior</p>
                  <div className='flex flex-wrap gap-2'>
                    {vehicle.interiorColors.map((color) => (
                      <Badge key={color} variant='secondary' className='px-3 py-1'>
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features */}
      {vehicle.features.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Boxes className='size-5' />
              Features & Amenities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              {Object.entries(featuresByCategory).map(([category, features]) => (
                <div key={category}>
                  <p className='text-sm font-medium text-muted-foreground mb-3'>{category}</p>
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                    {features.map((feature) => (
                      <div
                        key={feature.code}
                        className='flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors'
                      >
                        <div className='size-6 rounded-full bg-primary/10 flex items-center justify-center'>
                          <Zap className='size-3.5 text-primary' />
                        </div>
                        <span className='text-sm'>{feature.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper component for spec items
function SpecItem({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'purple' | 'amber';
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30',
  };

  return (
    <div className='flex items-center gap-3'>
      <div className={cn('flex size-12 items-center justify-center rounded-xl', colorClasses[color])}>
        <Icon className='size-6' />
      </div>
      <div>
        <p className='text-sm text-muted-foreground'>{label}</p>
        <p className='font-semibold'>{value}</p>
      </div>
    </div>
  );
}

