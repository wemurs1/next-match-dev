'use client';

import { useSelectedLayoutSegment } from 'next/navigation';

type Props = {
  sections: { name: string; path: string; segment: string | null }[];
};

export default function SectionTitle({ sections }: Props) {
  const active = useSelectedLayoutSegment();
  const title = sections.find((x) => x.segment === active)?.name ?? '';

  return <h2 className='text-2xl font-semibold capitalize text-accent'>{title}</h2>;
}
