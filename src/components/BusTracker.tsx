import React from 'react';
import { BusDetails } from '../types';

interface BusTrackerProps {
  buses: BusDetails[];
}

const BusTracker: React.FC<BusTrackerProps> = ({ buses }) => {
  // No movement functionality - buses remain stationary
  return null; // This component doesn't render anything
};

export default BusTracker; 