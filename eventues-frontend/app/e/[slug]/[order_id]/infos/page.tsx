'use client';

import PersonalInfoForm from '../../tickets/components/infos/PersonalInfoForm';

export default function OrderInfoPage() {
  return (
      <PersonalInfoForm 
        eventId="exampleEventId" 
        onFormDataChange={(data, isValid) => console.log(data, isValid)} 
      />
  );
}
