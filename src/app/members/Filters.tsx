'use client';

import { Button, Label, ListBox, Select, Slider, Spinner } from '@heroui/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { FaFemale, FaMale } from 'react-icons/fa';

export default function Filters() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const orderByList = [
    { label: 'Order by: Last active', value: 'updated' },
    { label: 'Order by: Newest members', value: 'created' },
  ];

  const genderList = [
    { value: 'male', icon: FaMale },
    { value: 'female', icon: FaFemale },
  ];

  const handleAgeSelect = (value: number[]) => {
    const params = new URLSearchParams(searchParams);
    params.set('ageRange', value.join(','));
    startTransition(() => {
      router.replace(`${pathname}?${params}`);
    });
  };

  return (
    <div className='shadow-md mt-16 w-screen bg-white py-3 px-6 z-40 mx-[calc(50%-50vw)]'>
      <div className='flex flex-row justify-around items-center'>
        <div className='text-accent font-semibold text-xl flex gap-3 items-center'>
          <span>Results:</span>
          {isPending ? <Spinner /> : 10}
        </div>
        <div className='flex gap-2 items-center'>
          <div>Gender:</div>
          {genderList.map(({ icon: Icon, value }) => (
            <Button key={value} size='sm'>
              <Icon size={24} />
            </Button>
          ))}
        </div>
        <div className='flex flex-col gap-2 w-1/4'>
          <Slider
            className='w-full'
            defaultValue={[18, 100]}
            maxValue={100}
            minValue={18}
            step={1}
            onChangeEnd={(value) => handleAgeSelect(value as number[])}>
            <Label>Age range</Label>
            <Slider.Output />
            <Slider.Track>
              {({ state }) => (
                <>
                  <Slider.Fill />
                  {state.values.map((_, i) => (
                    <Slider.Thumb key={i} index={i} />
                  ))}
                </>
              )}
            </Slider.Track>
          </Slider>
        </div>
        <div className='w-1/4'>
          <Select defaultValue='updated' placeholder='Select order' aria-label='order by'>
            <Select.Trigger className='w-full'>
              <Select.Value />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {orderByList.map((item) => (
                  <ListBox.Item key={item.value} id={item.value} textValue={item.value}>
                    {item.label}
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </div>
    </div>
  );
}
