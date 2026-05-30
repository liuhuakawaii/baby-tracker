import { Ionicons } from '@expo/vector-icons';

interface RecordIconProps {
  type: 'bottle' | 'diaper' | 'heart';
  color: string;
  size?: number;
}

export function RecordIcon({ type, color, size = 28 }: RecordIconProps) {
  if (type === 'bottle') {
    return <Ionicons name="wine-outline" size={size} color={color} />;
  }

  if (type === 'heart') {
    return <Ionicons name="heart-circle-outline" size={size} color={color} />;
  }

  return <Ionicons name="leaf-outline" size={size} color={color} />;
}
