import TextInput from '@/components/TextInput';
import { RegisterSchema } from '@/lib/schemas/registerSchema';
import { Control } from 'react-hook-form';

type Props = {
  control: Control<RegisterSchema>;
};

export default function UserForm({ control }: Props) {
  return (
    <div>
      <TextInput control={control} name='name' label='Display name' placeholder='Enter your preferred name' />
      <TextInput control={control} name='email' label='Email' placeholder='Enter your email' />
      <TextInput control={control} name='password' type='password' label='Password' />
      <TextInput control={control} name='confirmPassword' type='password' label='Confirm password' />
    </div>
  );
}
