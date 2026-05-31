import { Ionicons } from '@expo/vector-icons';

interface RecordIconProps {
  type: 'bottle' | 'diaper' | 'heart';
  color: string;
  size?: number;
}

export function RecordIcon({ type, color, size = 28 }: RecordIconProps) {
  if (type === 'bottle') {
    return <Ionicons name="water" size={size} color={color} />;
  }

  if (type === 'heart') {
    return <Ionicons name="heart" size={size} color={color} />;
  }

  return <Ionicons name="flower" size={size} color={color} />;
}
