import type { UnreviewedAutoStop } from '@/models/types/UnreviewedAutoStop';

export type AttentionBannerProps = {
  items: UnreviewedAutoStop[];
  onSelect(item: UnreviewedAutoStop): void;
};
